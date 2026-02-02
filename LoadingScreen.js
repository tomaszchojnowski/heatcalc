/**
 * Loading Screen
 * Shows progress animation while calculations are performed.
 */

import { getState } from './state.js';
import { HeatLossCalculator } from './HeatLossCalculator.js';
import { setHeatLoss, setPricing } from './state.js';
import { calculateSystemCost } from './pricingData.js';
import { navigateTo } from './router.js';

export class LoadingScreen {
  constructor() {
    this.name = 'loading';
    this.container = null;
    this.steps = [
      'Loading climate data...',
      'Generating 3D model...',
      'Calculating heat loss...',
      'Estimating system costs...'
    ];
    this.currentStep = 0;
  }
  
  /**
   * Enter screen
   */
  async enter(container, data = {}) {
    this.container = container;
    
    const html = `
      <div class="loading-screen">
        <div class="loading-content">
          <!-- Spinner -->
          <div class="spinner-large"></div>
          
          <!-- Message -->
          <h2 class="loading-title">${data.message || 'Processing...'}</h2>
          
          <!-- Steps -->
          <div class="loading-steps" id="loadingSteps">
            ${this.steps.map((step, index) => `
              <div class="loading-step" data-step="${index}">
                <span class="step-icon">⏳</span>
                <span class="step-text">${step}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Start processing
    await this.performCalculations(data.nextScreen);
  }
  
  /**
   * Exit screen
   */
  async exit() {
    // Cleanup if needed
  }
  
  /**
   * Perform all calculations
   */
  async performCalculations(nextScreen = 'results') {
    try {
      // Step 1: Climate data (already loaded)
      await this.showStep(0);
      await this.delay(100);
      
      // Step 2: 3D model (already created)
      await this.showStep(1);
      await this.delay(200);
      
      // Step 3: Calculate heat loss
      await this.showStep(2);
      const state = getState();
      
      if (!state.building) {
        throw new Error('No building data available');
      }
      
      // Ensure building is a Building instance (not plain object)
      let building = state.building;
      if (typeof building.getAllSpaces !== 'function') {
        // Reconstruct from JSON if needed
        const { Building } = await import('./Building.js');
        building = Building.fromJSON(state.building);
      }
      
      // Create climate config for calculator
      const climateConfig = {
        externalDesignTemp: state.climateData.externalDesignTemp,
        internalDesignTemp: 21,
        internalDesignTempBedroom: 18,
        windExposure: state.climateData.windExposure
      };
      
      // Calculate heat loss
      const calculator = new HeatLossCalculator(climateConfig);
      const breakdown = calculator.calculate(building);
      
      // Update state with the Building instance
      setHeatLoss(building.totalHeatLoss, breakdown);
      
      await this.delay(400);
      
      // Step 4: Calculate costs
      await this.showStep(3);
      
      const heatPumpCost = calculateSystemCost(building, 'heatPump', true);
      const boilerCost = calculateSystemCost(building, 'boiler', false);
      
      setPricing(heatPumpCost, boilerCost);
      
      await this.delay(400);
      
      // Navigate to results
      navigateTo(nextScreen);
      
    } catch (error) {
      console.error('Error during calculations:', error);
      this.showError(error.message);
    }
  }
  
  /**
   * Show current step
   */
  async showStep(stepIndex) {
    this.currentStep = stepIndex;
    
    const stepElements = document.querySelectorAll('.loading-step');
    stepElements.forEach((el, index) => {
      const icon = el.querySelector('.step-icon');
      
      if (index < stepIndex) {
        el.classList.add('completed');
        icon.textContent = '✓';
      } else if (index === stepIndex) {
        el.classList.add('active');
        icon.textContent = '⏳';
      } else {
        el.classList.remove('active', 'completed');
        icon.textContent = '⏳';
      }
    });
  }
  
  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Show error
   */
  showError(message) {
    const stepsContainer = document.getElementById('loadingSteps');
    stepsContainer.innerHTML = `
      <div class="loading-error">
        <div class="error-icon">✗</div>
        <div class="error-message">${message}</div>
        <button class="btn btn-primary mt-lg" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    `;
  }
}

// Styles for loading screen
const styles = `
  .loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
  }
  
  .loading-content {
    text-align: center;
    max-width: 500px;
  }
  
  .spinner-large {
    width: 80px;
    height: 80px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--text-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--spacing-xl);
  }
  
  .loading-title {
    margin-bottom: var(--spacing-xl);
    color: var(--text-primary);
  }
  
  .loading-steps {
    text-align: left;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .loading-step {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) 0;
    color: var(--text-tertiary);
    transition: all var(--transition-base);
  }
  
  .loading-step.active {
    color: var(--text-primary);
  }
  
  .loading-step.completed {
    color: var(--accent);
  }
  
  .step-icon {
    font-size: 1.25rem;
    width: 24px;
    text-align: center;
  }
  
  .step-text {
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .loading-error {
    text-align: center;
    padding: var(--spacing-lg);
  }
  
  .error-icon {
    font-size: 4rem;
    color: var(--danger);
    margin-bottom: var(--spacing-md);
  }
  
  .error-message {
    color: var(--text-primary);
    font-size: 1.125rem;
    margin-bottom: var(--spacing-lg);
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('loading-screen-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'loading-screen-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
