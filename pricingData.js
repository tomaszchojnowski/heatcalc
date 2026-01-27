/**
 * Pricing Data
 * UK heating system component costs and installation rates.
 * Prices updated as of 2024/2025.
 */

/**
 * Heat pump pricing by capacity (kW)
 * Air source heat pumps - most common for residential
 */
export const HEAT_PUMP_PRICES = {
  5: { equipment: 5500, installation: 1500 },
  6: { equipment: 6000, installation: 1600 },
  7: { equipment: 6500, installation: 1700 },
  8: { equipment: 7000, installation: 1800 },
  9: { equipment: 7500, installation: 1900 },
  10: { equipment: 8000, installation: 2000 },
  11: { equipment: 8500, installation: 2100 },
  12: { equipment: 9000, installation: 2200 },
  14: { equipment: 10000, installation: 2400 },
  16: { equipment: 11000, installation: 2600 },
  18: { equipment: 12000, installation: 2800 },
  20: { equipment: 13500, installation: 3000 }
};

/**
 * Gas/oil boiler pricing by capacity (kW)
 * Combi boilers - most common
 */
export const BOILER_PRICES = {
  24: { equipment: 1800, installation: 1200 },
  28: { equipment: 2000, installation: 1200 },
  32: { equipment: 2200, installation: 1300 },
  35: { equipment: 2400, installation: 1300 },
  40: { equipment: 2600, installation: 1400 }
};

/**
 * Radiator pricing by heat output
 * Standard panel radiators
 */
export const RADIATOR_PRICES = {
  small: { watts: 1000, price: 120, installation: 150 },      // 1kW
  medium: { watts: 1500, price: 160, installation: 180 },     // 1.5kW
  large: { watts: 2000, price: 200, installation: 200 },      // 2kW
  extraLarge: { watts: 3000, price: 280, installation: 220 }  // 3kW
};

/**
 * Underfloor heating pricing per m²
 */
export const UNDERFLOOR_HEATING = {
  electric: {
    materials: 80,      // per m²
    installation: 40    // per m²
  },
  wetSystem: {
    materials: 120,     // per m²
    installation: 60    // per m²
  }
};

/**
 * Pipework and system components
 */
export const SYSTEM_COMPONENTS = {
  pipeworkPerMeter: 25,           // Copper pipe + fittings per linear meter
  controlsBasic: 400,             // Thermostat + programmer
  controlsSmart: 800,             // Smart thermostat + zone controls
  cylinderStandard: 800,          // 200L hot water cylinder
  cylinderUnvented: 1200,         // 250L unvented cylinder
  bufferTank: 600,                // Buffer tank for heat pump
  manifold: 350,                  // Per floor manifold (underfloor)
  thermostatic: 45,               // Thermostatic radiator valve (TRV)
  pumpStandard: 150,              // Circulation pump
  expansionVessel: 120,           // Expansion vessel
  inhibitor: 50,                  // System inhibitor/cleaner
  powerFlush: 400                 // System power flush
};

/**
 * Labor rates by region
 */
export const LABOR_RATES = {
  london: { daily: 450, hourly: 65 },
  southeast: { daily: 400, hourly: 60 },
  southwest: { daily: 380, hourly: 55 },
  midlands: { daily: 360, hourly: 52 },
  north: { daily: 340, hourly: 50 },
  scotland: { daily: 360, hourly: 52 },
  wales: { daily: 350, hourly: 50 },
  default: { daily: 380, hourly: 55 }
};

/**
 * Installation complexity multipliers
 */
export const COMPLEXITY_FACTORS = {
  easy: 1.0,      // New build, open access
  standard: 1.2,  // Normal retrofit
  difficult: 1.5, // Listed building, complex layout
  veryDifficult: 1.8  // Major structural challenges
};

/**
 * Government grants and incentives (2024/2025)
 */
export const GRANTS = {
  busGrant: {
    name: 'Boiler Upgrade Scheme',
    amount: 7500,
    systemTypes: ['heatPump'],
    conditions: 'Air source heat pump installation'
  },
  ecoScheme: {
    name: 'ECO4 Scheme',
    amount: 0,  // Variable based on income
    systemTypes: ['heatPump', 'boiler'],
    conditions: 'Income-based eligibility'
  }
};

/**
 * Get heat pump system cost
 */
export function getHeatPumpCost(capacityKw, building) {
  // Find closest capacity
  const availableCapacities = Object.keys(HEAT_PUMP_PRICES).map(Number);
  const capacity = availableCapacities.find(c => c >= capacityKw) || availableCapacities[availableCapacities.length - 1];
  
  const pricing = HEAT_PUMP_PRICES[capacity];
  
  // Calculate radiators needed
  const radiatorCost = calculateRadiatorCost(building);
  
  // Calculate pipework (estimate based on floor area)
  const floorArea = building.getTotalFloorArea();
  const pipeworkMeters = floorArea * 2.5; // Rough estimate
  const pipeworkCost = pipeworkMeters * SYSTEM_COMPONENTS.pipeworkPerMeter;
  
  // Additional components for heat pump
  const componentsCost = 
    SYSTEM_COMPONENTS.controlsSmart +
    SYSTEM_COMPONENTS.cylinderUnvented +
    SYSTEM_COMPONENTS.bufferTank +
    SYSTEM_COMPONENTS.pumpStandard +
    SYSTEM_COMPONENTS.expansionVessel +
    SYSTEM_COMPONENTS.inhibitor +
    SYSTEM_COMPONENTS.powerFlush;
  
  // Installation days (heat pumps take longer)
  const installationDays = 3 + Math.floor(building.getAllSpaces().length / 4);
  const laborCost = LABOR_RATES.default.daily * installationDays;
  
  // Apply complexity factor
  const complexityFactor = building.costs?.radiatorComplexity || COMPLEXITY_FACTORS.standard;
  
  const subtotal = 
    pricing.equipment +
    pricing.installation +
    radiatorCost.total +
    pipeworkCost +
    componentsCost +
    laborCost;
  
  const total = subtotal * complexityFactor;
  
  return {
    capacity: capacity,
    equipment: pricing.equipment,
    radiators: radiatorCost.total,
    radiatorCount: radiatorCost.count,
    pipework: pipeworkCost,
    components: componentsCost,
    labor: laborCost,
    installationDays: installationDays,
    complexityFactor: complexityFactor,
    subtotal: subtotal,
    total: Math.round(total),
    breakdown: {
      heatPumpUnit: pricing.equipment,
      installation: pricing.installation,
      radiators: radiatorCost.breakdown,
      pipework: pipeworkCost,
      hotWaterCylinder: SYSTEM_COMPONENTS.cylinderUnvented,
      bufferTank: SYSTEM_COMPONENTS.bufferTank,
      controls: SYSTEM_COMPONENTS.controlsSmart,
      misc: SYSTEM_COMPONENTS.pumpStandard + SYSTEM_COMPONENTS.expansionVessel + SYSTEM_COMPONENTS.inhibitor + SYSTEM_COMPONENTS.powerFlush,
      labor: laborCost
    }
  };
}

/**
 * Get boiler system cost
 */
export function getBoilerCost(capacityKw, building) {
  // Find closest capacity
  const availableCapacities = Object.keys(BOILER_PRICES).map(Number);
  const capacity = availableCapacities.find(c => c >= capacityKw) || availableCapacities[availableCapacities.length - 1];
  
  const pricing = BOILER_PRICES[capacity];
  
  // Calculate radiators needed
  const radiatorCost = calculateRadiatorCost(building);
  
  // Calculate pipework
  const floorArea = building.getTotalFloorArea();
  const pipeworkMeters = floorArea * 2.0; // Less than heat pump
  const pipeworkCost = pipeworkMeters * SYSTEM_COMPONENTS.pipeworkPerMeter;
  
  // Components for boiler system
  const componentsCost = 
    SYSTEM_COMPONENTS.controlsBasic +
    SYSTEM_COMPONENTS.pumpStandard +
    SYSTEM_COMPONENTS.expansionVessel +
    SYSTEM_COMPONENTS.inhibitor +
    SYSTEM_COMPONENTS.powerFlush;
  
  // Installation days
  const installationDays = 2 + Math.floor(building.getAllSpaces().length / 5);
  const laborCost = LABOR_RATES.default.daily * installationDays;
  
  // Apply complexity factor
  const complexityFactor = building.costs?.radiatorComplexity || COMPLEXITY_FACTORS.standard;
  
  const subtotal = 
    pricing.equipment +
    pricing.installation +
    radiatorCost.total +
    pipeworkCost +
    componentsCost +
    laborCost;
  
  const total = subtotal * complexityFactor;
  
  return {
    capacity: capacity,
    equipment: pricing.equipment,
    radiators: radiatorCost.total,
    radiatorCount: radiatorCost.count,
    pipework: pipeworkCost,
    components: componentsCost,
    labor: laborCost,
    installationDays: installationDays,
    complexityFactor: complexityFactor,
    subtotal: subtotal,
    total: Math.round(total),
    breakdown: {
      boilerUnit: pricing.equipment,
      installation: pricing.installation,
      radiators: radiatorCost.breakdown,
      pipework: pipeworkCost,
      controls: SYSTEM_COMPONENTS.controlsBasic,
      misc: SYSTEM_COMPONENTS.pumpStandard + SYSTEM_COMPONENTS.expansionVessel + SYSTEM_COMPONENTS.inhibitor + SYSTEM_COMPONENTS.powerFlush,
      labor: laborCost
    }
  };
}

/**
 * Calculate radiator requirements and cost
 */
function calculateRadiatorCost(building) {
  const spaces = building.getAllSpaces();
  const radiators = [];
  let totalCost = 0;
  
  spaces.forEach(space => {
    // Skip very small spaces (WC, cupboards, etc.)
    if (space.floorArea < 2) return;
    
    // Get heat loss for space (in watts)
    const heatLossWatts = space.heatLoss?.total || 0;
    
    // Select appropriate radiator size
    let radiatorSize = 'small';
    if (heatLossWatts > 2500) {
      radiatorSize = 'extraLarge';
    } else if (heatLossWatts > 1750) {
      radiatorSize = 'large';
    } else if (heatLossWatts > 1250) {
      radiatorSize = 'medium';
    }
    
    const radiator = RADIATOR_PRICES[radiatorSize];
    radiators.push({
      space: space.name,
      size: radiatorSize,
      output: radiator.watts,
      required: heatLossWatts,
      cost: radiator.price + radiator.installation
    });
    
    totalCost += radiator.price + radiator.installation;
  });
  
  // Add TRVs for all radiators except one (open vent)
  const trvCount = Math.max(0, radiators.length - 1);
  const trvCost = trvCount * SYSTEM_COMPONENTS.thermostatic;
  totalCost += trvCost;
  
  return {
    count: radiators.length,
    breakdown: radiators,
    trvs: trvCount,
    trvCost: trvCost,
    total: totalCost
  };
}

/**
 * Calculate total system cost with grants
 */
export function calculateSystemCost(building, systemType = 'heatPump', includeGrants = true) {
  // Get recommended capacity
  const capacityKw = Math.ceil(building.totalHeatLoss * 1.2);
  
  let systemCost;
  if (systemType === 'heatPump') {
    systemCost = getHeatPumpCost(capacityKw, building);
  } else {
    systemCost = getBoilerCost(capacityKw, building);
  }
  
  // Apply grants
  let grantAmount = 0;
  if (includeGrants && systemType === 'heatPump') {
    grantAmount = GRANTS.busGrant.amount;
  }
  
  const finalCost = systemCost.total - grantAmount;
  
  return {
    systemType: systemType,
    capacity: systemCost.capacity,
    totalCost: systemCost.total,
    grantAmount: grantAmount,
    finalCost: Math.max(0, finalCost),
    breakdown: systemCost.breakdown,
    radiatorCount: systemCost.radiatorCount,
    installationDays: systemCost.installationDays,
    costPerKw: Math.round(systemCost.total / systemCost.capacity)
  };
}

/**
 * Get cost range (low to high estimate)
 */
export function getCostRange(building, systemType = 'heatPump') {
  const baseCost = calculateSystemCost(building, systemType, false);
  
  // -10% for optimistic, +15% for pessimistic
  const lowEstimate = Math.round(baseCost.totalCost * 0.9);
  const highEstimate = Math.round(baseCost.totalCost * 1.15);
  
  return {
    low: lowEstimate,
    high: highEstimate,
    average: baseCost.totalCost,
    withGrant: baseCost.finalCost
  };
}

/**
 * Calculate running costs (annual)
 */
export function calculateRunningCosts(building, systemType = 'heatPump') {
  // Average UK heating hours: ~2000 hours/year
  const heatingHours = 2000;
  const heatLossKw = building.totalHeatLoss;
  
  // Energy prices (2024/2025 average)
  const electricityPrice = 0.24; // £/kWh
  const gasPrice = 0.06; // £/kWh
  
  let annualCost;
  let efficiency;
  
  if (systemType === 'heatPump') {
    // SCOP (Seasonal Coefficient of Performance) typically 3.0-3.5
    efficiency = 3.2;
    const energyUsed = (heatLossKw * heatingHours) / efficiency;
    annualCost = energyUsed * electricityPrice;
  } else {
    // Gas boiler efficiency typically 90%
    efficiency = 0.90;
    const energyUsed = (heatLossKw * heatingHours) / efficiency;
    annualCost = energyUsed * gasPrice;
  }
  
  return {
    annualCost: Math.round(annualCost),
    dailyAverage: Math.round(annualCost / 365),
    monthlyAverage: Math.round(annualCost / 12),
    efficiency: efficiency,
    energyType: systemType === 'heatPump' ? 'electricity' : 'gas'
  };
}
