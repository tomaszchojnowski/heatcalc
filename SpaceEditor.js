/**
 * Space Editor Screen
 * Edit individual room dimensions with live 3D preview
 */

import { getState, updateBuilding } from './state.js';
import { navigateTo } from './router.js';
import { Building } from './Building.js';
import { ModelViewer3D } from './ModelViewer3D.js';

export class SpaceEditor {
  constructor() {
    this.name = 'spaceEditor';
    this.container = null;
    this.building = null;
    this.originalBuilding = null; // For cancellation
    this.selectedFloor = 'ground';
    this.selectedSpace = null;
    this.modelViewer = null;
    this.isUpdating = false; // Prevent feedback loops
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
    
    // Create working copy of building
    if (typeof state.building.getAllSpaces !== 'function') {
      this.building = Building.fromJSON(state.building);
    } else {
      this.building = state.building;
    }
    
    // Store original for cancel
    this.originalBuilding = Building.fromJSON(this.building.toJSON());
    
    this.render();
    this.attachEventListeners();
    this.initialize3DViewer();
  }
  
  /**
   * Exit screen
   */
  async exit() {
    if (this.modelViewer) {
      this.modelViewer.dispose();
      this.modelViewer = null;
    }
  }
  
  /**
   * Render screen
   */
  render() {
    const spaces = this.building.getAllSpaces();
    const floorSpaces = spaces.filter(s => s.floorKey === this.selectedFloor);
    
    const html = `
      <div class="space-editor">
        <!-- Header -->
        <div class="status-bar">
          <div class="container flex justify-between items-center">
            <h1>Edit Room Dimensions</h1>
            <div class="flex gap-sm">
              <button id="cancelBtn" class="btn btn-secondary">
                Cancel
              </button>
              <button id="saveBtn" class="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
        
        <div class="container" style="max-width: 1400px;">
          <div style="display: grid; grid-template-columns: 400px 1fr; gap: var(--spacing-lg); margin-top: var(--spacing-lg);">
            
            <!-- Left Panel: Room List & Dimension Editor -->
            <div>
              <!-- Floor Selector -->
              <div class="glass-card" style="margin-bottom: var(--spacing-md);">
                <div class="flex gap-sm">
                  ${this.renderFloorTabs()}
                </div>
              </div>
              
              <!-- Room List -->
              <div class="glass-card" style="margin-bottom: var(--spacing-md);">
                <h3 style="margin-bottom: var(--spacing-md);">Select Room</h3>
                <div id="spaceList">
                  ${this.renderSpaceList(floorSpaces)}
                </div>
              </div>
              
              <!-- Dimension Editor -->
              <div class="glass-card" id="dimensionEditor">
                ${this.selectedSpace ? this.renderDimensionEditor() : this.renderNoSelection()}
              </div>
            </div>
            
            <!-- Right Panel: 3D Preview -->
            <div class="glass-card" style="height: 700px; padding: 0; overflow: hidden;">
              <div style="padding: var(--spacing-md); border-bottom: 1px solid rgba(255,255,255,0.1);">
                <h3>Live 3D Preview</h3>
                <p style="font-size: 0.875rem; opacity: 0.8; margin-top: var(--spacing-xs);">
                  Changes update in real-time
                </p>
              </div>
              <div id="model3d" style="width: 100%; height: calc(100% - 80px);"></div>
            </div>
            
          </div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
  }
  
  /**
   * Render floor tabs
   */
  renderFloorTabs() {
    const floors = Object.keys(this.building.floors);
    return floors.map(floorKey => `
      <button 
        class="btn ${floorKey === this.selectedFloor ? 'btn-primary' : 'btn-secondary'}" 
        data-floor="${floorKey}"
        style="flex: 1;"
      >
        ${floorKey === 'ground' ? 'Ground Floor' : floorKey === 'first' ? 'First Floor' : floorKey}
      </button>
    `).join('');
  }
  
  /**
   * Render space list
   */
  renderSpaceList(spaces) {
    return `
      <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
        ${spaces.map(space => `
          <button 
            class="space-item ${this.selectedSpace?.id === space.id ? 'active' : ''}"
            data-space-id="${space.id}"
            style="
              padding: var(--spacing-sm);
              background: ${this.selectedSpace?.id === space.id ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)'};
              border: 1px solid ${this.selectedSpace?.id === space.id ? '#667eea' : 'rgba(255,255,255,0.1)'};
              border-radius: 8px;
              text-align: left;
              cursor: pointer;
              transition: all 0.2s;
            "
            onmouseover="this.style.background='rgba(102, 126, 234, 0.1)'"
            onmouseout="this.style.background='${this.selectedSpace?.id === space.id ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)'}'"
          >
            <div style="font-weight: 600; margin-bottom: 2px;">${space.name}</div>
            <div style="font-size: 0.875rem; opacity: 0.8;">
              ${space.width.toFixed(2)}m × ${space.depth.toFixed(2)}m
            </div>
          </button>
        `).join('')}
      </div>
    `;
  }
  
  /**
   * Render no selection message
   */
  renderNoSelection() {
    return `
      <div style="text-align: center; padding: var(--spacing-xl); opacity: 0.6;">
        <p>Select a room to edit its dimensions</p>
      </div>
    `;
  }
  
  /**
   * Render dimension editor for selected space
   */
  renderDimensionEditor() {
    if (!this.selectedSpace) return this.renderNoSelection();
    
    const space = this.selectedSpace;
    
    return `
      <h3 style="margin-bottom: var(--spacing-md);">${space.name}</h3>
      
      <!-- Width Input -->
      <div class="input-group" style="margin-bottom: var(--spacing-md);">
        <label for="widthInput" style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">
          Width (m)
        </label>
        <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
          <input 
            type="number" 
            id="widthInput" 
            class="input" 
            value="${space.width.toFixed(2)}" 
            step="0.1" 
            min="1.0" 
            max="20.0"
            style="flex: 1;"
          />
          <input 
            type="range" 
            id="widthSlider" 
            min="1.0" 
            max="20.0" 
            step="0.1" 
            value="${space.width}"
            style="flex: 1;"
          />
        </div>
        <div style="font-size: 0.75rem; opacity: 0.7; margin-top: var(--spacing-xs);">
          Area: ${(space.width * space.depth).toFixed(2)} m²
        </div>
      </div>
      
      <!-- Depth Input -->
      <div class="input-group" style="margin-bottom: var(--spacing-md);">
        <label for="depthInput" style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">
          Depth (m)
        </label>
        <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
          <input 
            type="number" 
            id="depthInput" 
            class="input" 
            value="${space.depth.toFixed(2)}" 
            step="0.1" 
            min="1.0" 
            max="20.0"
            style="flex: 1;"
          />
          <input 
            type="range" 
            id="depthSlider" 
            min="1.0" 
            max="20.0" 
            step="0.1" 
            value="${space.depth}"
            style="flex: 1;"
          />
        </div>
      </div>
      
      <!-- Height Input -->
      <div class="input-group" style="margin-bottom: var(--spacing-md);">
        <label for="heightInput" style="display: block; margin-bottom: var(--spacing-xs); font-weight: 600;">
          Height (m)
        </label>
        <div style="display: flex; gap: var(--spacing-sm); align-items: center;">
          <input 
            type="number" 
            id="heightInput" 
            class="input" 
            value="${space.height.toFixed(2)}" 
            step="0.1" 
            min="2.0" 
            max="4.0"
            style="flex: 1;"
          />
          <input 
            type="range" 
            id="heightSlider" 
            min="2.0" 
            max="4.0" 
            step="0.1" 
            value="${space.height}"
            style="flex: 1;"
          />
        </div>
      </div>
      
      <!-- Volume Display -->
      <div style="
        background: rgba(70, 190, 128, 0.1);
        border: 1px solid rgba(70, 190, 128, 0.3);
        border-radius: 8px;
        padding: var(--spacing-sm);
        margin-top: var(--spacing-md);
      ">
        <div style="font-size: 0.875rem; opacity: 0.9;">Volume</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #4ade80;">
          ${(space.width * space.depth * space.height).toFixed(2)} m³
        </div>
      </div>
      
      <!-- Warning if dimensions changed significantly -->
      ${this.renderDimensionWarning()}
    `;
  }
  
  /**
   * Render warning if dimensions affect building envelope
   */
  renderDimensionWarning() {
    // Check if this space is on building boundary
    const template = window.PROPERTY_TEMPLATES[this.building.propertyType];
    const layoutData = this.findLayoutData(this.selectedSpace.id, template);
    
    if (!layoutData) return '';
    
    const hasExternalWalls = layoutData.externalWalls && layoutData.externalWalls.length > 0;
    
    if (hasExternalWalls) {
      return `
        <div style="
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 8px;
          padding: var(--spacing-sm);
          margin-top: var(--spacing-md);
          font-size: 0.875rem;
        ">
          ⚠️ This room has external walls. Changing dimensions may affect the building footprint.
        </div>
      `;
    }
    
    return '';
  }
  
  /**
   * Find layout data for space
   */
  findLayoutData(spaceId, template) {
    for (const floorKey in template.layout) {
      const room = template.layout[floorKey].find(r => r.id === spaceId);
      if (room) return room;
    }
    return null;
  }
  
  /**
   * Initialize 3D viewer
   */
  initialize3DViewer() {
    const container = document.getElementById('model3d');
    if (!container) return;
    
    // Create 3D viewer with current building
    this.modelViewer = new ModelViewer3D(container, this.building, {
      autoRotate: true,
      rotateSpeed: 0.002
    });
  }
  
  /**
   * Update 3D model with current building state
   */
  update3DModel() {
    if (!this.modelViewer) return;
    
    // Dispose old viewer
    this.modelViewer.dispose();
    
    // Create new viewer with updated building
    const container = document.getElementById('model3d');
    if (!container) return;
    
    this.modelViewer = new ModelViewer3D(container, this.building, {
      autoRotate: true,
      rotateSpeed: 0.002
    });
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Floor tabs
    const floorButtons = document.querySelectorAll('[data-floor]');
    floorButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedFloor = e.target.dataset.floor;
        this.selectedSpace = null;
        this.render();
        this.attachEventListeners();
      });
    });
    
    // Space selection
    const spaceButtons = document.querySelectorAll('[data-space-id]');
    spaceButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const spaceId = e.target.closest('[data-space-id]').dataset.spaceId;
        this.selectSpace(spaceId);
      });
    });
    
    // Dimension inputs (if space selected)
    if (this.selectedSpace) {
      this.attachDimensionListeners();
    }
    
    // Action buttons
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancel());
    }
    
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.save());
    }
  }
  
  /**
   * Attach listeners for dimension inputs
   */
  attachDimensionListeners() {
    // Width
    const widthInput = document.getElementById('widthInput');
    const widthSlider = document.getElementById('widthSlider');
    
    if (widthInput && widthSlider) {
      widthInput.addEventListener('input', (e) => {
        widthSlider.value = e.target.value;
        this.updateDimension('width', parseFloat(e.target.value));
      });
      
      widthSlider.addEventListener('input', (e) => {
        widthInput.value = parseFloat(e.target.value).toFixed(2);
        this.updateDimension('width', parseFloat(e.target.value));
      });
    }
    
    // Depth
    const depthInput = document.getElementById('depthInput');
    const depthSlider = document.getElementById('depthSlider');
    
    if (depthInput && depthSlider) {
      depthInput.addEventListener('input', (e) => {
        depthSlider.value = e.target.value;
        this.updateDimension('depth', parseFloat(e.target.value));
      });
      
      depthSlider.addEventListener('input', (e) => {
        depthInput.value = parseFloat(e.target.value).toFixed(2);
        this.updateDimension('depth', parseFloat(e.target.value));
      });
    }
    
    // Height
    const heightInput = document.getElementById('heightInput');
    const heightSlider = document.getElementById('heightSlider');
    
    if (heightInput && heightSlider) {
      heightInput.addEventListener('input', (e) => {
        heightSlider.value = e.target.value;
        this.updateDimension('height', parseFloat(e.target.value));
      });
      
      heightSlider.addEventListener('input', (e) => {
        heightInput.value = parseFloat(e.target.value).toFixed(2);
        this.updateDimension('height', parseFloat(e.target.value));
      });
    }
  }
  
  /**
   * Select a space
   */
  selectSpace(spaceId) {
    const space = this.building.getAllSpaces().find(s => s.id === spaceId);
    if (!space) return;
    
    this.selectedSpace = space;
    
    // Re-render dimension editor only
    const editorContainer = document.getElementById('dimensionEditor');
    if (editorContainer) {
      editorContainer.innerHTML = this.renderDimensionEditor();
      this.attachDimensionListeners();
    }
    
    // Update space list highlighting
    document.querySelectorAll('[data-space-id]').forEach(btn => {
      const isActive = btn.dataset.spaceId === spaceId;
      btn.classList.toggle('active', isActive);
      btn.style.background = isActive ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255,255,255,0.05)';
      btn.style.borderColor = isActive ? '#667eea' : 'rgba(255,255,255,0.1)';
    });
  }
  
  /**
   * Update dimension and refresh 3D model
   */
  updateDimension(dimension, value) {
    if (!this.selectedSpace || this.isUpdating) return;
    
    this.isUpdating = true;
    
    // Update the space dimension
    this.selectedSpace[dimension] = value;
    
    // Recalculate dependent properties
    this.selectedSpace.recalculateAreas();
    
    // Update volume display
    const volumeDisplay = document.querySelector('[style*="color: #4ade80"]');
    if (volumeDisplay) {
      const volume = this.selectedSpace.width * this.selectedSpace.depth * this.selectedSpace.height;
      volumeDisplay.textContent = `${volume.toFixed(2)} m³`;
    }
    
    // Update area display
    const areaDisplay = document.querySelector('[style*="Area:"]');
    if (areaDisplay) {
      const area = this.selectedSpace.width * this.selectedSpace.depth;
      areaDisplay.textContent = `Area: ${area.toFixed(2)} m²`;
    }
    
    // Update 3D model (debounced for performance)
    this.debounce3DUpdate();
    
    this.isUpdating = false;
  }
  
  /**
   * Debounce 3D updates for better performance
   */
  debounce3DUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    
    this.updateTimeout = setTimeout(() => {
      this.update3DModel();
    }, 150); // Update after 150ms of no changes
  }
  
  /**
   * Save changes
   */
  save() {
    // Update state with modified building
    updateBuilding(this.building);
    
    // Navigate back to results
    navigateTo('results');
  }
  
  /**
   * Cancel changes
   */
  cancel() {
    // Restore original building
    if (this.originalBuilding) {
      updateBuilding(this.originalBuilding);
    }
    
    // Navigate back to results
    navigateTo('results');
  }
}
