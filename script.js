let scene, camera, renderer, cube;

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


function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Load styles and cube data
    Promise.all([
        fetch('styles.json').then(response => response.json()),
        fetch('green_cube.json').then(response => response.json())
    ])
    .then(([loadedStyles, cubeData]) => {
        styles = loadedStyles; // Store loaded styles
        console.log('Styles loaded:', styles);

        const materials = load_cube(cubeData.green_cube);

        // Create a cube with the loaded materials
        const geometry = new THREE.BoxGeometry();
        cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);

        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
    })
    .catch(error => console.error('Error loading data:', error));
}


function animate() {
    requestAnimationFrame(animate);
    if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
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
