let scene, camera, renderer, terrain;

let cubes = [];
let styles = {}; // To store loaded styles
let view_angle = 0; // Renamed from angle to view_angle

const UNIT_SIZE = 32; // size in Pixels
const FACE_SIZE = 3;
const GRID_SIZE = 3;

function load_cube(cubeData) {

    const createFaceTexture = (faceData) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = FACE_SIZE * UNIT_SIZE;
        const ctx = canvas.getContext('2d');

        faceData.forEach((row, i) => {
            row.forEach((cell, j) => {
                ctx.fillStyle = cell ? styles.colors.white : styles.colors.black;
                ctx.fillRect(j * UNIT_SIZE, i * UNIT_SIZE, UNIT_SIZE, UNIT_SIZE);
            });
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        return texture;
    };

    const materials = [
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.right) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.left) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.top) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.bottom) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.front) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.back) })
    ];

    // Create and return a cube mesh
    const geometry = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometry, materials);

    return cube;
}

function load_terrain(terrainData) {
    const textureSize = FACE_SIZE * GRID_SIZE; // 3x3 layout for 9 tiles
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = textureSize * UNIT_SIZE;
    const ctx = canvas.getContext('2d');

    const drawFace = (faceData, x, y) => {
        faceData.forEach((row, i) => {
            row.forEach((cell, j) => {
                ctx.fillStyle = cell ? styles.colors.white : styles.colors.black;
                ctx.fillRect((x + j) * UNIT_SIZE, (y + i) * UNIT_SIZE, UNIT_SIZE, UNIT_SIZE);
            });
        });
    };

    // Draw faces on the canvas
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const tileIndex = i * GRID_SIZE + j;
            drawFace(terrainData[`tile${tileIndex}`], j * FACE_SIZE, i * FACE_SIZE);
        }
    }

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // Create a plane with the terrain texture
    const geometry = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE,GRID_SIZE, GRID_SIZE);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2; // Rotate to lay flat

    return plane;
}

function orientCube(cube, orientation) {
    const [faceUp, faceFront] = orientation;
    const rotations = {
        top: { x: 0, y: 0, z: 0 },
        bottom: { x: Math.PI, y: 0, z: 0 },
        front: { x: -Math.PI / 2, y: 0, z: 0 },
        back: { x: Math.PI / 2, y: 0, z: 0 },
        left: { x: 0, y: Math.PI / 2, z: 0 },
        right: { x: 0, y: -Math.PI / 2, z: 0 }
    };

    // Reset rotation
    cube.rotation.set(0, 0, 0);

    // Apply rotations based on the face facing up
    cube.rotation.x += rotations[faceUp].x;
    cube.rotation.y += rotations[faceUp].y;
    cube.rotation.z += rotations[faceUp].z;

    // Additional rotation for the front-facing face
    if (faceUp !== 'top' && faceUp !== 'bottom') {
        const frontRotationY = {
            front: 0,
            left: Math.PI / 2,
            back: Math.PI,
            right: -Math.PI / 2
        };
        cube.rotation.y += frontRotationY[faceFront];
    }
}
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Load terrain, styles, cubes, and level data
    Promise.all([
        fetch('terrain.json').then(response => response.json()),
        fetch('styles.json').then(response => response.json()),
        fetch('cubes.json').then(response => response.json()),
        fetch('levels.json').then(response => response.json())
    ])
    .then(([terrainData, loadedStyles, cubesData, levelsData]) => {
        styles = loadedStyles;

        // Load terrain
        terrain = load_terrain(terrainData.terrain);
        scene.add(terrain);
        // Add a GridHelper
        const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, 0x000000, 0x000000); // Black lines
        gridHelper.position.y = 0.01; // Slightly above the plane to avoid z-fighting
        scene.add(gridHelper);

        // Load level data
        const level = levelsData.level_001;

        // Create and position each cube
        for (let i = 0; i < 9; i++) {
            const tileData = level[`tile${i}`];
            if (tileData && tileData.cube) {
                const cube = load_cube(cubesData[tileData.cube]);
                
                // Position cube
                cube.position.set(
                    (i % 3) - 1,
                    0.5,
                    Math.floor(i / 3) - 1
                );
    
                // Orient cube
                orientCube(cube, tileData.orientation);
    
                scene.add(cube);
                cubes.push(cube);
            }
        }

        // Set camera position and angle (3/4 view)
        camera.position.set(3.5, 6.5, 7.5); // Above and at an angle
        camera.lookAt(0, 0, 0); // Look at the center of the scene
    })
    .catch(error => console.error('Error loading data:', error));

    updateCameraPosition();
}

function updateCameraPosition() {
    const radius = 10; // Distance from the center
    const heightAngle = Math.PI / 6; // Angle from the horizontal plane (30 degrees)

    // Calculate new camera position
    const x = radius * Math.cos(view_angle) * Math.cos(heightAngle);
    const z = radius * Math.sin(view_angle) * Math.cos(heightAngle);
    const y = radius * Math.sin(heightAngle);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0); // Always look at the center
}

function animate() {
    requestAnimationFrame(animate);

    // Update camera position
    view_angle += 0.005; // Adjust this value to change rotation speed
    if (view_angle > Math.PI * 2) view_angle -= Math.PI * 2; // Reset angle after full rotation
    updateCameraPosition();

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

init();
animate();