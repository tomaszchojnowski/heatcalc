/**
 * Heat Loss Calculator
 * Calculates room-by-room and total building heat loss based on EN 12831 methodology.
 * 
 * Heat loss formula: Q = (U × A × ΔT) + (V × n × cp × ρ × ΔT)
 * Where:
 * - Q = Heat loss (W)
 * - U = U-value (W/m²K)
 * - A = Area (m²)
 * - ΔT = Temperature difference (K)
 * - V = Volume (m³)
 * - n = Air change rate (1/h)
 * - cp = Specific heat capacity of air (1005 J/kgK)
 * - ρ = Density of air (1.2 kg/m³)
 */

export class HeatLossCalculator {
  constructor(climateData = null) {
    // Default climate parameters (can be overridden with postcode-specific data)
    this.climate = climateData || {
      externalDesignTemp: -3,  // °C (UK design temperature)
      internalDesignTemp: 21,  // °C (living spaces)
      internalDesignTempBedroom: 18,  // °C (bedrooms)
      windExposure: 1.0  // Factor for exposed locations
    };
    
    // Physical constants
    this.constants = {
      airDensity: 1.2,        // kg/m³
      airSpecificHeat: 1005,  // J/kgK
      hoursToSeconds: 3600    // For W conversion
    };
  }
  
  /**
   * Calculate heat loss for entire building
   * @param {Building} building - Building object to analyze
   * @returns {Object} Complete heat loss breakdown
   */
  calculate(building) {
    const breakdown = {
      spaces: {},
      totals: {
        fabricLoss: 0,
        ventilationLoss: 0,
        totalLoss: 0
      },
      peakLoad: 0
    };
    
    // Calculate heat loss for each space
    building.getAllSpaces().forEach(space => {
      const spaceHeatLoss = this.calculateSpaceHeatLoss(space, building);
      breakdown.spaces[space.id] = spaceHeatLoss;
      
      // Accumulate totals
      breakdown.totals.fabricLoss += spaceHeatLoss.fabricLoss;
      breakdown.totals.ventilationLoss += spaceHeatLoss.ventilationLoss;
      breakdown.totals.totalLoss += spaceHeatLoss.total;
    });
    
    // Apply thermal bridging factor
    const thermalBridgingLoss = breakdown.totals.fabricLoss * building.thermal.thermalBridging;
    breakdown.totals.fabricLoss += thermalBridgingLoss;
    breakdown.totals.totalLoss += thermalBridgingLoss;
    breakdown.totals.thermalBridging = thermalBridgingLoss;
    
    // Peak load includes safety margin (typically 20%)
    breakdown.peakLoad = breakdown.totals.totalLoss * 1.2;
    
    // Update building object
    building.totalHeatLoss = breakdown.totals.totalLoss / 1000; // Convert to kW
    building.breakdown = breakdown;
    
    return breakdown;
  }
  
  /**
   * Calculate heat loss for a single space
   * @param {Space} space - Space object
   * @param {Building} building - Parent building for context
   * @returns {Object} Detailed heat loss breakdown
   */
  calculateSpaceHeatLoss(space, building) {
    const internalTemp = this.getInternalTemp(space);
    const deltaT = internalTemp - this.climate.externalDesignTemp;
    
    console.log(`Calculating heat loss for ${space.name}:`, {
      internalTemp,
      externalTemp: this.climate.externalDesignTemp,
      deltaT
    });
    
    const heatLoss = {
      floor: 0,
      ceiling: 0,
      walls: {},
      windows: 0,
      ventilation: 0,
      fabricLoss: 0,
      ventilationLoss: 0,
      total: 0
    };
    
    // Floor heat loss
    if (space.floorConstruction && space.floorConstruction.uValue > 0) {
      heatLoss.floor = this.calculateElementLoss(
        space.floorConstruction.uValue,
        space.floorArea,
        deltaT
      );
      console.log(`  Floor loss: U=${space.floorConstruction.uValue}, A=${space.floorArea}, ΔT=${deltaT}, Loss=${heatLoss.floor}W`);
    }
    
    // Ceiling/roof heat loss
    if (space.ceilingConstruction && space.ceilingConstruction.uValue > 0) {
      heatLoss.ceiling = this.calculateElementLoss(
        space.ceilingConstruction.uValue,
        space.ceilingArea,
        deltaT
      );
    }
    
    // Wall heat loss (each direction)
    const windowArea = space.getWindowArea();
    const totalWallArea = space.getTotalWallArea();
    const wallAreaPerDirection = totalWallArea / 4; // Simplified distribution
    const windowAreaPerDirection = windowArea / 4;
    
    Object.keys(space.wallConstruction).forEach(direction => {
      const wallConstruction = space.wallConstruction[direction];
      if (wallConstruction && wallConstruction.uValue > 0) {
        // Net wall area (minus windows)
        const netWallArea = wallAreaPerDirection - windowAreaPerDirection;
        heatLoss.walls[direction] = this.calculateElementLoss(
          wallConstruction.uValue,
          netWallArea,
          deltaT
        );
      } else {
        heatLoss.walls[direction] = 0;
      }
    });
    
    // Window heat loss
    if (space.windowCharacteristics && windowArea > 0) {
      heatLoss.windows = this.calculateElementLoss(
        space.windowCharacteristics.uValue,
        windowArea,
        deltaT
      );
    }
    
    // Ventilation heat loss
    heatLoss.ventilation = this.calculateVentilationLoss(
      space.getVolume(),
      building.thermal.ventilationRate,
      deltaT
    );
    
    // Calculate totals
    heatLoss.fabricLoss = 
      heatLoss.floor +
      heatLoss.ceiling +
      Object.values(heatLoss.walls).reduce((sum, val) => sum + val, 0) +
      heatLoss.windows;
    
    heatLoss.ventilationLoss = heatLoss.ventilation;
    heatLoss.total = heatLoss.fabricLoss + heatLoss.ventilationLoss;
    
    // Update space object
    space.heatLoss = {
      floor: heatLoss.floor,
      ceiling: heatLoss.ceiling,
      walls: heatLoss.walls,
      windows: heatLoss.windows,
      ventilation: heatLoss.ventilation,
      total: heatLoss.total
    };
    
    return heatLoss;
  }
  
  /**
   * Calculate heat loss through a building element
   * Q = U × A × ΔT
   */
  calculateElementLoss(uValue, area, deltaT) {
    return uValue * area * deltaT;
  }
  
  /**
   * Calculate ventilation heat loss
   * Q = V × n × cp × ρ × ΔT / 3600
   */
  calculateVentilationLoss(volume, airChangeRate, deltaT) {
    const { airDensity, airSpecificHeat, hoursToSeconds } = this.constants;
    return (volume * airChangeRate * airDensity * airSpecificHeat * deltaT) / hoursToSeconds;
  }
  
  /**
   * Get internal design temperature for space
   * Bedrooms are typically designed for 18°C, other rooms 21°C
   */
  getInternalTemp(space) {
    // Check if climate has internal temps defined
    if (!this.climate.internalDesignTemp) {
      console.error('Climate missing internalDesignTemp!', this.climate);
      return 21; // Default fallback
    }
    
    const spaceName = space.name.toLowerCase();
    if (spaceName.includes('bedroom') || spaceName.includes('bed ')) {
      return this.climate.internalDesignTempBedroom || 18;
    }
    return this.climate.internalDesignTemp || 21;
  }
  
  /**
   * Calculate heat loss per m² for comparison
   */
  calculateHeatLossPerArea(building) {
    const totalArea = building.getTotalFloorArea();
    const totalLoss = building.totalHeatLoss * 1000; // Convert back to W
    return totalLoss / totalArea;
  }
  
  /**
   * Update climate data (e.g., from postcode lookup)
   */
  setClimateData(climateData) {
    this.climate = { ...this.climate, ...climateData };
  }
  
  /**
   * Get recommended system size
   * Includes safety margin and considers emitter efficiency
   */
  getRecommendedSystemSize(building, emitterType = 'radiator') {
    const baseLoad = building.totalHeatLoss; // Already in kW
    
    // Safety margins by emitter type
    const margins = {
      radiator: 1.2,      // 20% margin
      underfloor: 1.15,   // 15% margin
      heatpump: 1.25      // 25% margin (includes defrost cycles)
    };
    
    const margin = margins[emitterType] || 1.2;
    const recommendedSize = baseLoad * margin;
    
    // Round up to nearest standard size
    const standardSizes = [5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];
    const size = standardSizes.find(s => s >= recommendedSize) || Math.ceil(recommendedSize);
    
    return {
      baseLoad: baseLoad,
      recommendedSize: size,
      margin: margin,
      marginValue: size - baseLoad
    };
  }
  
  /**
   * Calculate potential savings from upgrades
   */
  calculateUpgradeImpact(building, upgrades) {
    // Clone building to test upgrades
    const originalLoss = building.totalHeatLoss;
    const testBuilding = building.clone();
    
    // Apply upgrades
    upgrades.forEach(upgrade => {
      this.applyUpgrade(testBuilding, upgrade);
    });
    
    // Recalculate
    this.calculate(testBuilding);
    const newLoss = testBuilding.totalHeatLoss;
    
    return {
      originalLoss: originalLoss,
      newLoss: newLoss,
      savings: originalLoss - newLoss,
      savingsPercent: ((originalLoss - newLoss) / originalLoss) * 100
    };
  }
  
  /**
   * Apply a single upgrade to building
   */
  applyUpgrade(building, upgrade) {
    switch(upgrade.type) {
      case 'wall_insulation':
        building.construction.walls.external.uValue = upgrade.newUValue;
        building.getAllSpaces().forEach(space => {
          Object.keys(space.wallConstruction).forEach(dir => {
            if (space.wallConstruction[dir] && space.wallConstruction[dir].type === 'solid_brick') {
              space.wallConstruction[dir].uValue = upgrade.newUValue;
            }
          });
        });
        break;
        
      case 'loft_insulation':
        building.construction.roof.uValue = upgrade.newUValue;
        building.getAllSpaces().forEach(space => {
          if (space.ceilingConstruction && space.ceilingConstruction.type?.includes('roof')) {
            space.ceilingConstruction.uValue = upgrade.newUValue;
          }
        });
        break;
        
      case 'floor_insulation':
        building.construction.floor.ground.uValue = upgrade.newUValue;
        building.getAllSpaces().forEach(space => {
          if (space.floor === 'ground' && space.floorConstruction) {
            space.floorConstruction.uValue = upgrade.newUValue;
          }
        });
        break;
        
      case 'windows':
        building.construction.windows.uValue = upgrade.newUValue;
        building.getAllSpaces().forEach(space => {
          if (space.windowCharacteristics) {
            space.windowCharacteristics.uValue = upgrade.newUValue;
          }
        });
        break;
        
      case 'ventilation':
        building.thermal.ventilationRate = upgrade.newRate;
        break;
    }
  }
}

/**
 * Preset upgrade packages
 */
export const UPGRADE_PACKAGES = {
  basic: {
    name: 'Basic Upgrade',
    upgrades: [
      { type: 'loft_insulation', newUValue: 0.16 },
      { type: 'windows', newUValue: 1.4 }
    ]
  },
  intermediate: {
    name: 'Intermediate Upgrade',
    upgrades: [
      { type: 'loft_insulation', newUValue: 0.16 },
      { type: 'wall_insulation', newUValue: 0.30 },
      { type: 'windows', newUValue: 1.4 }
    ]
  },
  deep_retrofit: {
    name: 'Deep Retrofit',
    upgrades: [
      { type: 'loft_insulation', newUValue: 0.12 },
      { type: 'wall_insulation', newUValue: 0.20 },
      { type: 'floor_insulation', newUValue: 0.18 },
      { type: 'windows', newUValue: 0.8 },
      { type: 'ventilation', newRate: 0.5 }
    ]
  }
};
