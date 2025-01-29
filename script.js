let scene, camera, renderer, terrain;

let cubes = [];
let styles = {}; // To store loaded styles

function load_cube(cubeData) {
    const faceSize = 3;
    const squareSize = 32; // Size of each square in pixels

    const createFaceTexture = (faceData) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = faceSize * squareSize;
        const ctx = canvas.getContext('2d');

        faceData.forEach((row, i) => {
            row.forEach((cell, j) => {
                ctx.fillStyle = cell ? styles.colors.white : styles.colors.black;
                ctx.fillRect(j * squareSize, i * squareSize, squareSize, squareSize);
            });
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        return texture;
    };

    return [
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.right) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.left) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.top) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.bottom) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.front) }),
        new THREE.MeshBasicMaterial({ map: createFaceTexture(cubeData.back) })
    ];
}


function load_terrain(terrainData) {
    const faceSize = 3;
    const textureSize = faceSize * 3; // 3x3 layout for 9 tiles
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = textureSize * 32; // 32 pixels per grid square
    const ctx = canvas.getContext('2d');

    const drawFace = (faceData, x, y) => {
        faceData.forEach((row, i) => {
            row.forEach((cell, j) => {
                ctx.fillStyle = cell ? 'white' : 'black';
                ctx.fillRect((x + j) * 32, (y + i) * 32, 32, 32);
            });
        });
    };

    // Draw faces on the canvas
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const tileIndex = i * 3 + j;
            drawFace(terrainData[`tile${tileIndex}`], j * faceSize, i * faceSize);
        }
    }

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // Create a plane with the terrain texture
    const geometry = new THREE.PlaneGeometry(9, 9);
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
        left: { x: 0, y: 0, z: -Math.PI / 2 },
        right: { x: 0, y: 0, z: Math.PI / 2 }
    };

    // Reset rotation
    cube.rotation.set(0, 0, 0);

    // Apply rotations
    cube.rotateX(rotations[faceUp].x);
    cube.rotateY(rotations[faceUp].y);
    cube.rotateZ(rotations[faceUp].z);

    // Additional rotation for front face
    if (faceUp !== 'top' && faceUp !== 'bottom') {
        const frontRotation = new THREE.Euler().setFromRotationMatrix(
            new THREE.Matrix4().makeRotationY(
                ['front', 'left', 'back', 'right'].indexOf(faceFront) * Math.PI / 2
            )
        );
        cube.rotation.x += frontRotation.x;
        cube.rotation.y += frontRotation.y;
        cube.rotation.z += frontRotation.z;
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

        // Load level data
        const level = levelsData.level_001;

        // Create and position each cube
        for (let i = 0; i < 9; i++) {
            const tileData = level[`tile${i}`];
            if (tileData && tileData.cube) {
                const materials = load_cube(cubesData[tileData.cube]);
                const geometry = new THREE.BoxGeometry();
                const cube = new THREE.Mesh(geometry, materials);
                
                // Position cube
                cube.position.set(
                    (i % 3) * 3 - 3,
                    0.5, // Slightly above the terrain
                    Math.floor(i / 3) * 3 - 3
                );

                // Orient cube
                orientCube(cube, tileData.orientation);

                scene.add(cube);
                cubes.push(cube);
            }
        }

        // Set camera position
        camera.position.set(5, 10, 15);
        camera.lookAt(0, 0, 0);
    })
    .catch(error => console.error('Error loading data:', error));
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();
animate();
