# SpaceEditor.js - Room Dimension Editor with Live 3D Preview

## Overview
Interactive screen for editing individual room dimensions with real-time 3D model updates. Changes to width, depth, and height are immediately reflected in the 3D visualization.

---

## Features

### ✅ Implemented

**1. Room Selection**
- Floor selector (Ground/First)
- List of all rooms on selected floor
- Click to select room for editing

**2. Dimension Editing**
- Width (1.0m - 20.0m)
- Depth (1.0m - 20.0m)  
- Height (2.0m - 4.0m)
- Dual input: Number field + Slider
- Both inputs synchronized

**3. Live 3D Preview**
- ModelViewer3D instance in right panel
- Rebuilds 3D model on dimension change
- Debounced updates (150ms) for smooth performance
- Auto-rotate enabled

**4. Real-time Calculations**
- Floor area (width × depth)
- Volume (width × depth × height)
- Updates as you type/drag

**5. Visual Feedback**
- Selected room highlighted in list
- Volume displayed prominently
- Warning if room has external walls

**6. Save/Cancel**
- Save: Updates building state and returns to results
- Cancel: Restores original building, discards changes

---

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  Edit Room Dimensions        [Cancel] [Save Changes]    │
├──────────────────┬──────────────────────────────────────┤
│  [Ground] [First]│                                      │
│                  │                                      │
│  ┌─────────────┐ │         Live 3D Preview             │
│  │ Living Room │ │                                      │
│  │ 2.94m × 4.5m│ │                                      │
│  ├─────────────┤ │        [3D Model Here]              │
│  │ Hallway     │ │                                      │
│  │ 1.0m × 9.0m │ │                                      │
│  └─────────────┘ │                                      │
│                  │                                      │
│  ┌─────────────┐ │                                      │
│  │ Width (m)   │ │                                      │
│  │ [2.94] [═══]│ │                                      │
│  │             │ │                                      │
│  │ Depth (m)   │ │                                      │
│  │ [4.50] [═══]│ │                                      │
│  │             │ │                                      │
│  │ Height (m)  │ │                                      │
│  │ [2.70] [═══]│ │                                      │
│  │             │ │                                      │
│  │ Volume      │ │                                      │
│  │  35.94 m³   │ │                                      │
│  └─────────────┘ │                                      │
└──────────────────┴──────────────────────────────────────┘
```

---

## How It Works

### Data Flow

```
User changes slider/input
    ↓
updateDimension(dimension, value)
    ↓
selectedSpace[dimension] = value
    ↓
selectedSpace.recalculateAreas()
    ↓
Update UI (volume, area displays)
    ↓
debounce3DUpdate() [150ms delay]
    ↓
update3DModel()
    ↓
Dispose old ModelViewer3D
    ↓
Create new ModelViewer3D with updated building
    ↓
3D model reflects new dimensions
```

---

## Key Methods

### `enter(container, data)`
- Gets building from state
- Creates working copy (for cancel functionality)
- Renders UI
- Initializes 3D viewer

### `selectSpace(spaceId)`
- Sets selectedSpace
- Re-renders dimension editor
- Updates space list highlighting

### `updateDimension(dimension, value)`
- Updates space property (width/depth/height)
- Recalculates areas
- Updates UI displays
- Triggers debounced 3D update

### `debounce3DUpdate()`
- Waits 150ms after last change
- Prevents excessive 3D rebuilds
- Ensures smooth interaction

### `update3DModel()`
- Disposes old 3D viewer
- Creates new viewer with updated building
- Maintains auto-rotate setting

### `save()`
- Updates building state with changes
- Navigates to results screen

### `cancel()`
- Restores original building
- Discards all changes
- Navigates to results screen

---

## Integration Requirements

### 1. Register Screen in index.html

```javascript
import { SpaceEditor } from './SpaceEditor.js';

const spaceEditor = new SpaceEditor();
registerScreen('space-editor', spaceEditor);
```

### 2. Add Navigation from ResultsScreen

In ResultsScreen.js, add button to access space editor:

```javascript
<button onclick="navigateTo('space-editor')" class="btn btn-primary">
  Edit Room Dimensions
</button>
```

### 3. Add to Debug Navigation

```javascript
window.__nav = {
  toInput: () => navigateTo('input'),
  toResults: () => navigateTo('results'),
  toEdit: () => navigateTo('edit'),
  toSpaceEditor: () => navigateTo('space-editor')  // NEW
};
```

---

## Technical Details

### Performance Optimization

**Debouncing:**
- 3D updates debounced at 150ms
- Prevents rebuilding model on every slider movement
- Balances responsiveness with performance

**Update Strategy:**
- Lightweight UI updates (volume, area) are immediate
- Heavy 3D rebuilds are debounced
- `isUpdating` flag prevents feedback loops

### State Management

**Working Copy:**
- Creates Building copy on enter
- All edits modify the copy
- Original stored for cancel
- Only saved copy affects global state

**No Undo/Redo:**
- Simple save/cancel model
- Clear user intent
- Prevents complex state tracking

---

## UI/UX Features

### Input Methods

**Dual Control:**
```html
<input type="number" step="0.1" />  <!-- Precise entry -->
<input type="range" step="0.1" />   <!-- Quick adjustment -->
```
- Both synchronized in real-time
- Number input for precision
- Slider for exploration

### Visual Feedback

**Selected Room:**
- Blue background highlight
- Thicker blue border
- Clearly distinct from unselected

**Volume Display:**
- Large, prominent
- Green accent color
- Updates live

**Warnings:**
- Yellow alert for external walls
- Informs user of potential impacts

---

## Validation & Constraints

### Dimension Limits

```javascript
Width:  1.0m  - 20.0m  (step 0.1m)
Depth:  1.0m  - 20.0m  (step 0.1m)
Height: 2.0m  - 4.0m   (step 0.1m)
```

**Rationale:**
- Min width/depth: 1.0m (minimum practical room size)
- Max width/depth: 20.0m (reasonable residential limit)
- Min height: 2.0m (building regulation minimum)
- Max height: 4.0m (unusual for residential, but possible)

### Future Enhancements

**Boundary Checking (Not Yet Implemented):**
- Detect overlaps with adjacent rooms
- Warn if room extends beyond building footprint
- Suggest automatic adjustment of adjacent rooms
- Validate against building constraints

---

## Dependencies

```javascript
import { getState, updateBuilding } from './state.js';
import { navigateTo } from './router.js';
import { Building } from './Building.js';
import { ModelViewer3D } from './ModelViewer3d.js';
```

**Required:**
- State management system
- Router for navigation
- Building class with toJSON/fromJSON
- ModelViewer3D for 3D rendering
- Space class with recalculateAreas()

---

## CSS Requirements

**Existing Classes Used:**
- `.glass-card` - Container styling
- `.btn` `.btn-primary` `.btn-secondary` - Buttons
- `.input` - Input fields
- `.container` - Layout wrapper

**Custom Inline Styles:**
- Grid layout (400px sidebar + flex main)
- Hover effects on room list
- Color coding (blue=selected, green=volume, yellow=warning)

---

## Example Usage

### From Results Screen
```javascript
// Add button to ResultsScreen.js
<button 
  onclick="navigateTo('space-editor')" 
  class="btn btn-primary"
>
  🏠 Edit Room Sizes
</button>
```

### User Flow
1. User clicks "Edit Room Sizes" from results
2. Sees list of rooms on ground floor
3. Clicks "Living Room"
4. Adjusts width slider from 2.94m to 3.50m
5. Sees 3D model update in real-time
6. Adjusts depth to 5.00m
7. Sees volume update: 3.50 × 5.00 × 2.70 = 47.25 m³
8. Clicks "Save Changes"
9. Returns to results with updated building

---

## Known Limitations

1. **No overlap detection** - User can create impossible geometries
2. **No building boundary checks** - Rooms can extend beyond envelope
3. **No adjacent room adjustment** - Changing one room doesn't affect neighbors
4. **No position editing** - Can only change dimensions, not room location
5. **No undo stack** - Only save/cancel (no intermediate undo)

### Recommended Future Additions

**Phase 2:**
- Overlap detection and warnings
- Building boundary validation
- Automatic adjacent room adjustment

**Phase 3:**
- Room position editing (drag in 2D plan view)
- Wall sharing detection
- Constraint-based layout engine

---

## Testing Checklist

- [ ] Load screen with existing building
- [ ] Switch between ground and first floor
- [ ] Select different rooms
- [ ] Adjust width slider - 3D updates
- [ ] Adjust depth input field - 3D updates
- [ ] Adjust height - 3D updates
- [ ] Verify volume calculation correct
- [ ] Verify area calculation correct
- [ ] Click cancel - changes discarded
- [ ] Make changes and save - persists to state
- [ ] External wall warning appears correctly
- [ ] 3D model auto-rotates smoothly
- [ ] Debouncing prevents lag on fast slider movement

---

## File Size & Performance

**File Size:** ~19KB (unminified)
**Dependencies:** 4 imports
**3D Performance:** Rebuilds entire model on change
**Update Latency:** 150ms debounce
**Memory:** Creates new Building copy on enter

**Optimization Notes:**
- Debouncing critical for smooth slider interaction
- Model rebuild is expensive but necessary for accuracy
- Could optimize by only updating changed space geometry (future)

---

## Code Quality

**✅ Strengths:**
- Clear separation of concerns
- Consistent naming conventions
- Comprehensive inline comments
- Defensive programming (null checks)
- Proper cleanup on exit (dispose viewer)

**⚠️ Areas for Improvement:**
- Could extract dimension input rendering to separate method
- Hard-coded dimension limits could be constants
- Warning logic could be more sophisticated

---

**Status:** ✅ Ready for integration and testing
**Next Steps:** 
1. Add to index.html
2. Add navigation from ResultsScreen
3. Test with all building types
4. Consider adding overlap detection in future
