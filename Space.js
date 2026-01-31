/**
 * Space Model
 * Represents a single room/space within a building with its thermal characteristics.
 */

export class Space {
  constructor(id, name, width, depth, height, floor) {
    this.id = id;
    this.name = name;
    this.width = width;
    this.depth = depth;
    this.height = height;
    this.floor = floor;
    
    // Construction properties (assigned by Building)
    this.floorConstruction = null;
    this.ceilingConstruction = null;
    this.wallConstruction = {
      north: null,
      south: null,
      east: null,
      west: null
    };
    this.windowCharacteristics = null;
    
    // Calculated areas
    this.floorArea = 0;
    this.ceilingArea = 0;
    this.wallAreas = {
      north: 0,
      south: 0,
      east: 0,
      west: 0
    };
    
    // Heat loss (calculated by HeatLossCalculator)
    this.heatLoss = {
      floor: 0,
      ceiling: 0,
      walls: {
        north: 0,
        south: 0,
        east: 0,
        west: 0
      },
      windows: 0,
      ventilation: 0,
      total: 0
    };
    
    this.calculateAreas();
  }
  
  /**
   * Calculate surface areas
   */
  calculateAreas() {
    this.floorArea = this.width * this.depth;
    this.ceilingArea = this.width * this.depth;
    
    // Wall areas (simplified - assumes rectangular room)
    this.wallAreas.north = this.width * this.height;
    this.wallAreas.south = this.width * this.height;
    this.wallAreas.east = this.depth * this.height;
    this.wallAreas.west = this.depth * this.height;
  }
  
  /**
   * Get total wall area
   */
  getTotalWallArea() {
    return Object.values(this.wallAreas).reduce((sum, area) => sum + area, 0);
  }
  
  /**
   * Calculate window area from ACTUAL windows in layout
   */
  getWindowArea() {
    if (!this.windows || this.windows.length === 0) return 0;
    return this.windows.reduce((total, window) => {
      return total + (window.width * window.height);
    }, 0);
  }
  
  /**
   * Get window area for specific wall direction
   */
  getWindowAreaByWall(direction) {
    if (!this.windows) return 0;
    return this.windows
      .filter(w => w.wall === direction)
      .reduce((total, window) => total + (window.width * window.height), 0);
  }
  
  /**
   * Calculate door area from ACTUAL doors in layout
   */
  getDoorArea() {
    if (!this.doors || this.doors.length === 0) return 0;
    return this.doors.reduce((total, door) => {
      return total + (door.width * door.height);
    }, 0);
  }
  
  /**
   * Get door area for specific wall direction
   */
  getDoorAreaByWall(direction) {
    if (!this.doors) return 0;
    return this.doors
      .filter(d => d.wall === direction)
      .reduce((total, door) => total + (door.width * door.height), 0);
  }
  
  /**
   * Get NET wall area for specific direction (wall - windows - doors)
   */
  getNetWallAreaByDirection(direction) {
    const wallArea = this.wallAreas[direction] || 0;
    const windowArea = this.getWindowAreaByWall(direction);
    const doorArea = this.getDoorAreaByWall(direction);
    
    return Math.max(0, wallArea - windowArea - doorArea);
  }
  
  /**
   * Get net wall area (walls minus windows)
   */
  getNetWallArea() {
    return this.getTotalWallArea() - this.getWindowArea();
  }
  
  /**
   * Calculate volume
   */
  getVolume() {
    return this.width * this.depth * this.height;
  }
  
  /**
   * Update dimensions
   */
  setDimensions(width, depth, height) {
    this.width = width;
    this.depth = depth;
    if (height !== undefined) {
      this.height = height;
    }
    this.calculateAreas();
  }
  
  /**
   * Set construction for a specific wall direction
   */
  setWallConstruction(direction, construction) {
    if (this.wallConstruction.hasOwnProperty(direction)) {
      this.wallConstruction[direction] = construction;
      return true;
    }
    return false;
  }
  
  /**
   * Get total heat loss for this space
   */
  getTotalHeatLoss() {
    return this.heatLoss.total;
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      depth: this.depth,
      height: this.height,
      floor: this.floor,
      floorConstruction: this.floorConstruction,
      ceilingConstruction: this.ceilingConstruction,
      wallConstruction: this.wallConstruction,
      windowCharacteristics: this.windowCharacteristics,
      floorArea: this.floorArea,
      ceilingArea: this.ceilingArea,
      wallAreas: this.wallAreas,
      heatLoss: this.heatLoss
    };
  }
  
  /**
   * Deserialize from JSON
   */
  static fromJSON(data) {
    const space = new Space(
      data.id,
      data.name,
      data.width,
      data.depth,
      data.height,
      data.floor
    );
    
    space.floorConstruction = data.floorConstruction;
    space.ceilingConstruction = data.ceilingConstruction;
    space.wallConstruction = data.wallConstruction;
    space.windowCharacteristics = data.windowCharacteristics;
    space.floorArea = data.floorArea;
    space.ceilingArea = data.ceilingArea;
    space.wallAreas = data.wallAreas;
    space.heatLoss = data.heatLoss;
    
    return space;
  }
}
