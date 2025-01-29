let scene, camera, renderer;

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

    // Load styles and cubes data
    Promise.all([
        fetch('styles.json').then(response => response.json()),
        fetch('cubes.json').then(response => response.json())
    ])
    .then(([loadedStyles, cubesData]) => {
        styles = loadedStyles; // Store loaded styles
        console.log('Styles loaded:', styles);

        // Create and position each cube
        const cubeSpacing = 2.5; // Space between cubes
        const cubeKeys = Object.keys(cubesData);
        cubeKeys.forEach((cubeKey, index) => {
            const materials = load_cube(cubesData[cubeKey]);
            const geometry = new THREE.BoxGeometry();
            const cube = new THREE.Mesh(geometry, materials);
            
            // Position cubes in a row
            cube.position.x = (index - (cubeKeys.length - 1) / 2) * cubeSpacing;
            
            scene.add(cube);
        });

        // Adjust camera position to view all cubes
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
    })
    .catch(error => console.error('Error loading data:', error));
}



function animate() {
    requestAnimationFrame(animate);
    scene.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            child.rotation.x += 0.01;
            child.rotation.y += 0.01;
        }
    });
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
