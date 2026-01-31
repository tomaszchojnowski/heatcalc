/**
 * Property Templates
 * Defines standard UK property archetypes with typical dimensions,
 * construction materials, and thermal performance characteristics.
 * 
 * Data sources: CACI Acorn, English Housing Survey, Building Research Establishment
 */

export const PROPERTY_TEMPLATES = {
  victorian_terrace: {
    id: 'victorian_terrace',
    name: 'Victorian Terrace',
    era: '1837-1901',
    commonBedrooms: 3,
    
    // External dimensions (meters)
    dimensions: {
      width: 4.5,        // Narrow frontage (north-south)
      depth: 9.0,        // Long plan (east-west)
      groundHeight: 2.7, // High ceilings
      firstHeight: 2.7,
      floors: 2,
      // Building height breakdown
      groundFloorLevel: 0.3,     // Suspended floor buildup
      firstFloorLevel: 3.3,      // 0.3 + 2.7 + 0.3 (floor + space + joists)
      roofLevel: 6.3,            // First floor level + first height + joists
      roofPitch: 45,             // degrees
      roofRidgeHeight: 8.55      // Peak of roof (6.3 + 4.5/2 * tan(45°))
    },
    
    // 3D orientation
    orientation: {
      front: 'north',     // Front facade faces north
      rear: 'south',      // Rear faces south
      left: 'west',       // Left party wall
      right: 'east'       // Right party wall
    },
    
    // Floor plan layout with precise positioning
    layout: {
      ground: [
        { 
          id: 'living', 
          name: 'Living Room', 
          width: 2.94,    // Adjusted to fit: 4.5 - 0.23*2 - 1.0 - 0.1
          depth: 4.5,
          position: { x: 0.23, z: 0 },  // After left party wall
          externalWalls: ['north'],      // Front wall only
          partyWalls: ['west'],          // Left party wall
          internalWalls: ['east'],       // Wall to hallway
          windows: [
            { wall: 'north', width: 1.5, height: 2.0, position: 0.7, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'hallway', 
          name: 'Hallway', 
          width: 1.0,
          depth: 9.0,    // Full depth
          position: { x: 3.27, z: 0 },  // 0.23 + 2.94 + 0.1
          externalWalls: ['north', 'south'],  // Front and rear
          partyWalls: ['east'],               // Right party wall
          internalWalls: ['west'],            // Wall to living/kitchen
          doors: [
            { wall: 'north', width: 0.9, height: 2.1, position: 0.05, type: 'external' }
          ]
        },
        { 
          id: 'kitchen', 
          name: 'Kitchen', 
          width: 2.94,
          depth: 4.5,
          position: { x: 0.23, z: 4.5 },  // Rear left
          externalWalls: ['south'],
          partyWalls: ['west'],
          internalWalls: ['east'],
          windows: [
            { wall: 'south', width: 1.2, height: 1.5, position: 0.8, sillHeight: 0.9 }
          ]
        }
      ],
      first: [
        { 
          id: 'bedroom1', 
          name: 'Bedroom 1', 
          width: 2.94,
          depth: 4.5,
          position: { x: 0.23, z: 0 },
          externalWalls: ['north'],
          partyWalls: ['west'],
          internalWalls: ['east'],
          windows: [
            { wall: 'north', width: 1.5, height: 1.8, position: 0.7, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom3', 
          name: 'Bedroom 3', 
          width: 1.0,
          depth: 3.0,
          position: { x: 3.27, z: 0 },
          externalWalls: ['north'],
          partyWalls: ['east'],
          internalWalls: ['west', 'south'],
          windows: [
            { wall: 'north', width: 1.0, height: 1.5, position: 0.0, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom2', 
          name: 'Bedroom 2', 
          width: 2.94,
          depth: 3.0,
          position: { x: 0.23, z: 6.0 },
          externalWalls: ['south'],
          partyWalls: ['west'],
          internalWalls: ['east'],
          windows: [
            { wall: 'south', width: 1.2, height: 1.5, position: 0.9, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bathroom', 
          name: 'Bathroom', 
          width: 1.0,
          depth: 6.0,
          position: { x: 3.27, z: 3.0 },
          externalWalls: ['south'],
          partyWalls: ['east'],
          internalWalls: ['west'],
          windows: [
            { wall: 'south', width: 0.6, height: 0.8, position: 0.2, sillHeight: 1.5 }
          ]
        }
      ]
    },
    
    // Construction characteristics
    construction: {
      walls: {
        external: {
          type: 'solid_brick',
          thickness: 0.23,
          uValue: 2.1,  // Uninsulated
          description: 'Solid brick, no cavity'
        },
        party: {
          type: 'solid_brick',
          thickness: 0.23,
          uValue: 0.0,  // Shared with neighbor (no heat loss)
          description: 'Shared party wall'
        },
        internal: {
          type: 'lath_plaster',
          thickness: 0.10,
          uValue: 1.5,
          description: 'Timber lath and plaster'
        }
      },
      
      floor: {
        ground: {
          type: 'suspended_timber',
          thickness: 0.30,  // Timber joists + floorboards + void
          uValue: 0.7,  // Uninsulated, ventilated void
          description: 'Suspended timber, ventilated underfloor'
        },
        upper: {
          type: 'timber_joists',
          thickness: 0.25,  // Joists + floorboards + ceiling plaster
          uValue: 1.5,
          description: 'Timber joists between floors'
        }
      },
      
      roof: {
        type: 'pitched_slate',
        thickness: 0.20,  // Slates + battens + felt
        uValue: 2.3,  // Typically no insulation
        description: 'Slate roof, uninsulated loft'
      },
      
      windows: {
        type: 'single_glazed',
        uValue: 5.0,
        frameType: 'timber_sash',
        description: 'Original sash windows'
      },
      
      doors: {
        external: {
          type: 'timber_panel',
          thickness: 0.045,
          uValue: 3.0,
          description: 'Solid timber panel door'
        },
        internal: {
          type: 'timber_panel',
          thickness: 0.035,
          uValue: 2.0,
          description: 'Timber panel door'
        }
      }
    },
    
    // Thermal performance
    thermal: {
      ventilationRate: 1.5,  // Air changes per hour (draughty)
      thermalBridging: 0.15  // Additional heat loss factor
    },
    
    // Cost factors
    costs: {
      radiatorComplexity: 1.2,  // Higher due to wall thickness
      pipeworkComplexity: 1.3   // Harder to route pipes
    }
  },

  semi_1930s: {
    id: 'semi_1930s',
    name: '1930s Semi-Detached',
    era: '1919-1939',
    commonBedrooms: 3,
    
    // External dimensions (meters)
    dimensions: {
      width: 5.0,        // Front-to-back (north-south)
      depth: 8.0,        // Side-to-side (east-west)
      groundHeight: 2.5,
      firstHeight: 2.5,
      floors: 2,
      // Building height breakdown
      groundFloorLevel: 0.15,     // Solid floor buildup
      firstFloorLevel: 2.8,       // 0.15 + 2.5 + 0.15 (floor + space + joists)
      roofLevel: 5.45,            // First floor level + first height + joists
      roofPitch: 40,              // degrees
      roofRidgeHeight: 8.8        // Peak of roof (5.45 + 8.0/2 * tan(40°)) - ridge runs along depth
    },
    
    // 3D orientation
    orientation: {
      front: 'north',     // Front facade faces north
      rear: 'south',      // Rear faces south
      left: 'west',       // Left party wall (shared with neighbor)
      right: 'east'       // Right side (detached)
    },
    
    // Floor plan layout with precise positioning
    layout: {
      ground: [
        { 
          id: 'living', 
          name: 'Living Room', 
          width: 3.4,
          depth: 4.0,
          position: { x: 0.28, z: 0 },
          externalWalls: ['north', 'east'],
          partyWalls: ['west'],
          internalWalls: ['south'],
          windows: [
            { wall: 'north', width: 1.8, height: 1.5, position: 0.8, sillHeight: 0.9 },
            { wall: 'east', width: 1.5, height: 1.5, position: 1.0, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'hall_ground', 
          name: 'Hallway', 
          width: 1.2,
          depth: 8.0,
          position: { x: 3.8, z: 0 },
          externalWalls: ['north', 'south'],
          partyWalls: [],
          internalWalls: ['west'],
          windows: [
            { wall: 'north', width: 0.6, height: 1.8, position: 0.3, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'dining', 
          name: 'Dining Room', 
          width: 3.4,
          depth: 3.5,
          position: { x: 0.28, z: 4.0 },
          externalWalls: ['east'],
          partyWalls: ['west'],
          internalWalls: ['north', 'south'],
          windows: [
            { wall: 'east', width: 1.5, height: 1.5, position: 1.0, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'kitchen', 
          name: 'Kitchen', 
          width: 3.4,
          depth: 4.0,
          position: { x: 0.28, z: 4.0 },
          externalWalls: ['south', 'east'],
          partyWalls: ['west'],
          internalWalls: ['north'],
          windows: [
            { wall: 'south', width: 1.2, height: 1.2, position: 0.8, sillHeight: 0.9 },
            { wall: 'east', width: 1.0, height: 1.2, position: 1.5, sillHeight: 0.9 }
          ]
        }
      ],
      first: [
        { 
          id: 'bedroom1', 
          name: 'Bedroom 1', 
          width: 3.4,
          depth: 4.0,
          position: { x: 0.28, z: 0 },
          externalWalls: ['north', 'east'],
          partyWalls: ['west'],
          internalWalls: ['south'],
          windows: [
            { wall: 'north', width: 1.5, height: 1.5, position: 0.9, sillHeight: 0.9 },
            { wall: 'east', width: 1.2, height: 1.5, position: 1.2, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom2', 
          name: 'Bedroom 2', 
          width: 3.4,
          depth: 3.5,
          position: { x: 0.28, z: 4.0 },
          externalWalls: ['east'],
          partyWalls: ['west'],
          internalWalls: ['north', 'south'],
          windows: [
            { wall: 'east', width: 1.2, height: 1.5, position: 1.0, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom3', 
          name: 'Bedroom 3', 
          width: 3.4,
          depth: 4.0,
          position: { x: 0.28, z: 4.0 },
          externalWalls: ['south', 'east'],
          partyWalls: ['west'],
          internalWalls: ['north'],
          windows: [
            { wall: 'south', width: 1.2, height: 1.2, position: 1.0, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bathroom', 
          name: 'Bathroom', 
          width: 1.2,
          depth: 2.5,
          position: { x: 3.8, z: 5.5 },
          externalWalls: ['south'],
          partyWalls: [],
          internalWalls: ['north', 'west'],
          windows: [
            { wall: 'south', width: 0.6, height: 0.8, position: 0.3, sillHeight: 1.5 }
          ]
        }
      ]
    },
    
    construction: {
      walls: {
        external: {
          type: 'cavity_uninsulated',
          thickness: 0.28,
          uValue: 1.5,
          description: '9" cavity wall, no insulation'
        },
        party: {
          type: 'cavity_wall',
          thickness: 0.28,
          uValue: 0.0,
          description: 'Shared party wall'
        },
        internal: {
          type: 'brick_plaster',
          thickness: 0.10,
          uValue: 1.5,
          description: 'Single brick, plastered'
        }
      },
      
      floor: {
        ground: {
          type: 'solid_concrete',
          thickness: 0.15,  // Concrete slab
          uValue: 0.8,
          description: 'Solid concrete slab'
        },
        upper: {
          type: 'timber_joists',
          thickness: 0.25,  // Joists + floorboards + ceiling
          uValue: 1.5,
          description: 'Timber joists'
        }
      },
      
      roof: {
        type: 'pitched_tile',
        thickness: 0.18,  // Clay tiles + battens
        uValue: 1.8,
        description: 'Clay tile, minimal insulation'
      },
      
      windows: {
        type: 'single_glazed',
        uValue: 4.8,
        frameType: 'timber_casement',
        description: 'Timber casement windows'
      },
      
      doors: {
        external: {
          type: 'timber_panel',
          thickness: 0.045,
          uValue: 3.0,
          description: 'Solid timber panel door'
        },
        internal: {
          type: 'timber_panel',
          thickness: 0.035,
          uValue: 2.0,
          description: 'Timber panel door'
        }
      }
    },
    
    thermal: {
      ventilationRate: 1.2,
      thermalBridging: 0.10
    },
    
    costs: {
      radiatorComplexity: 1.0,
      pipeworkComplexity: 1.0
    }
  },

  postwar_detached: {
    id: 'postwar_detached',
    name: 'Post-War Detached',
    era: '1945-1980',
    commonBedrooms: 4,
    
    // External dimensions (meters)
    dimensions: {
      width: 7.0,        // Front-to-back (north-south)
      depth: 8.0,        // Side-to-side (east-west)
      groundHeight: 2.4,
      firstHeight: 2.4,
      floors: 2,
      // Building height breakdown
      groundFloorLevel: 0.2,      // Concrete slab buildup
      firstFloorLevel: 2.75,      // 0.2 + 2.4 + 0.15 (floor + space + joists)
      roofLevel: 5.3,             // First floor level + first height + joists
      roofPitch: 35,              // degrees
      roofRidgeHeight: 7.9        // Peak of roof (5.3 + 7.0/2 * tan(35°)) - ridge runs along width
    },
    
    // 3D orientation
    orientation: {
      front: 'north',     // Front facade faces north
      rear: 'south',      // Rear faces south
      left: 'west',       // Left side (detached)
      right: 'east'       // Right side (detached)
    },
    
    // Floor plan layout with precise positioning
    layout: {
      ground: [
        { 
          id: 'living', 
          name: 'Living Room', 
          width: 4.5,
          depth: 4.5,
          position: { x: 0.28, z: 0.28 },
          externalWalls: ['north', 'west'],
          partyWalls: [],
          internalWalls: ['south', 'east'],
          windows: [
            { wall: 'north', width: 2.0, height: 1.5, position: 1.2, sillHeight: 0.9 },
            { wall: 'west', width: 1.5, height: 1.5, position: 1.5, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'dining', 
          name: 'Dining Room', 
          width: 3.5,
          depth: 3.5,
          position: { x: 0.28, z: 4.93 },
          externalWalls: ['west'],
          partyWalls: [],
          internalWalls: ['north', 'south', 'east'],
          windows: [
            { wall: 'west', width: 1.5, height: 1.5, position: 1.0, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'hall_ground', 
          name: 'Hallway', 
          width: 1.8,
          depth: 5.0,
          position: { x: 4.93, z: 0.28 },
          externalWalls: ['north'],
          partyWalls: [],
          internalWalls: ['west', 'south'],
          windows: [
            { wall: 'north', width: 0.8, height: 1.8, position: 0.5, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'kitchen', 
          name: 'Kitchen', 
          width: 3.5,
          depth: 3.0,
          position: { x: 3.22, z: 4.93 },
          externalWalls: ['south', 'east'],
          partyWalls: [],
          internalWalls: ['north', 'west'],
          windows: [
            { wall: 'south', width: 1.2, height: 1.2, position: 0.9, sillHeight: 0.9 },
            { wall: 'east', width: 1.0, height: 1.2, position: 0.5, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'utility', 
          name: 'Utility', 
          width: 1.5,
          depth: 2.0,
          position: { x: 5.22, z: 5.93 },
          externalWalls: ['south', 'east'],
          partyWalls: [],
          internalWalls: ['north', 'west'],
          windows: [
            { wall: 'east', width: 0.6, height: 0.8, position: 0.7, sillHeight: 1.5 }
          ]
        }
      ],
      first: [
        { 
          id: 'bedroom1', 
          name: 'Master Bedroom', 
          width: 4.0,
          depth: 4.0,
          position: { x: 0.28, z: 0.28 },
          externalWalls: ['north', 'west'],
          partyWalls: [],
          internalWalls: ['south', 'east'],
          windows: [
            { wall: 'north', width: 1.8, height: 1.5, position: 1.1, sillHeight: 0.9 },
            { wall: 'west', width: 1.5, height: 1.5, position: 1.2, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom2', 
          name: 'Bedroom 2', 
          width: 3.0,
          depth: 3.5,
          position: { x: 0.28, z: 4.43 },
          externalWalls: ['west', 'south'],
          partyWalls: [],
          internalWalls: ['north', 'east'],
          windows: [
            { wall: 'west', width: 1.2, height: 1.5, position: 1.1, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom3', 
          name: 'Bedroom 3', 
          width: 3.0,
          depth: 3.0,
          position: { x: 3.43, z: 0.28 },
          externalWalls: ['north', 'east'],
          partyWalls: [],
          internalWalls: ['south', 'west'],
          windows: [
            { wall: 'north', width: 1.2, height: 1.2, position: 0.9, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom4', 
          name: 'Bedroom 4', 
          width: 2.5,
          depth: 2.5,
          position: { x: 4.22, z: 3.43 },
          externalWalls: ['east'],
          partyWalls: [],
          internalWalls: ['north', 'south', 'west'],
          windows: [
            { wall: 'east', width: 1.0, height: 1.2, position: 0.7, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bathroom', 
          name: 'Bathroom', 
          width: 2.5,
          depth: 2.0,
          position: { x: 4.22, z: 6.0 },
          externalWalls: ['south', 'east'],
          partyWalls: [],
          internalWalls: ['north', 'west'],
          windows: [
            { wall: 'east', width: 0.6, height: 0.8, position: 0.7, sillHeight: 1.5 }
          ]
        }
      ]
    },
    
    construction: {
      walls: {
        external: {
          type: 'cavity_partial_insulation',
          thickness: 0.28,
          uValue: 1.2,
          description: 'Cavity wall, partial fill insulation'
        },
        internal: {
          type: 'blockwork_plaster',
          thickness: 0.10,
          uValue: 1.8,
          description: 'Lightweight blockwork'
        }
      },
      
      floor: {
        ground: {
          type: 'solid_concrete',
          thickness: 0.20,  // Concrete slab with minimal insulation
          uValue: 0.6,
          description: 'Concrete slab, minimal insulation'
        },
        upper: {
          type: 'timber_joists',
          thickness: 0.25,  // Joists + floorboards + ceiling
          uValue: 1.5,
          description: 'Timber joists'
        }
      },
      
      roof: {
        type: 'pitched_tile',
        thickness: 0.20,  // Tiles + insulation layer
        uValue: 0.6,
        description: 'Some loft insulation (50-100mm)'
      },
      
      windows: {
        type: 'double_glazed',
        uValue: 3.0,
        frameType: 'timber',
        description: 'Early double glazing'
      },
      
      doors: {
        external: {
          type: 'composite_panel',
          thickness: 0.045,
          uValue: 1.8,
          description: 'Composite panel door with insulation'
        },
        internal: {
          type: 'hollow_core',
          thickness: 0.035,
          uValue: 2.0,
          description: 'Hollow core door'
        }
      }
    },
    
    thermal: {
      ventilationRate: 1.0,
      thermalBridging: 0.08
    },
    
    costs: {
      radiatorComplexity: 0.9,
      pipeworkComplexity: 0.9
    }
  },

  newbuild: {
    id: 'newbuild',
    name: 'New Build',
    era: '2010-present',
    commonBedrooms: 3,
    
    // External dimensions (meters)
    dimensions: {
      width: 6.0,        // Front-to-back (north-south)
      depth: 7.0,        // Side-to-side (east-west)
      groundHeight: 2.4,
      firstHeight: 2.4,
      floors: 2,
      // Building height breakdown
      groundFloorLevel: 0.25,     // Insulated slab buildup
      firstFloorLevel: 2.8,       // 0.25 + 2.4 + 0.15 (floor + space + joists)
      roofLevel: 5.35,            // First floor level + first height + joists
      roofPitch: 35,              // degrees
      roofRidgeHeight: 7.8        // Peak of roof (5.35 + 7.0/2 * tan(35°)) - ridge runs along depth
    },
    
    // 3D orientation
    orientation: {
      front: 'north',     // Front facade faces north
      rear: 'south',      // Rear faces south (garden)
      left: 'west',       // Left side
      right: 'east'       // Right side
    },
    
    // Floor plan layout with precise positioning
    layout: {
      ground: [
        { 
          id: 'living_kitchen', 
          name: 'Open Plan Living', 
          width: 4.9,
          depth: 5.0,
          position: { x: 0.3, z: 0.3 },
          externalWalls: ['north', 'west', 'south'],
          partyWalls: [],
          internalWalls: ['east'],
          windows: [
            { wall: 'north', width: 2.0, height: 2.0, position: 1.4, sillHeight: 0.9 },
            { wall: 'west', width: 1.5, height: 2.0, position: 1.7, sillHeight: 0.9 },
            { wall: 'south', width: 2.4, height: 2.0, position: 1.3, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'hall_ground', 
          name: 'Hallway', 
          width: 0.8,
          depth: 4.0,
          position: { x: 5.3, z: 0.3 },
          externalWalls: ['north', 'east'],
          partyWalls: [],
          internalWalls: ['west', 'south'],
          windows: [
            { wall: 'north', width: 0.5, height: 1.8, position: 0.15, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'wc', 
          name: 'WC', 
          width: 0.8,
          depth: 1.5,
          position: { x: 5.3, z: 4.4 },
          externalWalls: ['east'],
          partyWalls: [],
          internalWalls: ['north', 'west', 'south'],
          windows: [
            { wall: 'east', width: 0.4, height: 0.6, position: 0.55, sillHeight: 1.5 }
          ]
        }
      ],
      first: [
        { 
          id: 'bedroom1', 
          name: 'Master Bedroom', 
          width: 3.5,
          depth: 3.5,
          position: { x: 0.3, z: 0.3 },
          externalWalls: ['north', 'west'],
          partyWalls: [],
          internalWalls: ['south', 'east'],
          windows: [
            { wall: 'north', width: 1.5, height: 1.5, position: 1.0, sillHeight: 0.9 },
            { wall: 'west', width: 1.2, height: 1.5, position: 1.1, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom2', 
          name: 'Bedroom 2', 
          width: 3.0,
          depth: 3.0,
          position: { x: 0.3, z: 4.0 },
          externalWalls: ['west', 'south'],
          partyWalls: [],
          internalWalls: ['north', 'east'],
          windows: [
            { wall: 'west', width: 1.2, height: 1.2, position: 0.9, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom3', 
          name: 'Bedroom 3', 
          width: 2.5,
          depth: 2.5,
          position: { x: 3.4, z: 0.3 },
          externalWalls: ['north', 'east'],
          partyWalls: [],
          internalWalls: ['south', 'west'],
          windows: [
            { wall: 'north', width: 1.0, height: 1.2, position: 0.75, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bathroom', 
          name: 'Bathroom', 
          width: 2.5,
          depth: 4.0,
          position: { x: 3.4, z: 3.0 },
          externalWalls: ['south', 'east'],
          partyWalls: [],
          internalWalls: ['north', 'west'],
          windows: [
            { wall: 'east', width: 0.6, height: 0.8, position: 1.7, sillHeight: 1.5 }
          ]
        }
      ]
    },
    
    construction: {
      walls: {
        external: {
          type: 'cavity_full_insulation',
          thickness: 0.30,
          uValue: 0.28,
          description: 'Full cavity insulation, Building Regs compliant'
        },
        internal: {
          type: 'plasterboard_stud',
          thickness: 0.10,
          uValue: 2.0,
          description: 'Timber stud partition'
        }
      },
      
      floor: {
        ground: {
          type: 'insulated_slab',
          thickness: 0.25,  // Concrete slab + insulation layer
          uValue: 0.22,
          description: 'Insulated concrete slab'
        },
        upper: {
          type: 'timber_joists',
          thickness: 0.25,  // Engineered joists + flooring + ceiling
          uValue: 1.5,
          description: 'Engineered joists'
        }
      },
      
      roof: {
        type: 'insulated_truss',
        thickness: 0.30,  // Tiles + 270mm insulation + structure
        uValue: 0.16,
        description: '270mm loft insulation'
      },
      
      windows: {
        type: 'double_glazed_low_e',
        uValue: 1.4,
        frameType: 'upvc',
        description: 'Low-E double glazing'
      },
      
      doors: {
        external: {
          type: 'composite_insulated',
          thickness: 0.045,
          uValue: 1.0,
          description: 'Modern composite door, highly insulated'
        },
        internal: {
          type: 'hollow_core',
          thickness: 0.035,
          uValue: 2.0,
          description: 'Hollow core door'
        }
      }
    },
    
    thermal: {
      ventilationRate: 0.5,  // Good air tightness
      thermalBridging: 0.05
    },
    
    costs: {
      radiatorComplexity: 0.8,
      pipeworkComplexity: 0.8
    }
  },

  flat: {
    id: 'flat',
    name: 'Flat/Apartment',
    era: 'Various',
    commonBedrooms: 2,
    
    // External dimensions (meters)
    dimensions: {
      width: 8.0,        // Front-to-back (north-south)
      depth: 6.0,        // Side-to-side (east-west)
      groundHeight: 2.4,
      floors: 1,
      // Building height breakdown
      groundFloorLevel: 0,        // Concrete floor (flat below)
      roofLevel: 2.4,             // Ceiling (flat above)
      roofPitch: 0,               // Flat ceiling (no pitched roof)
      roofRidgeHeight: 2.4        // Same as roofLevel
    },
    
    // 3D orientation
    orientation: {
      front: 'north',     // Front facade faces north
      rear: 'south',      // Rear faces south
      left: 'west',       // Left party wall
      right: 'east'       // Right party wall (or external)
    },
    
    // Floor plan layout with precise positioning
    layout: {
      ground: [
        { 
          id: 'living_kitchen', 
          name: 'Living/Kitchen', 
          width: 4.5,
          depth: 4.0,
          position: { x: 0.2, z: 0.2 },
          externalWalls: ['north'],
          partyWalls: ['west'],
          internalWalls: ['south', 'east'],
          windows: [
            { wall: 'north', width: 2.0, height: 1.5, position: 1.2, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'hall', 
          name: 'Hallway', 
          width: 1.2,
          depth: 4.0,
          position: { x: 4.8, z: 0.2 },
          externalWalls: ['north'],
          partyWalls: [],
          internalWalls: ['west', 'south'],
          windows: [
            { wall: 'north', width: 0.5, height: 1.2, position: 0.35, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bedroom1', 
          name: 'Bedroom 1', 
          width: 3.0,
          depth: 3.0,
          position: { x: 0.2, z: 4.3 },
          externalWalls: [],
          partyWalls: ['west', 'south'],
          internalWalls: ['north', 'east'],
          windows: []
        },
        { 
          id: 'bedroom2', 
          name: 'Bedroom 2', 
          width: 2.8,
          depth: 3.0,
          position: { x: 3.3, z: 4.3 },
          externalWalls: ['south'],
          partyWalls: [],
          internalWalls: ['north', 'west', 'east'],
          windows: [
            { wall: 'south', width: 1.2, height: 1.2, position: 0.8, sillHeight: 0.9 }
          ]
        },
        { 
          id: 'bathroom', 
          name: 'Bathroom', 
          width: 1.7,
          depth: 2.5,
          position: { x: 6.1, z: 4.3 },
          externalWalls: ['south', 'east'],
          partyWalls: [],
          internalWalls: ['north', 'west'],
          windows: [
            { wall: 'east', width: 0.6, height: 0.6, position: 0.95, sillHeight: 1.5 }
          ]
        }
      ]
    },
    
    construction: {
      walls: {
        external: {
          type: 'cavity_partial_insulation',
          thickness: 0.28,
          uValue: 1.5,
          description: 'Typical apartment construction'
        },
        party: {
          type: 'blockwork',
          thickness: 0.20,
          uValue: 0.0,  // No heat loss to adjacent flats
          description: 'Party wall to adjacent flat'
        },
        internal: {
          type: 'blockwork_plaster',
          thickness: 0.10,
          uValue: 1.8,
          description: 'Blockwork partition'
        }
      },
      
      floor: {
        ground: {
          type: 'concrete',
          thickness: 0.20,  // Concrete slab (heated space below - no heat loss)
          uValue: 0.0,  // Heated space below
          description: 'Concrete floor (flat below)'
        }
      },
      
      roof: {
        type: 'concrete',
        thickness: 0.20,  // Concrete ceiling (heated space above - no heat loss)
        uValue: 0.0,  // Heated space above
        description: 'Concrete ceiling (flat above)'
      },
      
      windows: {
        type: 'double_glazed',
        uValue: 3.0,
        frameType: 'upvc',
        description: 'Standard double glazing'
      },
      
      doors: {
        external: {
          type: 'composite_panel',
          thickness: 0.045,
          uValue: 1.8,
          description: 'Apartment entrance door'
        },
        internal: {
          type: 'hollow_core',
          thickness: 0.035,
          uValue: 2.0,
          description: 'Hollow core door'
        }
      }
    },
    
    thermal: {
      ventilationRate: 0.8,
      thermalBridging: 0.05
    },
    
    costs: {
      radiatorComplexity: 0.7,
      pipeworkComplexity: 0.7
    }
  }
};

/**
 * Get template by ID
 */
export function getTemplate(templateId) {
  return PROPERTY_TEMPLATES[templateId];
}

/**
 * Get all template IDs
 */
export function getAllTemplateIds() {
  return Object.keys(PROPERTY_TEMPLATES);
}

/**
 * Calculate total floor area for a template
 */
export function calculateFloorArea(template) {
  let totalArea = 0;
  
  Object.keys(template.layout).forEach(floorKey => {
    const rooms = template.layout[floorKey];
    rooms.forEach(room => {
      totalArea += room.width * room.depth;
    });
  });
  
  return totalArea;
}
