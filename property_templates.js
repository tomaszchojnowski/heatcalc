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
      width: 4.5,        // Narrow frontage typical
      depth: 9.0,        // Long plan
      groundHeight: 2.7, // High ceilings
      firstHeight: 2.7,
      floors: 2
    },
    
    // Floor plan layout
    layout: {
      ground: [
        { id: 'living', name: 'Living Room', width: 4.2, depth: 4.5 },
        { id: 'kitchen', name: 'Kitchen', width: 4.2, depth: 4.2 },
        { id: 'hall_ground', name: 'Hallway', width: 1.2, depth: 9.0 }
      ],
      first: [
        { id: 'bedroom1', name: 'Bedroom 1', width: 4.2, depth: 4.5 },
        { id: 'bedroom2', name: 'Bedroom 2', width: 4.2, depth: 3.0 },
        { id: 'bedroom3', name: 'Bedroom 3', width: 4.2, depth: 3.0 },
        { id: 'bathroom', name: 'Bathroom', width: 2.1, depth: 2.4 }
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
          uValue: 0.7,  // Uninsulated, ventilated void
          description: 'Suspended timber, ventilated underfloor'
        },
        upper: {
          type: 'timber_joists',
          uValue: 1.5,
          description: 'Timber joists between floors'
        }
      },
      
      roof: {
        type: 'pitched_slate',
        uValue: 2.3,  // Typically no insulation
        description: 'Slate roof, uninsulated loft'
      },
      
      windows: {
        type: 'single_glazed',
        uValue: 5.0,
        frameType: 'timber_sash',
        glazingRatio: 0.15,  // % of wall area
        description: 'Original sash windows'
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
    
    dimensions: {
      width: 5.0,
      depth: 8.0,
      groundHeight: 2.5,
      firstHeight: 2.5,
      floors: 2
    },
    
    layout: {
      ground: [
        { id: 'living', name: 'Living Room', width: 4.5, depth: 4.0 },
        { id: 'dining', name: 'Dining Room', width: 3.5, depth: 3.5 },
        { id: 'kitchen', name: 'Kitchen', width: 3.0, depth: 3.5 },
        { id: 'hall_ground', name: 'Hallway', width: 1.5, depth: 6.0 }
      ],
      first: [
        { id: 'bedroom1', name: 'Bedroom 1', width: 4.5, depth: 4.0 },
        { id: 'bedroom2', name: 'Bedroom 2', width: 3.5, depth: 3.5 },
        { id: 'bedroom3', name: 'Bedroom 3', width: 3.0, depth: 3.0 },
        { id: 'bathroom', name: 'Bathroom', width: 2.5, depth: 2.5 }
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
          uValue: 0.8,
          description: 'Solid concrete slab'
        },
        upper: {
          type: 'timber_joists',
          uValue: 1.5,
          description: 'Timber joists'
        }
      },
      
      roof: {
        type: 'pitched_tile',
        uValue: 1.8,
        description: 'Clay tile, minimal insulation'
      },
      
      windows: {
        type: 'single_glazed',
        uValue: 4.8,
        frameType: 'timber_casement',
        glazingRatio: 0.18,
        description: 'Timber casement windows'
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
    
    dimensions: {
      width: 7.0,
      depth: 8.0,
      groundHeight: 2.4,
      firstHeight: 2.4,
      floors: 2
    },
    
    layout: {
      ground: [
        { id: 'living', name: 'Living Room', width: 5.0, depth: 4.5 },
        { id: 'dining', name: 'Dining Room', width: 4.0, depth: 3.5 },
        { id: 'kitchen', name: 'Kitchen', width: 4.0, depth: 3.0 },
        { id: 'utility', name: 'Utility', width: 2.0, depth: 2.0 },
        { id: 'hall_ground', name: 'Hallway', width: 2.0, depth: 5.0 }
      ],
      first: [
        { id: 'bedroom1', name: 'Master Bedroom', width: 4.5, depth: 4.0 },
        { id: 'bedroom2', name: 'Bedroom 2', width: 3.5, depth: 3.5 },
        { id: 'bedroom3', name: 'Bedroom 3', width: 3.5, depth: 3.0 },
        { id: 'bedroom4', name: 'Bedroom 4', width: 3.0, depth: 2.5 },
        { id: 'bathroom', name: 'Bathroom', width: 3.0, depth: 2.5 }
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
          uValue: 0.6,
          description: 'Concrete slab, minimal insulation'
        },
        upper: {
          type: 'timber_joists',
          uValue: 1.5,
          description: 'Timber joists'
        }
      },
      
      roof: {
        type: 'pitched_tile',
        uValue: 0.6,
        description: 'Some loft insulation (50-100mm)'
      },
      
      windows: {
        type: 'double_glazed',
        uValue: 3.0,
        frameType: 'timber',
        glazingRatio: 0.20,
        description: 'Early double glazing'
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
    
    dimensions: {
      width: 6.0,
      depth: 7.0,
      groundHeight: 2.4,
      firstHeight: 2.4,
      floors: 2
    },
    
    layout: {
      ground: [
        { id: 'living_kitchen', name: 'Open Plan Living', width: 5.5, depth: 5.0 },
        { id: 'hall_ground', name: 'Hallway', width: 1.5, depth: 4.0 },
        { id: 'wc', name: 'WC', width: 1.5, depth: 1.5 }
      ],
      first: [
        { id: 'bedroom1', name: 'Master Bedroom', width: 4.0, depth: 3.5 },
        { id: 'bedroom2', name: 'Bedroom 2', width: 3.5, depth: 3.0 },
        { id: 'bedroom3', name: 'Bedroom 3', width: 3.0, depth: 2.5 },
        { id: 'bathroom', name: 'Bathroom', width: 3.0, depth: 2.5 }
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
          uValue: 0.22,
          description: 'Insulated concrete slab'
        },
        upper: {
          type: 'timber_joists',
          uValue: 1.5,
          description: 'Engineered joists'
        }
      },
      
      roof: {
        type: 'insulated_truss',
        uValue: 0.16,
        description: '270mm loft insulation'
      },
      
      windows: {
        type: 'double_glazed_low_e',
        uValue: 1.4,
        frameType: 'upvc',
        glazingRatio: 0.25,
        description: 'Low-E double glazing'
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
    
    dimensions: {
      width: 8.0,
      depth: 6.0,
      groundHeight: 2.4,
      floors: 1
    },
    
    layout: {
      ground: [
        { id: 'living_kitchen', name: 'Living/Kitchen', width: 5.0, depth: 4.0 },
        { id: 'bedroom1', name: 'Bedroom 1', width: 4.0, depth: 3.0 },
        { id: 'bedroom2', name: 'Bedroom 2', width: 3.5, depth: 3.0 },
        { id: 'bathroom', name: 'Bathroom', width: 2.5, depth: 2.5 },
        { id: 'hall', name: 'Hallway', width: 1.5, depth: 4.0 }
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
          uValue: 0.0,  // Heated space below
          description: 'Concrete floor (flat below)'
        }
      },
      
      roof: {
        type: 'concrete',
        uValue: 0.0,  // Heated space above
        description: 'Concrete ceiling (flat above)'
      },
      
      windows: {
        type: 'double_glazed',
        uValue: 3.0,
        frameType: 'upvc',
        glazingRatio: 0.20,
        description: 'Standard double glazing'
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
