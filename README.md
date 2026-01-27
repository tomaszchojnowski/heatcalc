# 🏠 HeatCalc
Instant heating system estimates

File Structure Plan:
'''
/home-heating-app
├── /public
│   ├── index.html                 # Main entry point (minimal)
│   └── /assets
│       └── /models               # Optional: pre-built 3D assets
│
├── /src
│   ├── /core
│   │   ├── app.js               # App initialization & routing (150 lines)
│   │   ├── state.js             # Global state management (100 lines)
│   │   └── router.js            # Screen transitions (80 lines)
│   │
│   ├── /data
│   │   ├── propertyTemplates.js  # Property type definitions (200 lines)
│   │   ├── materialLibrary.js    # Wall/floor/roof materials & U-values (150 lines)
│   │   ├── climateData.js        # Regional heating degree days (100 lines)
│   │   └── pricingData.js        # Equipment & labor costs (100 lines)
│   │
│   ├── /models
│   │   ├── Building.js           # Building data structure (150 lines)
│   │   ├── Space.js              # Room/space object (100 lines)
│   │   ├── Wall.js               # Wall object with thermal props (80 lines)
│   │   └── HeatLossCalculator.js # Core calculation engine (200 lines)
│   │
│   ├── /screens
│   │   ├── InputScreen.js        # Postcode + property type (120 lines)
│   │   ├── LoadingScreen.js      # Loading animation (60 lines)
│   │   ├── ResultsScreen.js      # Main results view (150 lines)
│   │   ├── DetailEditScreen.js   # Fine-tune interface (180 lines)
│   │   └── ModificationsScreen.js # Extensions/conversions (120 lines)
│   │
│   ├── /components
│   │   ├── ModelViewer3D.js      # Three.js wrapper (200 lines)
│   │   ├── PropertyCard.js       # Reusable property info card (80 lines)
│   │   ├── CostBreakdown.js      # Cost display component (100 lines)
│   │   ├── SpaceEditor.js        # Room dimension editor (150 lines)
│   │   └── WallEditor.js         # Wall property editor (120 lines)
│   │
│   ├── /ui
│   │   ├── Button.js             # Reusable button component (40 lines)
│   │   ├── Input.js              # Form inputs (60 lines)
│   │   ├── Card.js               # Glassmorphic card (50 lines)
│   │   └── Modal.js              # Modal/popup component (80 lines)
│   │
│   ├── /utils
│   │   ├── geometry.js           # 3D geometry helpers (100 lines)
│   │   ├── validators.js         # Input validation (60 lines)
│   │   ├── formatters.js         # Number/currency formatting (50 lines)
│   │   ├── urlSerializer.js      # URL state encoding/decoding (100 lines)
│   │   └── exporters.js          # PDF/DXF export functions (150 lines)
│   │
│   ├── /services
│   │   ├── PostcodeService.js    # Postcode lookup API (80 lines)
│   │   ├── StorageService.js     # localStorage wrapper (60 lines)
│   │   └── AnalyticsService.js   # Usage tracking (optional) (50 lines)
│   │
│   ├── styles.css                # Global styles (300 lines)
│   └── main.js                   # Entry point that imports everything (50 lines)
│
├── /tests
│   ├── calculations.test.js      # Heat loss calculation tests
│   ├── geometry.test.js          # 3D geometry tests
│   └── urlSerializer.test.js     # URL serialization tests
│
├── package.json
├── vite.config.js                # Build configuration
└── README.md
'''
