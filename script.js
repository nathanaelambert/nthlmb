let scene, camera, renderer, cube;

function load_cube(cubeData) {
    const faceSize = 3;
    const squareSize = 32;

    const createFaceTexture = (faceData) => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = faceSize * squareSize;
        const ctx = canvas.getContext('2d');

        faceData.forEach((row, i) => {
            row.forEach((cell, j) => {
                ctx.fillStyle = cell ? 'white' : 'black';
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

    fetch('green_cube.json')
        .then(response => response.json())
        .then(data => {
            console.log('Cube data loaded:', data);
            const cubeData = data.green_cube;
            const materials = load_cube(cubeData);

            const geometry = new THREE.BoxGeometry();
            cube = new THREE.Mesh(geometry, materials);
            scene.add(cube);

            camera.position.set(0, 0, 5);
            camera.lookAt(0, 0, 0);
        })
        .catch(error => console.error('Error loading JSON:', error));
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
