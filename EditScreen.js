/**
 * Edit Screen
 * Fine-tune building dimensions and construction properties.
 */

import { getState, updateBuilding, undo, redo, canUndo, canRedo } from './state.js';
import { HeatLossCalculator } from './HeatLossCalculator.js';
import { setHeatLoss, setPricing } from './state.js';
import { calculateSystemCost } from './pricingData.js';
import { navigateTo } from './router.js';
import { Building } from './Building.js';

export class EditScreen {
  constructor() {
    this.name = 'edit';
    this.container = null;
    this.building = null;
    this.selectedSpace = null;
    this.unsubscribeState = null;
  }
  
  /**
   * Enter screen
   */
  async enter(container, data = {}) {
    this.container = container;
    const state = getState();
    
    if (!state.building) {
      console.error('No building data available');
      navigateTo('input');
      return;
    }
    
    // Ensure building is a Building instance
    if (typeof state.building.getAllSpaces !== 'function') {
      this.building = Building.fromJSON(state.building);
    } else {
      this.building = state.building;
    }
    
    this.render();
    this.attachEventListeners();
  }
  
  /**
   * Exit screen
   */
  async exit() {
    if (this.unsubscribeState) {
      this.unsubscribeState();
    }
  }
  
  /**
   * Render screen
   */
  render() {
    const html = `
      <div class="edit-screen">
        <!-- Header with undo/redo -->
        <div class="edit-header">
          <div class="container flex justify-between items-center">
            <h1>Fine-Tune Your Property</h1>
            <div class="edit-actions flex gap-sm">
              <button id="undoBtn" class="btn btn-secondary btn-sm" ${!canUndo() ? 'disabled' : ''}>
                ← Undo
              </button>
              <button id="redoBtn" class="btn btn-secondary btn-sm" ${!canRedo() ? 'disabled' : ''}>
                Redo →
              </button>
              <button id="doneBtn" class="btn btn-solid">
                Done
              </button>
            </div>
          </div>
        </div>
        
        <div class="container">
          <!-- Space Selection -->
          <div class="section">
            <div class="glass-card">
              <h2>Select Space to Edit</h2>
              <div id="spacesList" class="spaces-list">
                ${this.renderSpacesList()}
              </div>
            </div>
          </div>
          
          <!-- Space Editor (shown when space selected) -->
          <div id="spaceEditor" class="section" style="display: none;">
            <div class="glass-card">
              <h2 id="spaceEditorTitle">Edit Space</h2>
              
              <!-- Dimensions -->
              <div class="form-section">
                <h3>Dimensions</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="label" for="spaceWidth">Width (m)</label>
                    <input type="number" id="spaceWidth" class="input" step="0.1" min="0.5">
                  </div>
                  <div class="form-group">
                    <label class="label" for="spaceDepth">Depth (m)</label>
                    <input type="number" id="spaceDepth" class="input" step="0.1" min="0.5">
                  </div>
                  <div class="form-group">
                    <label class="label" for="spaceHeight">Height (m)</label>
                    <input type="number" id="spaceHeight" class="input" step="0.1" min="2.0">
                  </div>
                </div>
                
                <div class="calculated-values mt-md">
                  <div class="calc-value">
                    <span class="calc-label">Floor Area:</span>
                    <span id="calcArea" class="calc-number">-</span>
                  </div>
                  <div class="calc-value">
                    <span class="calc-label">Volume:</span>
                    <span id="calcVolume" class="calc-number">-</span>
                  </div>
                </div>
              </div>
              
              <!-- Construction Properties -->
              <div class="form-section mt-lg">
                <h3>Construction Type</h3>
                
                <!-- Floor Construction -->
                <div class="form-group">
                  <label class="label">Floor Construction</label>
                  <div id="floorConstructionInfo" class="construction-info">
                    <span class="construction-type">-</span>
                    <span class="construction-uvalue">U-value: -</span>
                  </div>
                  <button class="btn btn-secondary btn-sm mt-sm" onclick="alert('Floor construction editor - Coming soon!')">
                    Change Floor Type
                  </button>
                </div>
                
                <!-- Wall Construction -->
                <div class="form-group">
                  <label class="label">Wall Construction</label>
                  <div id="wallConstructionInfo" class="construction-info">
                    <span class="construction-type">-</span>
                    <span class="construction-uvalue">U-value: -</span>
                  </div>
                  <button class="btn btn-secondary btn-sm mt-sm" onclick="alert('Wall construction editor - Coming soon!')">
                    Change Wall Type
                  </button>
                </div>
                
                <!-- Ceiling Construction -->
                <div class="form-group">
                  <label class="label">Ceiling Construction</label>
                  <div id="ceilingConstructionInfo" class="construction-info">
                    <span class="construction-type">-</span>
                    <span class="construction-uvalue">U-value: -</span>
                  </div>
                  <button class="btn btn-secondary btn-sm mt-sm" onclick="alert('Ceiling construction editor - Coming soon!')">
                    Change Ceiling Type
                  </button>
                </div>
              </div>
              
              <!-- Apply Changes Button -->
              <button id="applyChangesBtn" class="btn btn-primary btn-full btn-lg mt-lg">
                Apply Changes & Recalculate
              </button>
            </div>
          </div>
          
          <!-- Current Results Summary -->
          <div class="section">
            <div class="glass-card">
              <h2>Current Estimate</h2>
              <div class="results-summary">
                <div class="summary-metric">
                  <span class="summary-label">Total Heat Loss</span>
                  <span class="summary-value" id="currentHeatLoss">-</span>
                </div>
                <div class="summary-metric">
                  <span class="summary-label">System Cost</span>
                  <span class="summary-value" id="currentCost">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    this.updateCurrentResults();
  }
  
  /**
   * Render spaces list
   */
  renderSpacesList() {
    let html = '';
    
    Object.keys(this.building.floors).forEach(floorKey => {
      const floor = this.building.floors[floorKey];
      
      html += `<div class="floor-group">`;
      html += `<div class="floor-title">${floor.name}</div>`;
      
      floor.spaces.forEach(space => {
        const isSelected = this.selectedSpace?.id === space.id;
        html += `
          <div class="space-item ${isSelected ? 'selected' : ''}" data-space-id="${space.id}">
            <div class="space-name">${space.name}</div>
            <div class="space-dims">${space.width.toFixed(1)}m × ${space.depth.toFixed(1)}m</div>
          </div>
        `;
      });
      
      html += `</div>`;
    });
    
    return html;
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Space selection
    const spaceItems = document.querySelectorAll('.space-item');
    spaceItems.forEach(item => {
      item.addEventListener('click', () => {
        const spaceId = item.dataset.spaceId;
        this.selectSpace(spaceId);
      });
    });
    
    // Dimension inputs
    const widthInput = document.getElementById('spaceWidth');
    const depthInput = document.getElementById('spaceDepth');
    const heightInput = document.getElementById('spaceHeight');
    
    if (widthInput) {
      widthInput.addEventListener('input', () => this.updateCalculatedValues());
      depthInput.addEventListener('input', () => this.updateCalculatedValues());
      heightInput.addEventListener('input', () => this.updateCalculatedValues());
    }
    
    // Apply changes button
    const applyBtn = document.getElementById('applyChangesBtn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyChanges());
    }
    
    // Undo/Redo buttons
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
      undoBtn.addEventListener('click', () => this.handleUndo());
    }
    
    if (redoBtn) {
      redoBtn.addEventListener('click', () => this.handleRedo());
    }
    
    // Done button
    const doneBtn = document.getElementById('doneBtn');
    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        navigateTo('results');
      });
    }
  }
  
  /**
   * Select a space to edit
   */
  selectSpace(spaceId) {
    this.selectedSpace = this.building.getSpace(spaceId);
    
    if (!this.selectedSpace) return;
    
    // Update UI
    document.querySelectorAll('.space-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.spaceId === spaceId);
    });
    
    // Show editor
    const editor = document.getElementById('spaceEditor');
    editor.style.display = 'block';
    
    // Update title
    document.getElementById('spaceEditorTitle').textContent = `Edit: ${this.selectedSpace.name}`;
    
    // Fill in current values
    document.getElementById('spaceWidth').value = this.selectedSpace.width.toFixed(1);
    document.getElementById('spaceDepth').value = this.selectedSpace.depth.toFixed(1);
    document.getElementById('spaceHeight').value = this.selectedSpace.height.toFixed(1);
    
    // Update construction info
    this.updateConstructionInfo();
    this.updateCalculatedValues();
    
    // Scroll to editor
    editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  
  /**
   * Update construction info display
   */
  updateConstructionInfo() {
    if (!this.selectedSpace) return;
    
    // Floor
    const floorInfo = document.getElementById('floorConstructionInfo');
    if (this.selectedSpace.floorConstruction) {
      floorInfo.innerHTML = `
        <span class="construction-type">${this.selectedSpace.floorConstruction.description || this.selectedSpace.floorConstruction.type}</span>
        <span class="construction-uvalue">U-value: ${this.selectedSpace.floorConstruction.uValue.toFixed(2)} W/m²K</span>
      `;
    }
    
    // Walls (show first wall as example)
    const wallInfo = document.getElementById('wallConstructionInfo');
    const firstWall = this.selectedSpace.wallConstruction.north;
    if (firstWall) {
      wallInfo.innerHTML = `
        <span class="construction-type">${firstWall.description || firstWall.type}</span>
        <span class="construction-uvalue">U-value: ${firstWall.uValue.toFixed(2)} W/m²K</span>
      `;
    }
    
    // Ceiling
    const ceilingInfo = document.getElementById('ceilingConstructionInfo');
    if (this.selectedSpace.ceilingConstruction) {
      ceilingInfo.innerHTML = `
        <span class="construction-type">${this.selectedSpace.ceilingConstruction.description || this.selectedSpace.ceilingConstruction.type}</span>
        <span class="construction-uvalue">U-value: ${this.selectedSpace.ceilingConstruction.uValue.toFixed(2)} W/m²K</span>
      `;
    }
  }
  
  /**
   * Update calculated values (area, volume)
   */
  updateCalculatedValues() {
    const width = parseFloat(document.getElementById('spaceWidth').value);
    const depth = parseFloat(document.getElementById('spaceDepth').value);
    const height = parseFloat(document.getElementById('spaceHeight').value);
    
    if (isNaN(width) || isNaN(depth) || isNaN(height)) return;
    
    const area = width * depth;
    const volume = width * depth * height;
    
    document.getElementById('calcArea').textContent = `${area.toFixed(2)} m²`;
    document.getElementById('calcVolume').textContent = `${volume.toFixed(2)} m³`;
  }
  
  /**
   * Apply changes and recalculate
   */
  async applyChanges() {
    if (!this.selectedSpace) return;
    
    const width = parseFloat(document.getElementById('spaceWidth').value);
    const depth = parseFloat(document.getElementById('spaceDepth').value);
    const height = parseFloat(document.getElementById('spaceHeight').value);
    
    if (isNaN(width) || isNaN(depth) || isNaN(height)) {
      alert('Please enter valid dimensions');
      return;
    }
    
    // Update space dimensions
    this.selectedSpace.setDimensions(width, depth, height);
    
    // Update building in state (adds to history)
    updateBuilding(this.building);
    
    // Show loading state
    const applyBtn = document.getElementById('applyChangesBtn');
    applyBtn.disabled = true;
    applyBtn.textContent = 'Recalculating...';
    
    // Recalculate
    await this.recalculate();
    
    // Update UI
    applyBtn.disabled = false;
    applyBtn.textContent = 'Apply Changes & Recalculate';
    
    // Refresh spaces list to show new dimensions
    document.getElementById('spacesList').innerHTML = this.renderSpacesList();
    this.attachEventListeners();
    
    // Update undo/redo buttons
    this.updateUndoRedoButtons();
    
    // Show success
    alert('✓ Changes applied and heat loss recalculated');
  }
  
  /**
   * Recalculate heat loss and pricing
   */
  async recalculate() {
    const state = getState();
    
    // Create climate config
    const climateConfig = {
      externalDesignTemp: state.climateData.externalDesignTemp,
      internalDesignTemp: 21,
      internalDesignTempBedroom: 18,
      windExposure: state.climateData.windExposure
    };
    
    // Calculate heat loss
    const calculator = new HeatLossCalculator(climateConfig);
    const breakdown = calculator.calculate(this.building);
    
    // Update state
    setHeatLoss(this.building.totalHeatLoss, breakdown);
    
    // Calculate costs
    const heatPumpCost = calculateSystemCost(this.building, 'heatPump', true);
    const boilerCost = calculateSystemCost(this.building, 'boiler', false);
    
    setPricing(heatPumpCost, boilerCost);
    
    // Update current results display
    this.updateCurrentResults();
  }
  
  /**
   * Update current results summary
   */
  updateCurrentResults() {
    const state = getState();
    
    const heatLossEl = document.getElementById('currentHeatLoss');
    const costEl = document.getElementById('currentCost');
    
    if (heatLossEl && state.heatLoss.calculated) {
      heatLossEl.textContent = `${state.heatLoss.total.toFixed(2)} kW`;
    }
    
    if (costEl && state.pricing.heatPump) {
      costEl.textContent = `£${state.pricing.heatPump.finalCost.toLocaleString()}`;
    }
  }
  
  /**
   * Handle undo
   */
  async handleUndo() {
    if (undo()) {
      // Reload building from state
      const state = getState();
      this.building = Building.fromJSON(state.building);
      
      // Recalculate
      await this.recalculate();
      
      // Re-render
      this.render();
      this.attachEventListeners();
      
      // Reselect current space if it still exists
      if (this.selectedSpace) {
        const space = this.building.getSpace(this.selectedSpace.id);
        if (space) {
          this.selectSpace(space.id);
        }
      }
    }
  }
  
  /**
   * Handle redo
   */
  async handleRedo() {
    if (redo()) {
      // Reload building from state
      const state = getState();
      this.building = Building.fromJSON(state.building);
      
      // Recalculate
      await this.recalculate();
      
      // Re-render
      this.render();
      this.attachEventListeners();
      
      // Reselect current space if it still exists
      if (this.selectedSpace) {
        const space = this.building.getSpace(this.selectedSpace.id);
        if (space) {
          this.selectSpace(space.id);
        }
      }
    }
  }
  
  /**
   * Update undo/redo button states
   */
  updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
      undoBtn.disabled = !canUndo();
    }
    
    if (redoBtn) {
      redoBtn.disabled = !canRedo();
    }
  }
}

// Styles
const styles = `
  .edit-screen {
    min-height: 100vh;
    padding-bottom: var(--spacing-2xl);
  }
  
  .edit-header {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: var(--spacing-lg) 0;
    margin-bottom: var(--spacing-xl);
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
  }
  
  .edit-header h1 {
    font-size: 1.5rem;
    margin: 0;
  }
  
  .spaces-list {
    display: grid;
    gap: var(--spacing-md);
  }
  
  .floor-group {
    margin-bottom: var(--spacing-md);
  }
  
  .floor-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .space-item {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    cursor: pointer;
    transition: all var(--transition-base);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .space-item:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateX(4px);
  }
  
  .space-item.selected {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  
  .space-name {
    font-weight: 600;
  }
  
  .space-dims {
    font-size: 0.875rem;
    color: var(--text-tertiary);
  }
  
  .form-section {
    margin: var(--spacing-lg) 0;
    padding: var(--spacing-lg) 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .form-section:first-child {
    border-top: none;
    margin-top: 0;
    padding-top: 0;
  }
  
  .form-section h3 {
    font-size: 1.125rem;
    margin-bottom: var(--spacing-md);
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
  }
  
  .calculated-values {
    display: flex;
    gap: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.1);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
  }
  
  .calc-value {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .calc-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
  
  .calc-number {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent);
  }
  
  .construction-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    background: rgba(255, 255, 255, 0.1);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
  }
  
  .construction-type {
    font-weight: 600;
  }
  
  .construction-uvalue {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .results-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .summary-metric {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
  
  .summary-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .summary-value {
    font-size: 2rem;
    font-weight: 800;
    color: var(--accent);
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('edit-screen-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'edit-screen-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}