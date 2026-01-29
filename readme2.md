# 🏠 HeatCalc - Home Heating Assessment App

Quick heating system cost estimates for UK properties.

## 📁 Project Structure

```
/heating-app
├── index.html                    # Main app entry point
├── styles.css                    # Global glassmorphism styles
│
├── /core
│   ├── router.js                 # Screen navigation
│   ├── state.js                  # State management with undo/redo
│   └── Building.js               # Building data model
│   └── Space.js                  # Space/room model
│
├── /data
│   ├── propertyTemplates.js      # UK property archetypes
│   ├── climateData.js            # Regional climate data
│   └── pricingData.js            # System costs & calculations
│
├── /calculators
│   └── HeatLossCalculator.js     # EN 12831 heat loss engine
│
├── /screens
│   ├── InputScreen.js            # Postcode + property selection
│   ├── LoadingScreen.js          # Progress + calculations
│   └── ResultsScreen.js          # Heat loss & cost display
│
└── /reference
    ├── construction-reference.html  # Material reference (dynamic)
    ├── test-state.html              # State management tests
    └── test-calculator.html         # Calculator tests
```

## 🚀 Quick Start

### 1. File Setup

Place all files in a single directory:

**Core Files (Required):**
- `index.html`
- `styles.css`
- `router.js`
- `state.js`
- `Building.js`
- `Space.js`
- `propertyTemplates.js`
- `climateData.js`
- `pricingData.js`
- `HeatLossCalculator.js`
- `InputScreen.js`
- `LoadingScreen.js`
- `ResultsScreen.js`

### 2. Run the App

**Option A: Local Server (Recommended)**
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

**Option B: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

**⚠️ Important:** Must use a server (not `file://`) for ES6 modules to work.

### 3. Test the App

1. **Enter postcode**: e.g., "SW1A 1AA"
2. **Select property type**: e.g., "Victorian Terrace"
3. **Click Continue**
4. Watch loading animation
5. View results with heat loss and costs

## 🧪 Testing

### Test Pages (Optional)

**State Management:**
```
http://localhost:8000/test-state.html
```
- Test save/load
- Test undo/redo
- Test building modifications

**Calculator:**
```
http://localhost:8000/test-calculator.html
```
- Test heat loss calculations
- Test pricing engine
- Test climate data

**Construction Reference:**
```
http://localhost:8000/construction-reference.html
```
- View all property types
- See material U-values
- Dynamic data from templates

## 🎮 Debug Console

Open browser console (F12) and use:

```javascript
// Navigation
window.__nav.toInput()
window.__nav.toResults()

// State inspection
window.__debugState()

// Router inspection
window.__debugRouter()
```

## 📊 Data Flow

```
User Input (Postcode + Property Type)
    ↓
InputScreen → State
    ↓
LoadingScreen
    ├─ HeatLossCalculator
    └─ Pricing Engine
    ↓
ResultsScreen
    └─ Display results
```

## 🔑 Key Features

**✅ Currently Working:**
- Postcode validation & climate lookup
- 5 UK property templates
- Heat loss calculation (EN 12831)
- System cost estimation (heat pump & boiler)
- State management with undo/redo
- Auto-save to localStorage
- Screen navigation with history
- Glassmorphism UI design

**🚧 Coming Next:**
- 3D building viewer
- Fine-tune editing screen
- Modifications (extensions/conversions)
- PDF export
- URL sharing

## 🐛 Troubleshooting

**Blank screen?**
- Check browser console for errors
- Ensure running on local server (not file://)
- Verify all .js files are in same directory

**Modules not loading?**
- Must use http:// or https:// (not file://)
- Check file paths are correct
- Ensure ES6 modules supported (modern browser)

**State not persisting?**
- Check localStorage is enabled
- Look for browser privacy settings
- Try different browser

**Calculations showing NaN?**
- Open test-calculator.html
- Check console for specific errors
- Verify propertyTemplates.js loaded

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires ES6 modules, CSS backdrop-filter, and localStorage.

## 💡 Development Tips

**Adding a new property template:**
1. Edit `propertyTemplates.js`
2. Add new template object
3. Reload app - it auto-updates everywhere

**Modifying U-values:**
1. Edit values in `propertyTemplates.js`
2. Check `construction-reference.html` to verify
3. Run `test-calculator.html` to test

**Changing styles:**
1. Edit `styles.css`
2. Use CSS variables for consistency
3. Changes apply across all screens

## 🎨 Design System

**Colors:**
- Primary: `#667eea` → `#764ba2` (gradient)
- Accent: `#4ade80` (green)
- Warning: `#fbbf24` (amber)
- Danger: `#ef4444` (red)

**Spacing Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

**Components:**
- `.glass-card` - Main container
- `.btn` - Buttons (variants: primary, secondary, solid)
- `.input` - Form inputs
- `.status-bar` - Sticky header

## 📄 License

Private project - All rights reserved

## 🤝 Contributing

This is a development project. No contributions accepted at this time.

---

**Version:** 0.1.0 (Alpha)  
**Last Updated:** January 2026