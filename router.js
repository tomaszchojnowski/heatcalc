/**
 * Router
 * Simple screen navigation system with history support and transitions.
 */

/**
 * Registered screens
 */
const screens = new Map();

/**
 * Current active screen
 */
let currentScreen = null;

/**
 * Navigation history
 */
const history = [];
let historyIndex = -1;

/**
 * Router configuration
 */
const config = {
  container: null,
  defaultScreen: 'input',
  transitionDuration: 300,
  onNavigate: null
};

/**
 * Initialize router
 * @param {Object} options - Router configuration
 */
export function initRouter(options = {}) {
  Object.assign(config, options);
  
  if (!config.container) {
    config.container = document.body;
  }
  
  console.log('Router initialized', { defaultScreen: config.defaultScreen });
}

/**
 * Register a screen
 * @param {String} name - Screen identifier
 * @param {Object} screenInstance - Screen object with enter/exit methods
 */
export function registerScreen(name, screenInstance) {
  if (!screenInstance.enter || !screenInstance.exit) {
    throw new Error(`Screen "${name}" must have enter() and exit() methods`);
  }
  
  screens.set(name, screenInstance);
  console.log(`Screen registered: ${name}`);
}

/**
 * Navigate to a screen
 * @param {String} screenName - Screen to navigate to
 * @param {Object} data - Data to pass to the screen
 * @param {Boolean} addToHistory - Whether to add to navigation history
 */
export function navigateTo(screenName, data = {}, addToHistory = true) {
  const nextScreen = screens.get(screenName);
  
  if (!nextScreen) {
    console.error(`Screen "${screenName}" not found`);
    return false;
  }
  
  console.log(`Navigating: ${currentScreen?.name || 'none'} → ${screenName}`);
  
  // Call onNavigate callback if provided
  if (config.onNavigate) {
    config.onNavigate(screenName, data);
  }
  
  // Add to history
  if (addToHistory) {
    // Remove any forward history if we're not at the end
    if (historyIndex < history.length - 1) {
      history.splice(historyIndex + 1);
    }
    
    history.push({ screen: screenName, data });
    historyIndex++;
  }
  
  // Perform transition
  performTransition(currentScreen, nextScreen, data);
  
  return true;
}

/**
 * Perform screen transition
 */
async function performTransition(fromScreen, toScreen, data) {
  const container = config.container;
  
  // Exit current screen
  if (fromScreen) {
    try {
      await fromScreen.exit();
    } catch (error) {
      console.error('Error exiting screen:', error);
    }
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Enter new screen
  try {
    await toScreen.enter(container, data);
    currentScreen = toScreen;
  } catch (error) {
    console.error('Error entering screen:', error);
    
    // Fallback to default screen on error
    if (toScreen.name !== config.defaultScreen) {
      console.log('Falling back to default screen');
      navigateTo(config.defaultScreen, {}, false);
    }
  }
}

/**
 * Go back in navigation history
 */
export function goBack() {
  if (!canGoBack()) {
    console.log('Cannot go back - at start of history');
    return false;
  }
  
  historyIndex--;
  const historyItem = history[historyIndex];
  
  // Navigate without adding to history
  navigateTo(historyItem.screen, historyItem.data, false);
  
  return true;
}

/**
 * Go forward in navigation history
 */
export function goForward() {
  if (!canGoForward()) {
    console.log('Cannot go forward - at end of history');
    return false;
  }
  
  historyIndex++;
  const historyItem = history[historyIndex];
  
  // Navigate without adding to history
  navigateTo(historyItem.screen, historyItem.data, false);
  
  return true;
}

/**
 * Check if can go back
 */
export function canGoBack() {
  return historyIndex > 0;
}

/**
 * Check if can go forward
 */
export function canGoForward() {
  return historyIndex < history.length - 1;
}

/**
 * Get current screen name
 */
export function getCurrentScreen() {
  return currentScreen?.name || null;
}

/**
 * Get navigation history
 */
export function getHistory() {
  return {
    items: [...history],
    currentIndex: historyIndex
  };
}

/**
 * Clear navigation history
 */
export function clearHistory() {
  history.length = 0;
  historyIndex = -1;
}

/**
 * Replace current screen (useful for redirects)
 * @param {String} screenName - Screen to navigate to
 * @param {Object} data - Data to pass
 */
export function replaceWith(screenName, data = {}) {
  if (historyIndex >= 0) {
    // Replace current history item
    history[historyIndex] = { screen: screenName, data };
  }
  
  return navigateTo(screenName, data, historyIndex < 0);
}

/**
 * Create a simple screen object
 * Utility to create basic screens without classes
 */
export function createScreen(name, renderFn, exitFn = null) {
  return {
    name,
    async enter(container, data) {
      await renderFn(container, data);
    },
    async exit() {
      if (exitFn) {
        await exitFn();
      }
    }
  };
}

/**
 * Navigation helpers for common patterns
 */
export const nav = {
  toInput: (data) => navigateTo('input', data),
  toLoading: (message) => navigateTo('loading', { message }),
  toResults: (data) => navigateTo('results', data),
  toEdit: (data) => navigateTo('edit', data),
  toModifications: (data) => navigateTo('modifications', data),
  back: () => goBack(),
  forward: () => goForward()
};

/**
 * Debug helper
 */
export function debugRouter() {
  console.log('Router State:', {
    currentScreen: currentScreen?.name,
    registeredScreens: Array.from(screens.keys()),
    history: history,
    historyIndex: historyIndex,
    canGoBack: canGoBack(),
    canGoForward: canGoForward()
  });
}

// Export for debugging in console
if (typeof window !== 'undefined') {
  window.__debugRouter = debugRouter;
}