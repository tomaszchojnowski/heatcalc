/**
 * Input Screen
 * First screen where user enters postcode and selects property type.
 */

import { validatePostcode, formatPostcode, getClimateData } from './climateData.js';
import { getTemplate, PROPERTY_TEMPLATES } from './propertyTemplates.js';
import { Building } from './Building.js';
import { setState, setPostcode, setBuilding } from './state.js';
import { navigateTo } from './router.js';

export class InputScreen {
  constructor() {
    this.name = 'input';
    this.container = null;
    this.selectedPropertyType = null;
  }
  
  /**
   * Enter screen - render UI
   */
  async enter(container, data = {}) {
    this.container = container;
    
    // Build HTML
    const html = `
      <div class="container">
        <div class="input-screen-content">
          <!-- Logo & Title -->
          <div class="text-center mb-xl">
            <div class="logo">🏠 HeatCalc</div>
            <p class="tagline">Instant heating system estimates</p>
          </div>
          
          <!-- Input Card -->
          <div class="glass-card glass-card-lg" style="max-width: 500px; margin: 0 auto;">
            <!-- Postcode Input -->
            <div class="form-group">
              <label class="label" for="postcodeInput">Enter Your Postcode</label>
              <input 
                type="text" 
                id="postcodeInput"
                class="input"
                placeholder="SW1A 1AA"
                maxlength="8"
                autocomplete="postal-code"
              >
              <div id="postcodeValidation" class="mt-sm"></div>
            </div>
            
            <!-- Property Type Selection -->
            <div class="form-group">
              <label class="label">Property Type</label>
              <div id="propertyTypes" class="property-types"></div>
            </div>
            
            <!-- Continue Button -->
            <button 
              id="continueBtn" 
              class="btn btn-solid btn-full btn-lg"
              disabled
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Render property type options
    this.renderPropertyTypes();
    
    // Attach event listeners
    this.attachEventListeners();
    
    // Pre-fill from state if available
    this.prefillFromState(data);
  }
  
  /**
   * Exit screen - cleanup
   */
  async exit() {
    // Remove event listeners to prevent memory leaks
    const postcodeInput = document.getElementById('postcodeInput');
    const continueBtn = document.getElementById('continueBtn');
    
    if (postcodeInput) {
      postcodeInput.removeEventListener('input', this.handlePostcodeInput);
    }
    
    if (continueBtn) {
      continueBtn.removeEventListener('click', this.handleContinue);
    }
  }
  
  /**
   * Render property type options
   */
  renderPropertyTypes() {
    const container = document.getElementById('propertyTypes');
    const templateIds = Object.keys(PROPERTY_TEMPLATES);
    
    let html = '';
    
    templateIds.forEach(templateId => {
      const template = PROPERTY_TEMPLATES[templateId];
      
      html += `
        <div 
          class="property-option" 
          data-type="${templateId}"
          role="button"
          tabindex="0"
        >
          <div class="property-option-name">${template.name}</div>
          <div class="property-option-era">${template.era}</div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Postcode input validation
    const postcodeInput = document.getElementById('postcodeInput');
    this.handlePostcodeInput = this.onPostcodeInput.bind(this);
    postcodeInput.addEventListener('input', this.handlePostcodeInput);
    
    // Property type selection
    const propertyOptions = document.querySelectorAll('.property-option');
    propertyOptions.forEach(option => {
      option.addEventListener('click', () => this.selectPropertyType(option));
      option.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.selectPropertyType(option);
        }
      });
    });
    
    // Continue button
    const continueBtn = document.getElementById('continueBtn');
    this.handleContinue = this.onContinue.bind(this);
    continueBtn.addEventListener('click', this.handleContinue);
  }
  
  /**
   * Handle postcode input
   */
  onPostcodeInput(e) {
    const postcode = e.target.value;
    const validation = document.getElementById('postcodeValidation');
    
    if (postcode.length > 3) {
      if (validatePostcode(postcode)) {
        const formatted = formatPostcode(postcode);
        const climate = getClimateData(formatted);
        
        validation.innerHTML = `
          <div class="validation-success">
            ✓ Valid postcode - ${climate.name}
          </div>
        `;
      } else {
        validation.innerHTML = `
          <div class="validation-error">
            ✗ Invalid postcode format
          </div>
        `;
      }
    } else {
      validation.innerHTML = '';
    }
    
    this.updateContinueButton();
  }
  
  /**
   * Select property type
   */
  selectPropertyType(option) {
    // Remove previous selection
    document.querySelectorAll('.property-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    // Add selection
    option.classList.add('selected');
    this.selectedPropertyType = option.dataset.type;
    
    this.updateContinueButton();
  }
  
  /**
   * Update continue button state
   */
  updateContinueButton() {
    const postcode = document.getElementById('postcodeInput').value;
    const continueBtn = document.getElementById('continueBtn');
    
    const hasValidPostcode = postcode.length > 0 && validatePostcode(postcode);
    const hasPropertyType = this.selectedPropertyType !== null;
    
    continueBtn.disabled = !(hasValidPostcode && hasPropertyType);
  }
  
  /**
   * Handle continue button click
   */
  async onContinue() {
    const postcodeInput = document.getElementById('postcodeInput');
    const postcode = postcodeInput.value;
    
    if (!validatePostcode(postcode)) {
      alert('Please enter a valid postcode');
      return;
    }
    
    if (!this.selectedPropertyType) {
      alert('Please select a property type');
      return;
    }
    
    try {
      // Format postcode
      const formattedPostcode = formatPostcode(postcode);
      
      // Get climate data
      const climateData = getClimateData(formattedPostcode);
      
      // Get property template
      const template = getTemplate(this.selectedPropertyType);
      
      // Create building
      const building = new Building(template);
      
      // Update state
      setPostcode(formattedPostcode, climateData);
      setState({ propertyType: this.selectedPropertyType });
      setBuilding(building);
      
      // Navigate to loading screen
      navigateTo('loading', {
        message: 'Analyzing your property...',
        nextScreen: 'results'
      });
      
    } catch (error) {
      console.error('Error during initialization:', error);
      alert(`Error: ${error.message}`);
    }
  }
  
  /**
   * Prefill from state (e.g., when navigating back)
   */
  prefillFromState(data) {
    // Check if we have state data
    if (data.postcode) {
      const postcodeInput = document.getElementById('postcodeInput');
      postcodeInput.value = data.postcode;
      this.onPostcodeInput({ target: postcodeInput });
    }
    
    if (data.propertyType) {
      const option = document.querySelector(`[data-type="${data.propertyType}"]`);
      if (option) {
        this.selectPropertyType(option);
      }
    }
  }
}

// CSS styles for this screen (to be added to styles.css or inline)
const styles = `
  .input-screen-content {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: var(--spacing-xl) 0;
  }
  
  .logo {
    font-size: 3rem;
    font-weight: 800;
    margin-bottom: var(--spacing-sm);
  }
  
  .tagline {
    font-size: 1.125rem;
    color: var(--text-secondary);
  }
  
  .property-types {
    display: grid;
    gap: var(--spacing-md);
  }
  
  .property-option {
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-base);
  }
  
  .property-option:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }
  
  .property-option.selected {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  
  .property-option-name {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
  }
  
  .property-option-era {
    font-size: 0.875rem;
    color: var(--text-tertiary);
  }
  
  .validation-success {
    color: var(--accent);
    font-size: 0.875rem;
    font-weight: 600;
  }
  
  .validation-error {
    color: var(--danger);
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

// Add styles to document if not already added
if (typeof document !== 'undefined' && !document.getElementById('input-screen-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'input-screen-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
