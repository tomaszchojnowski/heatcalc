/**
 * State Management
 * Central state store with observer pattern for reactive UI updates.
 * Simple pub-sub system without external dependencies.
 */

/**
 * Application state
 */
const state = {
  // User input
  postcode: null,
  propertyType: null,
  climateData: null,
  
  // Building data
  building: null,
  
  // Calculation results
  heatLoss: {
    total: 0,
    breakdown: null,
    calculated: false
  },
  
  // Pricing results
  pricing: {
    heatPump: null,
    boiler: null,
    selectedSystem: 'heatPump',
    includeGrants: true
  },
  
  // UI state
  currentScreen: 'input',
  loading: false,
  errors: [],
  
  // Modifications
  modifications: [],
  hasUnsavedChanges: false,
  
  // History for undo/redo
  history: [],
  historyIndex: -1,
  maxHistorySize: 20
};

/**
 * Observers - callbacks that fire when state changes
 */
const observers = new Map();
let observerId = 0;

/**
 * Subscribe to state changes
 * @param {Function} callback - Function to call when state changes
 * @param {Array} paths - Optional: only trigger for specific state paths
 * @returns {Function} Unsubscribe function
 */
export function subscribe(callback, paths = null) {
  const id = observerId++;
  observers.set(id, { callback, paths });
  
  // Return unsubscribe function
  return () => {
    observers.delete(id);
  };
}

/**
 * Notify all observers of state change
 */
function notify(changedPaths = []) {
  observers.forEach(({ callback, paths }) => {
    // If observer has specific paths, only call if those paths changed
    if (paths && paths.length > 0) {
      const shouldNotify = paths.some(path => 
        changedPaths.some(changed => changed.startsWith(path))
      );
      if (!shouldNotify) return;
    }
    
    // Call observer with current state
    callback(getState());
  });
}

/**
 * Get current state (returns copy to prevent direct mutation)
 */
export function getState() {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Get specific value from state by path
 * @param {String} path - Dot notation path (e.g., 'heatLoss.total')
 */
export function getValue(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], state);
}

/**
 * Update state
 * @param {Object} updates - Object with state updates
 * @param {Boolean} addToHistory - Whether to save to undo history
 */
export function setState(updates, addToHistory = false) {
  const changedPaths = [];
  
  // Apply updates
  Object.keys(updates).forEach(key => {
    if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && updates[key] !== null) {
      // Merge nested objects
      state[key] = { ...state[key], ...updates[key] };
    } else {
      state[key] = updates[key];
    }
    changedPaths.push(key);
  });
  
  // Add to history if requested
  if (addToHistory && state.building) {
    pushToHistory();
  }
  
  // Mark as having unsaved changes if building data changed
  if (updates.building || updates.modifications) {
    state.hasUnsavedChanges = true;
  }
  
  // Notify observers
  notify(changedPaths);
}

/**
 * Reset state to initial values
 */
export function resetState() {
  Object.keys(state).forEach(key => {
    if (key === 'currentScreen') {
      state[key] = 'input';
    } else if (typeof state[key] === 'object' && !Array.isArray(state[key])) {
      state[key] = {};
    } else if (Array.isArray(state[key])) {
      state[key] = [];
    } else if (typeof state[key] === 'boolean') {
      state[key] = false;
    } else if (typeof state[key] === 'number') {
      state[key] = 0;
    } else {
      state[key] = null;
    }
  });
  
  state.currentScreen = 'input';
  state.pricing.selectedSystem = 'heatPump';
  state.pricing.includeGrants = true;
  
  notify(['reset']);
}

/**
 * Set loading state
 */
export function setLoading(loading, message = null) {
  setState({
    loading: loading,
    loadingMessage: message
  });
}

/**
 * Add error
 */
export function addError(error) {
  state.errors.push({
    message: error,
    timestamp: Date.now()
  });
  notify(['errors']);
}

/**
 * Clear errors
 */
export function clearErrors() {
  state.errors = [];
  notify(['errors']);
}

/**
 * Set current screen
 */
export function setScreen(screenName) {
  setState({ currentScreen: screenName });
}

/**
 * Set postcode and fetch climate data
 */
export function setPostcode(postcode, climateData) {
  setState({
    postcode: postcode,
    climateData: climateData
  });
}

/**
 * Set building from template
 */
export function setBuilding(building) {
  setState({ building: building }, true);
}

/**
 * Update building (for edits)
 */
export function updateBuilding(building) {
  setState({ building: building }, true);
}

/**
 * Set heat loss results
 */
export function setHeatLoss(total, breakdown) {
  setState({
    heatLoss: {
      total: total,
      breakdown: breakdown,
      calculated: true
    }
  });
}

/**
 * Set pricing results
 */
export function setPricing(heatPump, boiler) {
  setState({
    pricing: {
      ...state.pricing,
      heatPump: heatPump,
      boiler: boiler
    }
  });
}

/**
 * Select system type
 */
export function selectSystem(systemType) {
  setState({
    pricing: {
      ...state.pricing,
      selectedSystem: systemType
    }
  });
}

/**
 * Toggle grants
 */
export function toggleGrants() {
  setState({
    pricing: {
      ...state.pricing,
      includeGrants: !state.pricing.includeGrants
    }
  });
}

/**
 * Add modification (extension, conversion, etc.)
 */
export function addModification(modification) {
  state.modifications.push({
    id: Date.now(),
    ...modification
  });
  notify(['modifications']);
}

/**
 * Remove modification
 */
export function removeModification(modificationId) {
  state.modifications = state.modifications.filter(m => m.id !== modificationId);
  notify(['modifications']);
}

/**
 * History management - Push current state to history
 */
function pushToHistory() {
  // Remove any future history if we're not at the end
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  // Add current building state to history
  state.history.push({
    building: state.building?.toJSON(),
    timestamp: Date.now()
  });
  
  // Limit history size
  if (state.history.length > state.maxHistorySize) {
    state.history.shift();
  } else {
    state.historyIndex++;
  }
}

/**
 * Undo last change
 */
export function undo() {
  if (state.historyIndex <= 0) return false;
  
  state.historyIndex--;
  const historyItem = state.history[state.historyIndex];
  
  // Restore building from history
  if (historyItem.building) {
    const Building = window.Building; // Access from global (or import)
    state.building = Building.fromJSON(historyItem.building);
    notify(['building', 'history']);
    return true;
  }
  
  return false;
}

/**
 * Redo last undone change
 */
export function redo() {
  if (state.historyIndex >= state.history.length - 1) return false;
  
  state.historyIndex++;
  const historyItem = state.history[state.historyIndex];
  
  // Restore building from history
  if (historyItem.building) {
    const Building = window.Building;
    state.building = Building.fromJSON(historyItem.building);
    notify(['building', 'history']);
    return true;
  }
  
  return false;
}

/**
 * Check if undo is available
 */
export function canUndo() {
  return state.historyIndex > 0;
}

/**
 * Check if redo is available
 */
export function canRedo() {
  return state.historyIndex < state.history.length - 1;
}

/**
 * Serialize state to JSON
 */
export function serializeState() {
  return JSON.stringify({
    postcode: state.postcode,
    propertyType: state.propertyType,
    climateData: state.climateData,
    building: state.building?.toJSON(),
    modifications: state.modifications,
    pricing: {
      selectedSystem: state.pricing.selectedSystem,
      includeGrants: state.pricing.includeGrants
    }
  });
}

/**
 * Deserialize state from JSON
 */
export function deserializeState(json) {
  try {
    const data = JSON.parse(json);
    
    // Restore building if present
    if (data.building) {
      const Building = window.Building;
      state.building = Building.fromJSON(data.building);
    }
    
    // Restore other state
    state.postcode = data.postcode || null;
    state.propertyType = data.propertyType || null;
    state.climateData = data.climateData || null;
    state.modifications = data.modifications || [];
    
    if (data.pricing) {
      state.pricing.selectedSystem = data.pricing.selectedSystem || 'heatPump';
      state.pricing.includeGrants = data.pricing.includeGrants !== false;
    }
    
    notify(['all']);
    return true;
  } catch (error) {
    addError(`Failed to load state: ${error.message}`);
    return false;
  }
}

/**
 * Save state to localStorage
 */
export function saveToLocalStorage(key = 'heatingAppState') {
  try {
    const json = serializeState();
    localStorage.setItem(key, json);
    state.hasUnsavedChanges = false;
    return true;
  } catch (error) {
    addError(`Failed to save: ${error.message}`);
    return false;
  }
}

/**
 * Load state from localStorage
 */
export function loadFromLocalStorage(key = 'heatingAppState') {
  try {
    const json = localStorage.getItem(key);
    if (!json) return false;
    
    return deserializeState(json);
  } catch (error) {
    addError(`Failed to load: ${error.message}`);
    return false;
  }
}

/**
 * Clear localStorage
 */
export function clearLocalStorage(key = 'heatingAppState') {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    addError(`Failed to clear: ${error.message}`);
    return false;
  }
}

/**
 * Auto-save functionality
 */
let autoSaveInterval = null;

/**
 * Enable auto-save
 */
export function enableAutoSave(intervalMs = 30000) {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  autoSaveInterval = setInterval(() => {
    if (state.hasUnsavedChanges && state.building) {
      saveToLocalStorage();
    }
  }, intervalMs);
}

/**
 * Disable auto-save
 */
export function disableAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

/**
 * Debug helper - log current state
 */
export function debugState() {
  console.log('Current State:', state);
  console.log('Observers:', observers.size);
  console.log('History:', state.history.length, 'Index:', state.historyIndex);
}

/**
 * Export for development/debugging
 */
if (typeof window !== 'undefined') {
  window.__debugState = debugState;
}
