/**
 * Results Screen
 * Main results display with heat loss and system costs.
 */

import { getState, subscribe } from './state.js';
import { calculateRunningCosts } from './pricingData.js';
import { navigateTo } from './router.js';

export class ResultsScreen {
  constructor() {
    this.name = 'results';
    this.container = null;
    this.unsubscribe = null;
  }
  
  /**
   * Enter screen
   */
  async enter(container, data = {}) {
    this.container = container;
    const state = getState();
    
    if (!state.building || !state.heatLoss.calculated) {
      console.error('No calculation data available');
      navigateTo('input');
      return;
    }
    
    this.render(state);
    
    // Subscribe to state changes (e.g., if user modifies building)
    this.unsubscribe = subscribe((newState) => {
      if (newState.heatLoss.calculated) {
        this.render(newState);
      }
    }, ['heatLoss', 'pricing']);
  }
  
  /**
   * Exit screen
   */
  async exit() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  /**
   * Render screen
   */
  render(state) {
    const html = `
      <div class="results-screen">
        <!-- Sticky Header with Key Metrics -->
        <div class="status-bar">
          <div class="status-metric">
            <div class="status-label">Heat Loss</div>
            <div class="status-value">${state.heatLoss.total.toFixed(1)} kW</div>
          </div>
          <div class="status-metric">
            <div class="status-label">System Cost</div>
            <div class="status-value">£${this.getSelectedSystemCost(state).toLocaleString()}</div>
          </div>
        </div>
        
        <div class="container">
          <!-- Property Summary -->
          ${this.renderPropertySummary(state)}
          
          <!-- Heat Loss Breakdown -->
          ${this.renderHeatLossBreakdown(state)}
          
          <!-- System Costs -->
          ${this.renderSystemCosts(state)}
          
          <!-- Action Buttons -->
          ${this.renderActions()}
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    this.attachEventListeners();
  }
  
  /**
   * Render property summary
   */
  renderPropertySummary(state) {
    return `
      <div class="section">
        <div class="glass-card">
          <h2>Your Property</h2>
          <div class="property-details">
            <div class="detail-row">
              <span class="detail-label">Location</span>
              <span class="detail-value">${state.postcode} - ${state.climateData.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property Type</span>
              <span class="detail-value">${state.building.propertyName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Era</span>
              <span class="detail-value">${state.building.era}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Floor Area</span>
              <span class="detail-value">${state.building.getTotalFloorArea().toFixed(1)} m²</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">External Temperature</span>
              <span class="detail-value">${state.climateData.externalDesignTemp}°C</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render heat loss breakdown
   */
  renderHeatLossBreakdown(state) {
    const breakdown = state.heatLoss.breakdown;
    
    return `
      <div class="section">
        <div class="glass-card">
          <h2>Heat Loss Analysis</h2>
          
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-label">Total Heat Loss</div>
              <div class="metric-value price">${state.heatLoss.total.toFixed(2)} kW</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Fabric Loss</div>
              <div class="metric-value">${(breakdown.totals.fabricLoss / 1000).toFixed(2)} kW</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Ventilation Loss</div>
              <div class="metric-value">${(breakdown.totals.ventilationLoss / 1000).toFixed(2)} kW</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Peak Load</div>
              <div class="metric-value">${(breakdown.peakLoad / 1000).toFixed(2)} kW</div>
            </div>
          </div>
          
          <h3 class="mt-xl">Room-by-Room Breakdown</h3>
          <div class="table-container">
            <table class="results-table">
              <thead>
                <tr>
                  <th>Space</th>
                  <th>Area</th>
                  <th>Heat Loss</th>
                  <th>W/m²</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderSpaceRows(state.building, breakdown)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render space rows for table
   */
  renderSpaceRows(building, breakdown) {
    return building.getAllSpaces().map(space => {
      const spaceLoss = breakdown.spaces[space.id];
      const lossPerM2 = spaceLoss.total / space.floorArea;
      
      return `
        <tr>
          <td>${space.name}</td>
          <td>${space.floorArea.toFixed(1)} m²</td>
          <td><strong>${(spaceLoss.total / 1000).toFixed(2)} kW</strong></td>
          <td>${lossPerM2.toFixed(0)} W/m²</td>
        </tr>
      `;
    }).join('');
  }
  
  /**
   * Render system costs
   */
  renderSystemCosts(state) {
    const hpCost = state.pricing.heatPump;
    const boilerCost = state.pricing.boiler;
    const hpRunning = calculateRunningCosts(state.building, 'heatPump');
    const boilerRunning = calculateRunningCosts(state.building, 'boiler');
    
    return `
      <div class="section">
        <h2 class="text-center mb-lg">System Cost Comparison</h2>
        
        <div class="grid grid-2">
          <!-- Heat Pump -->
          <div class="glass-card">
            <div class="system-header">
              <h3>Heat Pump System</h3>
              <span class="badge badge-success">Recommended</span>
            </div>
            
            <div class="cost-breakdown">
              <div class="cost-item">
                <span>Heat Pump (${hpCost.capacity} kW)</span>
                <span>£${hpCost.breakdown.heatPumpUnit.toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Radiators (${hpCost.radiatorCount}×)</span>
                <span>£${this.sumRadiatorCost(hpCost.breakdown.radiators).toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Pipework</span>
                <span>£${hpCost.breakdown.pipework.toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Hot Water Cylinder</span>
                <span>£${hpCost.breakdown.hotWaterCylinder.toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Installation (${hpCost.installationDays} days)</span>
                <span>£${hpCost.breakdown.labor.toLocaleString()}</span>
              </div>
              <div class="cost-item total">
                <span>Subtotal</span>
                <span>£${hpCost.totalCost.toLocaleString()}</span>
              </div>
              <div class="cost-item grant">
                <span>BUS Grant</span>
                <span>-£${hpCost.grantAmount.toLocaleString()}</span>
              </div>
              <div class="cost-item final">
                <span>Your Cost</span>
                <span class="price">£${hpCost.finalCost.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="running-costs mt-lg">
              <h4>Running Costs</h4>
              <div class="cost-item">
                <span>Annual</span>
                <span>£${hpRunning.annualCost.toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Monthly</span>
                <span>£${hpRunning.monthlyAverage.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <!-- Gas Boiler -->
          <div class="glass-card">
            <div class="system-header">
              <h3>Gas Boiler System</h3>
            </div>
            
            <div class="cost-breakdown">
              <div class="cost-item">
                <span>Boiler (${boilerCost.capacity} kW)</span>
                <span>£${boilerCost.breakdown.boilerUnit.toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Radiators (${boilerCost.radiatorCount}×)</span>
                <span>£${this.sumRadiatorCost(boilerCost.breakdown.radiators).toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Pipework</span>
                <span>£${boilerCost.breakdown.pipework.toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Installation (${boilerCost.installationDays} days)</span>
                <span>£${boilerCost.breakdown.labor.toLocaleString()}</span>
              </div>
              <div class="cost-item final">
                <span>Total Cost</span>
                <span class="price">£${boilerCost.totalCost.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="running-costs mt-lg">
              <h4>Running Costs</h4>
              <div class="cost-item">
                <span>Annual</span>
                <span>£${boilerRunning.annualCost.toLocaleString()}</span>
              </div>
              <div class="cost-item">
                <span>Monthly</span>
                <span>£${boilerRunning.monthlyAverage.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Sum radiator costs from breakdown array
   */
  sumRadiatorCost(radiators) {
    if (Array.isArray(radiators)) {
      return radiators.reduce((sum, rad) => sum + rad.cost, 0);
    }
    return 0;
  }
  
  /**
   * Get selected system cost
   */
  getSelectedSystemCost(state) {
    return state.pricing.heatPump.finalCost;
  }
  
  /**
   * Render action buttons
   */
  renderActions() {
    return `
      <div class="section">
        <div class="action-buttons">
          <button class="btn btn-solid btn-full btn-lg" id="fineTuneBtn">
            Fine-Tune Details
          </button>
          <button class="btn btn-secondary btn-full" id="viewModelBtn">
            View 3D Model
          </button>
          <button class="btn btn-secondary btn-full" id="exportBtn">
            Export Report
          </button>
          <button class="btn btn-secondary btn-full" id="shareBtn">
            Share Results
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const fineTuneBtn = document.getElementById('fineTuneBtn');
    const viewModelBtn = document.getElementById('viewModelBtn');
    const exportBtn = document.getElementById('exportBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (fineTuneBtn) {
      fineTuneBtn.addEventListener('click', () => {
        navigateTo('edit');
      });
    }
    
    if (viewModelBtn) {
      viewModelBtn.addEventListener('click', () => {
        alert('3D Model viewer - Coming soon!');
      });
    }
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportResults();
      });
    }
    
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareResults();
      });
    }
  }
  
  /**
   * Export results
   */
  exportResults() {
    const state = getState();
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `heating-assessment-${state.postcode}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
  
  /**
   * Share results
   */
  shareResults() {
    // TODO: Implement URL serialization
    alert('Share functionality - Coming soon!');
  }
}

// Styles
const styles = `
  .results-screen {
    min-height: 100vh;
    padding-bottom: var(--spacing-2xl);
  }
  
  .property-details {
    display: grid;
    gap: var(--spacing-sm);
  }
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .detail-row:last-child {
    border-bottom: none;
  }
  
  .detail-label {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  
  .detail-value {
    font-weight: 600;
  }
  
  .metric-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-md);
    margin: var(--spacing-lg) 0;
  }
  
  .metric-card {
    background: rgba(255, 255, 255, 0.1);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    text-align: center;
  }
  
  .metric-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
  }
  
  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  .table-container {
    overflow-x: auto;
    margin-top: var(--spacing-md);
  }
  
  .results-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .results-table th {
    text-align: left;
    padding: var(--spacing-sm);
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .results-table td {
    padding: var(--spacing-sm);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .system-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  .cost-breakdown {
    margin: var(--spacing-md) 0;
  }
  
  .cost-item {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .cost-item.total {
    border-top: 2px solid rgba(255, 255, 255, 0.2);
    padding-top: var(--spacing-md);
    margin-top: var(--spacing-sm);
    font-weight: 700;
  }
  
  .cost-item.grant {
    color: var(--accent);
    font-weight: 600;
  }
  
  .cost-item.final {
    background: rgba(255, 255, 255, 0.15);
    margin: var(--spacing-md) calc(var(--spacing-lg) * -1) 0;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    border: none;
    font-size: 1.125rem;
    font-weight: 700;
  }
  
  .running-costs {
    background: rgba(255, 255, 255, 0.05);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
  }
  
  .running-costs h4 {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: var(--spacing-sm);
  }
  
  .action-buttons {
    display: grid;
    gap: var(--spacing-md);
    max-width: 500px;
    margin: 0 auto;
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('results-screen-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'results-screen-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
