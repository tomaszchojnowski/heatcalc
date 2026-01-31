/**
 * Building Model
 * Core data structure representing a complete building with floors, spaces, and thermal properties.
 */

import { Space } from './Space.js';

export class Building {
  constructor(template) {
    this.id = this.generateId();
    this.propertyType = template.id;
    this.propertyName = template.name;
    this.era = template.era;
    
    // Physical dimensions
    this.dimensions = { ...template.dimensions };
    
    // Construction characteristics
    this.construction = JSON.parse(JSON.stringify(template.construction));
    this.thermal = { ...template.thermal };
    this.costs = { ...template.costs };
    
    // Spaces organized by floor
    this.floors = {};
    
    // Initialize spaces from template
    this.initializeFromTemplate(template);
    
    // Calculated values (populated by calculator)
    this.totalHeatLoss = 0;
    this.systemCost = 0;
    this.breakdown = null;
  }
  
  /**
   * Generate unique ID for building instance
   */
  generateId() {
    return `bldg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Initialize spaces from property template
   */
  initializeFromTemplate(template) {
    Object.keys(template.layout).forEach(floorKey => {
      this.floors[floorKey] = {
        name: this.getFloorName(floorKey),
        spaces: []
      };
      
      template.layout[floorKey].forEach(roomData => {
        const space = new Space(
          roomData.id,
          roomData.name,
          roomData.width,
          roomData.depth,
          this.dimensions[`${floorKey}Height`] || this.dimensions.groundHeight,
          floorKey
        );
        
        // Assign construction types to space
        this.assignConstructionToSpace(space, floorKey, template);
        
        this.floors[floorKey].spaces.push(space);
      });
    });
  }
  
  /**
   * Assign appropriate construction types to a space based on its position
   */
  assignConstructionToSpace(space, floorKey, template) {
    // Floor construction
    if (floorKey === 'ground') {
      space.floorConstruction = JSON.parse(JSON.stringify(template.construction.floor.ground));
    } else {
      space.floorConstruction = JSON.parse(JSON.stringify(template.construction.floor.upper));
    }
    
    // Ceiling/roof construction
    const floorKeys = Object.keys(template.layout);
    const isTopFloor = floorKeys.indexOf(floorKey) === floorKeys.length - 1;
    
    if (isTopFloor) {
      space.ceilingConstruction = JSON.parse(JSON.stringify(template.construction.roof));
    } else {
      space.ceilingConstruction = JSON.parse(JSON.stringify(template.construction.floor.upper));
    }
    
    // Find corresponding room data from layout
    const roomData = template.layout[floorKey].find(r => r.id === space.id);
    
    // Assign windows and doors from layout (SINGLE POINT OF TRUTH)
    if (roomData) {
      space.windows = roomData.windows ? JSON.parse(JSON.stringify(roomData.windows)) : [];
      space.doors = roomData.doors ? JSON.parse(JSON.stringify(roomData.doors)) : [];
    } else {
      space.windows = [];
      space.doors = [];
    }
    
    // Initialize all walls as internal by default
    space.wallConstruction = {
      north: JSON.parse(JSON.stringify(template.construction.walls.internal)),
      south: JSON.parse(JSON.stringify(template.construction.walls.internal)),
      east: JSON.parse(JSON.stringify(template.construction.walls.internal)),
      west: JSON.parse(JSON.stringify(template.construction.walls.internal))
    };
    
    // Assign wall types based on room data
    if (roomData) {
      // External walls
      if (roomData.externalWalls) {
        roomData.externalWalls.forEach(direction => {
          space.wallConstruction[direction] = JSON.parse(JSON.stringify(template.construction.walls.external));
        });
      }
      
      // Party walls (shared with neighbors - no heat loss)
      if (roomData.partyWalls && template.construction.walls.party) {
        roomData.partyWalls.forEach(direction => {
          space.wallConstruction[direction] = JSON.parse(JSON.stringify(template.construction.walls.party));
        });
      }
      
      // Internal walls remain as already set
    }
    
    // Window and door characteristics from construction
    space.windowCharacteristics = JSON.parse(JSON.stringify(template.construction.windows));
    space.doorCharacteristics = template.construction.doors ? JSON.parse(JSON.stringify(template.construction.doors)) : null;
  }
  
  /**
   * Get human-readable floor name
   */
  getFloorName(floorKey) {
    const names = {
      ground: 'Ground Floor',
      first: 'First Floor',
      second: 'Second Floor',
      third: 'Third Floor'
    };
    return names[floorKey] || floorKey;
  }
  
  /**
   * Get all spaces across all floors
   */
  getAllSpaces() {
    const spaces = [];
    Object.values(this.floors).forEach(floor => {
      spaces.push(...floor.spaces);
    });
    return spaces;
  }
  
  /**
   * Get space by ID
   */
  getSpace(spaceId) {
    return this.getAllSpaces().find(s => s.id === spaceId);
  }
  
  /**
   * Update space dimensions
   */
  updateSpaceDimensions(spaceId, width, depth) {
    const space = this.getSpace(spaceId);
    if (space) {
      space.width = width;
      space.depth = depth;
      space.calculateAreas();
      return true;
    }
    return false;
  }
  
  /**
   * Update construction type for a space element
   */
  updateConstruction(spaceId, element, construction) {
    const space = this.getSpace(spaceId);
    if (!space) return false;
    
    switch(element) {
      case 'floor':
        space.floorConstruction = construction;
        break;
      case 'ceiling':
        space.ceilingConstruction = construction;
        break;
      case 'wall':
        // If construction has direction, update specific wall
        if (construction.direction) {
          space.wallConstruction[construction.direction] = construction;
        }
        break;
      default:
        return false;
    }
    
    return true;
  }
  
  /**
   * Calculate total floor area
   */
  getTotalFloorArea() {
    return this.getAllSpaces().reduce((total, space) => {
      return total + space.floorArea;
    }, 0);
  }
  
  /**
   * Get external dimensions
   */
  getExternalDimensions() {
    return {
      width: this.dimensions.width,
      depth: this.dimensions.depth,
      totalHeight: this.getTotalHeight()
    };
  }
  
  /**
   * Calculate total building height
   */
  getTotalHeight() {
    let totalHeight = 0;
    Object.keys(this.floors).forEach(floorKey => {
      totalHeight += this.dimensions[`${floorKey}Height`] || this.dimensions.groundHeight;
    });
    return totalHeight;
  }
  
  /**
   * Serialize to JSON for storage/sharing
   */
  toJSON() {
    return {
      id: this.id,
      propertyType: this.propertyType,
      propertyName: this.propertyName,
      era: this.era,
      dimensions: this.dimensions,
      construction: this.construction,
      thermal: this.thermal,
      costs: this.costs,
      floors: this.serializeFloors(),
      totalHeatLoss: this.totalHeatLoss,
      systemCost: this.systemCost,
      breakdown: this.breakdown
    };
  }
  
  /**
   * Serialize floors and spaces
   */
  serializeFloors() {
    const serialized = {};
    Object.keys(this.floors).forEach(floorKey => {
      serialized[floorKey] = {
        name: this.floors[floorKey].name,
        spaces: this.floors[floorKey].spaces.map(space => space.toJSON())
      };
    });
    return serialized;
  }
  
  /**
   * Deserialize from JSON
   */
  static fromJSON(data) {
    const building = Object.create(Building.prototype);
    
    building.id = data.id;
    building.propertyType = data.propertyType;
    building.propertyName = data.propertyName;
    building.era = data.era;
    building.dimensions = data.dimensions;
    building.construction = data.construction;
    building.thermal = data.thermal;
    building.costs = data.costs;
    building.totalHeatLoss = data.totalHeatLoss || 0;
    building.systemCost = data.systemCost || 0;
    building.breakdown = data.breakdown;
    
    // Deserialize floors and spaces
    building.floors = {};
    Object.keys(data.floors).forEach(floorKey => {
      building.floors[floorKey] = {
        name: data.floors[floorKey].name,
        spaces: data.floors[floorKey].spaces.map(spaceData => 
          Space.fromJSON(spaceData)
        )
      };
    });
    
    return building;
  }
  
  /**
   * Clone building
   */
  clone() {
    return Building.fromJSON(this.toJSON());
  }
}
