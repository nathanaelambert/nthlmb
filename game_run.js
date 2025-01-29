let scene, camera, renderer, terrain;

let cubes = [];
let styles = {}; // To store loaded styles
let view_angle = 0; // Renamed from angle to view_angle

const UNIT_SIZE = 64; // size in Pixels
const FACE_SIZE = 3;
const GRID_SIZE = 3;



function load_cube(cubeData, cubeName, fixed) {

    const cubeColor = fixed ? "black" : cubeName.split('_')[0];
    const createFaceTexture = (faceData, face) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = FACE_SIZE * UNIT_SIZE;
        const ctx = canvas.getContext('2d');

        faceData.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cubeData.goal === face && i === 1 && j === 1){
                    ctx.fillStyle = styles.colors.win;
                } else {
                    ctx.fillStyle = cell ? styles.colors.white : styles.colors[cubeColor];
                }
                ctx.fillRect(j * UNIT_SIZE, i * UNIT_SIZE, UNIT_SIZE, UNIT_SIZE);
            });
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        return texture;
    };

    const materials = [
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.right, "right") }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.left, "left") }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.top, "top") }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.bottom, "bottom") }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.front, "front") }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.back, "back") })
    ];

    materials.side = THREE.DoubleSide;
    materials.wireframe = true;

    // Create and return a cube mesh
    const geometry = new THREE.BoxGeometry();
    if (!geometry || materials.some(material => !material)) {
        console.error('Invalid geometry or materials for cube:', cubeData);
    }
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

    const directionToAxis = {
        front: new THREE.Vector3(0, 0, 1),
        back: new THREE.Vector3(0, 0, -1),
        top: new THREE.Vector3(0, 1, 0),
        bottom: new THREE.Vector3(0, -1, 0),
        left: new THREE.Vector3(-1, 0, 0),
        right: new THREE.Vector3(1, 0, 0)
    };
    const [primaryDirection, secondaryDirection] = orientation;

    // Reset cube's rotation
    cube.rotation.set(0, 0, 0);

    // Align the primary direction (e.g., "front")
    const primaryAxis = directionToAxis[primaryDirection];
    const upAxis = directionToAxis[secondaryDirection];

    // Create quaternion for rotation
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), upAxis); // Align "up" axis
    cube.quaternion.multiply(quaternion);

    const forwardQuaternion = new THREE.Quaternion();
    forwardQuaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), primaryAxis); // Align "forward" axis
    cube.quaternion.multiply(forwardQuaternion);

    // Ensure rotation is applied correctly
    cube.updateMatrixWorld();
}




export function loadLevel(levelNumber) { 
    cubes = [];


    while(scene.children.length > 0) { 
        scene.remove(scene.children[0]); 
    }
    Promise.all([
        fetch('terrain.json').then(response => response.json()),
        fetch('cubes.json').then(response => response.json()),
        fetch('levels.json').then(response => response.json())
    ])
    .then(([terrainData, cubesData, levelsData]) => {

        // Load terrain
        terrain = load_terrain(terrainData.terrain);
        scene.add(terrain);
        // Add a GridHelper
        const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, styles.colors.grid, styles.colors.grid); // Black lines
        gridHelper.position.y = 0.01; // Slightly above the plane to avoid z-fighting
        scene.add(gridHelper);

    
        // Load level data
        const level = levelsData[`level_${String(levelNumber).padStart(3, '0')}`];

        // Create and position each cube
        for (let i = 0; i < 9; i++) {
            const tileData = level[`tile${i}`];
            if (tileData && tileData.cube) {
                const cube = load_cube(cubesData[tileData.cube], tileData.cube, tileData.fixed);
                cube.position.set(
                    (i % 3) - 1,
                    0.5,
                    Math.floor(i / 3) - 1
                );
                orientCube(cube, tileData.orientation);

                cubes.push(cube);
            }
        }

        cubes.forEach(cube => {   scene.add(cube);   });
        console.log(cubes);


        scene.children.forEach(child => console.log(child));
    })
    .catch(error => console.error('Error loading level:', error));


    
     
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });

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
        const gridHelper = new THREE.GridHelper(GRID_SIZE, GRID_SIZE, styles.colors.grid, styles.colors.grid); // Black lines
        gridHelper.position.y = 0.01; // Slightly above the plane to avoid z-fighting
        scene.add(gridHelper);

        // Set camera position and angle (3/4 view)
        camera.position.set(3.5, 6.5, 7.5); // Above and at an angle
        camera.lookAt(0, 0, 0); // Look at the center of the scene
    })
    .catch(error => console.error('Error loading data:', error));

    updateCameraPosition();
}

function updateCameraPosition() {
    const radius = 5; // Distance from the center
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
    //view_angle += 0.005; // Adjust this value to change rotation speed
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