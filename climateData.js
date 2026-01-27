/**
 * Climate Data
 * UK regional climate data for heating calculations.
 * Based on CIBSE design temperatures and heating degree days.
 */

/**
 * UK Climate Regions
 * Design temperatures for different regions based on CIBSE Guide A
 */
export const CLIMATE_REGIONS = {
  london: {
    name: 'London',
    externalDesignTemp: -3,
    heatingDegreeDays: 2050,
    windExposure: 0.9,
    altitude: 20
  },
  southeast: {
    name: 'South East England',
    externalDesignTemp: -3,
    heatingDegreeDays: 2150,
    windExposure: 1.0,
    altitude: 50
  },
  southwest: {
    name: 'South West England',
    externalDesignTemp: -2,
    heatingDegreeDays: 2000,
    windExposure: 1.1,
    altitude: 100
  },
  eastAnglia: {
    name: 'East Anglia',
    externalDesignTemp: -3,
    heatingDegreeDays: 2200,
    windExposure: 1.1,
    altitude: 30
  },
  eastMidlands: {
    name: 'East Midlands',
    externalDesignTemp: -4,
    heatingDegreeDays: 2300,
    windExposure: 1.0,
    altitude: 100
  },
  westMidlands: {
    name: 'West Midlands',
    externalDesignTemp: -4,
    heatingDegreeDays: 2250,
    windExposure: 1.0,
    altitude: 120
  },
  northwest: {
    name: 'North West England',
    externalDesignTemp: -4,
    heatingDegreeDays: 2350,
    windExposure: 1.2,
    altitude: 100
  },
  northeast: {
    name: 'North East England',
    externalDesignTemp: -5,
    heatingDegreeDays: 2450,
    windExposure: 1.2,
    altitude: 80
  },
  yorkshire: {
    name: 'Yorkshire and Humber',
    externalDesignTemp: -4,
    heatingDegreeDays: 2400,
    windExposure: 1.1,
    altitude: 90
  },
  wales: {
    name: 'Wales',
    externalDesignTemp: -3,
    heatingDegreeDays: 2200,
    windExposure: 1.2,
    altitude: 150
  },
  scotland: {
    name: 'Scotland',
    externalDesignTemp: -6,
    heatingDegreeDays: 2700,
    windExposure: 1.3,
    altitude: 200
  },
  northernIreland: {
    name: 'Northern Ireland',
    externalDesignTemp: -4,
    heatingDegreeDays: 2400,
    windExposure: 1.2,
    altitude: 100
  }
};

/**
 * UK Postcode Area to Region Mapping
 * Maps postcode areas (first 1-2 letters) to climate regions
 */
export const POSTCODE_TO_REGION = {
  // London
  'E': 'london',
  'EC': 'london',
  'N': 'london',
  'NW': 'london',
  'SE': 'london',
  'SW': 'london',
  'W': 'london',
  'WC': 'london',
  
  // South East
  'BR': 'southeast',
  'CR': 'southeast',
  'DA': 'southeast',
  'EN': 'southeast',
  'GU': 'southeast',
  'HA': 'southeast',
  'HP': 'southeast',
  'KT': 'southeast',
  'ME': 'southeast',
  'MK': 'southeast',
  'OX': 'southeast',
  'RG': 'southeast',
  'RM': 'southeast',
  'SL': 'southeast',
  'SM': 'southeast',
  'TN': 'southeast',
  'TW': 'southeast',
  'UB': 'southeast',
  'WD': 'southeast',
  
  // South West
  'BA': 'southwest',
  'BH': 'southwest',
  'BS': 'southwest',
  'DT': 'southwest',
  'EX': 'southwest',
  'GL': 'southwest',
  'PL': 'southwest',
  'SN': 'southwest',
  'SP': 'southwest',
  'TA': 'southwest',
  'TQ': 'southwest',
  'TR': 'southwest',
  
  // East Anglia
  'CB': 'eastAnglia',
  'CM': 'eastAnglia',
  'CO': 'eastAnglia',
  'IP': 'eastAnglia',
  'NR': 'eastAnglia',
  'PE': 'eastAnglia',
  'SG': 'eastAnglia',
  'SS': 'eastAnglia',
  
  // East Midlands
  'DE': 'eastMidlands',
  'LE': 'eastMidlands',
  'LN': 'eastMidlands',
  'NG': 'eastMidlands',
  'NN': 'eastMidlands',
  
  // West Midlands
  'B': 'westMidlands',
  'CV': 'westMidlands',
  'DY': 'westMidlands',
  'HR': 'westMidlands',
  'ST': 'westMidlands',
  'SY': 'westMidlands',
  'TF': 'westMidlands',
  'WR': 'westMidlands',
  'WS': 'westMidlands',
  'WV': 'westMidlands',
  
  // North West
  'BB': 'northwest',
  'BL': 'northwest',
  'CA': 'northwest',
  'CH': 'northwest',
  'CW': 'northwest',
  'FY': 'northwest',
  'L': 'northwest',
  'LA': 'northwest',
  'M': 'northwest',
  'OL': 'northwest',
  'PR': 'northwest',
  'SK': 'northwest',
  'WA': 'northwest',
  'WN': 'northwest',
  
  // North East
  'DH': 'northeast',
  'DL': 'northeast',
  'NE': 'northeast',
  'SR': 'northeast',
  'TS': 'northeast',
  
  // Yorkshire
  'BD': 'yorkshire',
  'DN': 'yorkshire',
  'HD': 'yorkshire',
  'HG': 'yorkshire',
  'HU': 'yorkshire',
  'HX': 'yorkshire',
  'LS': 'yorkshire',
  'S': 'yorkshire',
  'WF': 'yorkshire',
  'YO': 'yorkshire',
  
  // Wales
  'CF': 'wales',
  'LD': 'wales',
  'LL': 'wales',
  'NP': 'wales',
  'SA': 'wales',
  
  // Scotland
  'AB': 'scotland',
  'DD': 'scotland',
  'DG': 'scotland',
  'EH': 'scotland',
  'FK': 'scotland',
  'G': 'scotland',
  'HS': 'scotland',
  'IV': 'scotland',
  'KA': 'scotland',
  'KW': 'scotland',
  'KY': 'scotland',
  'ML': 'scotland',
  'PA': 'scotland',
  'PH': 'scotland',
  'TD': 'scotland',
  'ZE': 'scotland',
  
  // Northern Ireland
  'BT': 'northernIreland'
};

/**
 * Internal design temperatures by room type (°C)
 */
export const INTERNAL_TEMPERATURES = {
  living: 21,
  bedroom: 18,
  bathroom: 22,
  kitchen: 18,
  hallway: 18,
  utility: 16,
  conservatory: 18,
  default: 21
};

/**
 * Extract postcode area from full postcode
 * Examples: "SW1A 1AA" -> "SW", "M1 1AA" -> "M", "BS1 1AA" -> "BS"
 */
export function extractPostcodeArea(postcode) {
  if (!postcode) return null;
  
  // Remove spaces and convert to uppercase
  const clean = postcode.replace(/\s/g, '').toUpperCase();
  
  // Extract letters from the start
  const match = clean.match(/^([A-Z]{1,2})/);
  return match ? match[1] : null;
}

/**
 * Get climate region from postcode
 */
export function getRegionFromPostcode(postcode) {
  const area = extractPostcodeArea(postcode);
  if (!area) return null;
  
  return POSTCODE_TO_REGION[area] || null;
}

/**
 * Get climate data for a postcode
 */
export function getClimateData(postcode) {
  const regionKey = getRegionFromPostcode(postcode);
  
  if (!regionKey) {
    // Return default (South East England) if postcode not recognized
    return {
      ...CLIMATE_REGIONS.southeast,
      postcode: postcode,
      regionKey: 'southeast',
      isDefault: true
    };
  }
  
  return {
    ...CLIMATE_REGIONS[regionKey],
    postcode: postcode,
    regionKey: regionKey,
    isDefault: false
  };
}

/**
 * Get internal temperature for a space
 */
export function getInternalTemperature(spaceName) {
  const name = spaceName.toLowerCase();
  
  if (name.includes('living') || name.includes('lounge')) return INTERNAL_TEMPERATURES.living;
  if (name.includes('bedroom') || name.includes('bed ')) return INTERNAL_TEMPERATURES.bedroom;
  if (name.includes('bathroom') || name.includes('shower')) return INTERNAL_TEMPERATURES.bathroom;
  if (name.includes('kitchen')) return INTERNAL_TEMPERATURES.kitchen;
  if (name.includes('hall')) return INTERNAL_TEMPERATURES.hallway;
  if (name.includes('utility')) return INTERNAL_TEMPERATURES.utility;
  if (name.includes('conservatory')) return INTERNAL_TEMPERATURES.conservatory;
  
  return INTERNAL_TEMPERATURES.default;
}

/**
 * Calculate temperature difference for a space
 */
export function getTemperatureDifference(spaceName, externalTemp) {
  const internalTemp = getInternalTemperature(spaceName);
  return internalTemp - externalTemp;
}

/**
 * Get all available regions
 */
export function getAllRegions() {
  return Object.keys(CLIMATE_REGIONS).map(key => ({
    key: key,
    name: CLIMATE_REGIONS[key].name,
    externalDesignTemp: CLIMATE_REGIONS[key].externalDesignTemp,
    heatingDegreeDays: CLIMATE_REGIONS[key].heatingDegreeDays
  }));
}

/**
 * Validate UK postcode format
 */
export function validatePostcode(postcode) {
  if (!postcode) return false;
  
  // UK postcode regex pattern
  const pattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  const clean = postcode.replace(/\s/g, '').toUpperCase();
  
  return pattern.test(clean);
}

/**
 * Format postcode consistently
 */
export function formatPostcode(postcode) {
  if (!postcode) return '';
  
  const clean = postcode.replace(/\s/g, '').toUpperCase();
  
  // Add space before last 3 characters
  if (clean.length > 3) {
    return clean.slice(0, -3) + ' ' + clean.slice(-3);
  }
  
  return clean;
}

/**
 * Estimate annual heating cost based on climate
 */
export function estimateAnnualHeatingCost(heatLossKw, regionKey, fuelType = 'gas') {
  const region = CLIMATE_REGIONS[regionKey] || CLIMATE_REGIONS.southeast;
  
  // Heating hours derived from degree days
  // Rough approximation: HDD / 10 = heating hours per year
  const heatingHours = region.heatingDegreeDays / 10 * 24;
  
  // Fuel prices (2024/2025 average)
  const fuelPrices = {
    gas: 0.06,        // £/kWh
    electricity: 0.24, // £/kWh
    oil: 0.08         // £/kWh
  };
  
  // System efficiencies
  const efficiencies = {
    gas: 0.90,           // Modern condensing boiler
    electricity: 3.2,    // Heat pump SCOP
    oil: 0.85            // Oil boiler
  };
  
  const fuelPrice = fuelPrices[fuelType] || fuelPrices.gas;
  const efficiency = efficiencies[fuelType] || efficiencies.gas;
  
  let energyUsed;
  if (fuelType === 'electricity') {
    // Heat pump - divide by SCOP
    energyUsed = (heatLossKw * heatingHours) / efficiency;
  } else {
    // Boilers - divide by efficiency %
    energyUsed = (heatLossKw * heatingHours) / efficiency;
  }
  
  const annualCost = energyUsed * fuelPrice;
  
  return {
    annualCost: Math.round(annualCost),
    monthlyAverage: Math.round(annualCost / 12),
    heatingHours: Math.round(heatingHours),
    energyUsed: Math.round(energyUsed),
    fuelType: fuelType,
    efficiency: efficiency
  };
}

/**
 * Compare heating costs across regions
 */
export function compareRegionalCosts(heatLossKw, fuelType = 'gas') {
  const comparison = {};
  
  Object.keys(CLIMATE_REGIONS).forEach(regionKey => {
    comparison[regionKey] = {
      name: CLIMATE_REGIONS[regionKey].name,
      cost: estimateAnnualHeatingCost(heatLossKw, regionKey, fuelType)
    };
  });
  
  return comparison;
}

/**
 * Get coldest regions (for installer targeting)
 */
export function getColdestRegions(limit = 5) {
  const regions = getAllRegions();
  return regions
    .sort((a, b) => a.externalDesignTemp - b.externalDesignTemp)
    .slice(0, limit);
}
