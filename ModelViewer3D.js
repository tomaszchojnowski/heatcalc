/**
 * ModelViewer3D
 * Three.js-based 3D building visualization with thermal performance coloring.
 */

export class ModelViewer3D {
  constructor(container, building, options = {}) {
    this.container = container;
    this.building = building;
    this.options = {
      autoRotate: true,
      rotateSpeed: 0.003,
      enableSelection: true,
      showLabels: true,
      ...options
    };
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.meshes = [];
    this.selectedMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.isDragging = false;
    this.isAutoRotating = true;
    this.rotation = { x: 0.3, y: 0 };
    
    this.init();
  }
  
  /**
   * Initialize Three.js scene
   */
  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6675dd);
    
    // Get building dimensions for dynamic camera positioning
    const template = this.getTemplate();
    const dims = template.dimensions || { width: 6, depth: 8, roofRidgeHeight: 8 };
    
    // Calculate camera parameters from building size
    const maxDimension = Math.max(dims.width, dims.depth, dims.roofRidgeHeight || 8);
    const cameraDistance = maxDimension * 2.5;
    const buildingCenterY = (dims.roofRidgeHeight || 8) / 2;
    const buildingCenterX = dims.width / 2;
    const buildingCenterZ = dims.depth / 2;
    
    // Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(cameraDistance * 0.7, cameraDistance * 0.5, cameraDistance * 0.7);
    this.camera.lookAt(buildingCenterX, buildingCenterY, buildingCenterZ);
    
    // Store camera target for orbit controls
    this.cameraTarget = new THREE.Vector3(buildingCenterX, buildingCenterY, buildingCenterZ);
    this.cameraRadius = cameraDistance;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    
    // Grid helper - size based on building footprint
    const gridSize = Math.max(dims.width, dims.depth) * 3;
    const gridHelper = new THREE.GridHelper(gridSize, Math.ceil(gridSize), 0xaaaaff, 0x8888dd);
    gridHelper.position.y = -0.1;
    this.scene.add(gridHelper);
    
    // Build 3D model
    this.buildModel();
    
    // Event listeners
    this.attachEventListeners();
    
    // Start animation
    this.animate();
  }
  
  /**
   * Build 3D model from building data
   */
  buildModel() {
    const template = this.getTemplate();
    
    if (!template.dimensions) {
      console.error('No dimensions in template');
      return;
    }
    
    // Build each floor
    Object.keys(this.building.floors).forEach((floorKey, floorIndex) => {
      const floor = this.building.floors[floorKey];
      const floorLevel = this.getFloorLevel(floorKey, template);
      
      floor.spaces.forEach(space => {
        this.buildSpace(space, floorLevel, template);
      });
    });
    
    // Add roof
    if (template.dimensions.roofPitch) {
      this.buildRoof(template);
    }
  }
  
  /**
   * Get floor level height
   */
  getFloorLevel(floorKey, template) {
    if (floorKey === 'ground') {
      return template.dimensions.groundFloorLevel || 0;
    } else if (floorKey === 'first') {
      return template.dimensions.firstFloorLevel || (template.dimensions.groundHeight + 0.3);
    }
    return 0;
  }
  
  /**
   * Build a space (room) in 3D
   */
  buildSpace(space, floorLevel, template) {
    const layoutData = this.findLayoutData(space.id, template);
    
    if (!layoutData || !layoutData.position) {
      console.warn(`No position data for space: ${space.id}`);
      return;
    }
    
    const pos = layoutData.position;
    const centerX = pos.x + space.width / 2;
    const centerZ = pos.z + space.depth / 2;
    const centerY = floorLevel + space.height / 2;
    
    // Build walls
    this.buildWalls(space, layoutData, pos, floorLevel, centerX, centerZ);
    
    // Build floor
    this.buildFloor(space, pos, floorLevel);
    
    // Build ceiling
    this.buildCeiling(space, pos, floorLevel + space.height);
  }
  
  /**
   * Build walls for a space
   */
  buildWalls(space, layoutData, pos, floorLevel, centerX, centerZ) {
    // North wall (front)
    if (space.wallConstruction.north) {
      const wallThickness = space.wallConstruction.north.thickness || 0.23;
      const wallMesh = this.createWall(
        space.width,
        space.height,
        wallThickness,
        space.wallConstruction.north,
        'north'
      );
      wallMesh.position.set(centerX, floorLevel + space.height / 2, pos.z);
      wallMesh.userData = { 
        type: 'wall', 
        direction: 'north', 
        space: space,
        construction: space.wallConstruction.north
      };
      this.scene.add(wallMesh);
      this.meshes.push(wallMesh);
      
      // Add windows
      if (layoutData.windows) {
        layoutData.windows.filter(w => w.wall === 'north').forEach(window => {
          this.addWindow(window, wallMesh, pos.x, floorLevel);
        });
      }
    }
    
    // South wall (rear)
    if (space.wallConstruction.south) {
      const wallThickness = space.wallConstruction.south.thickness || 0.23;
      const wallMesh = this.createWall(
        space.width,
        space.height,
        wallThickness,
        space.wallConstruction.south,
        'south'
      );
      wallMesh.position.set(centerX, floorLevel + space.height / 2, pos.z + space.depth);
      wallMesh.userData = { 
        type: 'wall', 
        direction: 'south', 
        space: space,
        construction: space.wallConstruction.south
      };
      this.scene.add(wallMesh);
      this.meshes.push(wallMesh);
      
      // Add windows
      if (layoutData.windows) {
        layoutData.windows.filter(w => w.wall === 'south').forEach(window => {
          this.addWindow(window, wallMesh, pos.x, floorLevel);
        });
      }
    }
    
    // East wall (right)
    if (space.wallConstruction.east) {
      const wallThickness = space.wallConstruction.east.thickness || 0.23;
      const wallMesh = this.createWall(
        wallThickness,
        space.height,
        space.depth,
        space.wallConstruction.east,
        'east'
      );
      wallMesh.position.set(pos.x + space.width, floorLevel + space.height / 2, centerZ);
      wallMesh.userData = { 
        type: 'wall', 
        direction: 'east', 
        space: space,
        construction: space.wallConstruction.east
      };
      this.scene.add(wallMesh);
      this.meshes.push(wallMesh);
    }
    
    // West wall (left)
    if (space.wallConstruction.west) {
      const wallThickness = space.wallConstruction.west.thickness || 0.23;
      const wallMesh = this.createWall(
        wallThickness,
        space.height,
        space.depth,
        space.wallConstruction.west,
        'west'
      );
      wallMesh.position.set(pos.x, floorLevel + space.height / 2, centerZ);
      wallMesh.userData = { 
        type: 'wall', 
        direction: 'west', 
        space: space,
        construction: space.wallConstruction.west
      };
      this.scene.add(wallMesh);
      this.meshes.push(wallMesh);
    }
  }
  
  /**
   * Create a wall mesh
   */
  createWall(width, height, depth, construction, direction) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const color = this.getColorFromUValue(construction.uValue);
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: construction.uValue === 0 ? 0.3 : 0.85, // Party walls more transparent
      roughness: 0.6,
      metalness: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    // Store original color for selection
    mesh.userData.originalColor = color;
    
    return mesh;
  }
  
  /**
   * Add window to wall
   */
  addWindow(windowData, wallMesh, baseX, baseY) {
    const geometry = new THREE.BoxGeometry(windowData.width, windowData.height, 0.05);
    const material = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.6,
      emissive: 0x4488aa,
      emissiveIntensity: 0.3
    });
    
    const windowMesh = new THREE.Mesh(geometry, material);
    // Position relative to wall - this is simplified
    windowMesh.position.set(windowData.position, windowData.height / 2 + 0.5, 0.12);
    wallMesh.add(windowMesh);
  }
  
  /**
   * Build floor
   */
  buildFloor(space, pos, level) {
    if (!space.floorConstruction || space.floorConstruction.uValue === 0) return;
    
    const floorThickness = space.floorConstruction.thickness || 0.30;
    const geometry = new THREE.BoxGeometry(space.width, floorThickness, space.depth);
    const color = this.getColorFromUValue(space.floorConstruction.uValue);
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x + space.width / 2, level - floorThickness / 2, pos.z + space.depth / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { 
      type: 'floor', 
      space: space,
      construction: space.floorConstruction,
      originalColor: color
    };
    
    this.scene.add(mesh);
    this.meshes.push(mesh);
  }
  
  /**
   * Build ceiling
   */
  buildCeiling(space, pos, level) {
    if (!space.ceilingConstruction) return;
    
    const ceilingThickness = space.ceilingConstruction.thickness || 0.20;
    const geometry = new THREE.BoxGeometry(space.width, ceilingThickness, space.depth);
    const color = this.getColorFromUValue(space.ceilingConstruction.uValue);
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      transparent: space.ceilingConstruction.uValue === 0,
      opacity: space.ceilingConstruction.uValue === 0 ? 0.3 : 0.9,
      roughness: 0.7,
      metalness: 0.2
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(pos.x + space.width / 2, level, pos.z + space.depth / 2);
    mesh.receiveShadow = true;
    mesh.userData = { 
      type: 'ceiling', 
      space: space,
      construction: space.ceilingConstruction,
      originalColor: color
    };
    
    this.scene.add(mesh);
    this.meshes.push(mesh);
  }
  
  /**
   * Build pitched roof
   */
  buildRoof(template) {
    const dims = template.dimensions;
    const roofLevel = dims.roofLevel || 6.3;
    const roofHeight = (dims.width / 2) * Math.tan((dims.roofPitch * Math.PI) / 180);
    
    // Create pitched roof geometry
    const shape = new THREE.Shape();
    shape.moveTo(-dims.width / 2, 0);
    shape.lineTo(dims.width / 2, 0);
    shape.lineTo(0, roofHeight);
    shape.lineTo(-dims.width / 2, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: dims.depth,
      bevelEnabled: false
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const color = this.getColorFromUValue(template.construction.roof.uValue);
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
      metalness: 0.1
    });
    
    const roofMesh = new THREE.Mesh(geometry, material);
    roofMesh.position.set(dims.width / 2, roofLevel, 0);
    roofMesh.rotation.z = Math.PI / 2;
    roofMesh.rotation.x = Math.PI / 2;
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    roofMesh.userData = { 
      type: 'roof',
      construction: template.construction.roof,
      originalColor: color
    };
    
    this.scene.add(roofMesh);
    this.meshes.push(roofMesh);
  }
  
  /**
   * Get color based on U-value (thermal performance)
   */
  getColorFromUValue(uValue) {
    if (uValue === 0) return 0xcccccc; // Grey for party walls
    
    // Map U-value to color: green (good) -> yellow -> red (poor)
    const normalized = Math.min(Math.max((uValue - 0.15) / (2.5 - 0.15), 0), 1);
    
    if (normalized < 0.5) {
      // Green to Yellow
      const t = normalized * 2;
      return new THREE.Color(t, 1, 0).getHex();
    } else {
      // Yellow to Red
      const t = (normalized - 0.5) * 2;
      return new THREE.Color(1, 1 - t, 0).getHex();
    }
  }
  
  /**
   * Find layout data for space
   */
  findLayoutData(spaceId, template) {
    for (const floorKey in template.layout) {
      const room = template.layout[floorKey].find(r => r.id === spaceId);
      if (room) return room;
    }
    return null;
  }
  
  /**
   * Get template from building
   */
  getTemplate() {
    // Access the original template via propertyTemplates
    const { PROPERTY_TEMPLATES } = window;
    return PROPERTY_TEMPLATES[this.building.propertyType] || {};
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const canvas = this.renderer.domElement;
    
    // Mouse/touch interaction
    canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
    canvas.addEventListener('mousemove', this.onPointerMove.bind(this));
    canvas.addEventListener('mouseup', this.onPointerUp.bind(this));
    canvas.addEventListener('click', this.onPointerClick.bind(this));
    
    canvas.addEventListener('touchstart', this.onPointerDown.bind(this));
    canvas.addEventListener('touchmove', this.onPointerMove.bind(this));
    canvas.addEventListener('touchend', this.onPointerUp.bind(this));
    
    // Window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  /**
   * Handle pointer down
   */
  onPointerDown(e) {
    this.isDragging = true;
    this.isAutoRotating = false;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    this.previousMousePosition = { x: clientX, y: clientY };
  }
  
  /**
   * Handle pointer move
   */
  onPointerMove(e) {
    if (!this.isDragging) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    const deltaX = clientX - this.previousMousePosition.x;
    const deltaY = clientY - this.previousMousePosition.y;
    
    this.rotation.y -= deltaX * 0.005;
    this.rotation.x += deltaY * 0.005;
    
    // Clamp vertical rotation
    this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
    
    this.previousMousePosition = { x: clientX, y: clientY };
    this.updateCameraPosition();
  }
  
  /**
   * Handle pointer up
   */
  onPointerUp(e) {
    this.isDragging = false;
    // Resume auto-rotate after 2 seconds of inactivity
    setTimeout(() => {
      if (!this.isDragging) {
        this.isAutoRotating = true;
      }
    }, 2000);
  }
  
  /**
   * Handle click for selection
   */
  onPointerClick(e) {
    if (!this.options.enableSelection) return;
    
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.meshes);
    
    if (intersects.length > 0) {
      this.selectMesh(intersects[0].object);
    } else {
      this.deselectMesh();
    }
  }
  
  /**
   * Select a mesh
   */
  selectMesh(mesh) {
    // Deselect previous
    this.deselectMesh();
    
    this.selectedMesh = mesh;
    
    // Highlight
    mesh.material.emissive = new THREE.Color(0x444444);
    mesh.material.emissiveIntensity = 0.5;
    
    // Emit event
    if (this.options.onSelect) {
      this.options.onSelect(mesh.userData);
    }
  }
  
  /**
   * Deselect mesh
   */
  deselectMesh() {
    if (this.selectedMesh) {
      this.selectedMesh.material.emissive = new THREE.Color(0x000000);
      this.selectedMesh.material.emissiveIntensity = 0;
      this.selectedMesh = null;
    }
  }
  
  /**
   * Update camera position based on rotation
   */
  updateCameraPosition() {
    const radius = this.cameraRadius || 18;
    const target = this.cameraTarget || new THREE.Vector3(0, 4, 4.5);
    
    this.camera.position.x = target.x + radius * Math.sin(this.rotation.y) * Math.cos(this.rotation.x);
    this.camera.position.y = target.y + radius * Math.sin(this.rotation.x);
    this.camera.position.z = target.z + radius * Math.cos(this.rotation.y) * Math.cos(this.rotation.x);
    this.camera.lookAt(target);
  }
  
  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Auto-rotate when idle
    if (this.isAutoRotating && this.options.autoRotate) {
      this.rotation.y += this.options.rotateSpeed;
      this.updateCameraPosition();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Dispose resources
   */
  dispose() {
    this.renderer.dispose();
    this.meshes.forEach(mesh => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
  }
}
