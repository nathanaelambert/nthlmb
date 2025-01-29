let scene, camera, renderer, cube;

function load_cube(cubeData) {
    const faceSize = 3;
    const textureSize = faceSize * 4; // 4x4 layout for 6 faces
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
    drawFace(cubeData.right, 0, faceSize);
    drawFace(cubeData.left, faceSize * 2, faceSize);
    drawFace(cubeData.top, faceSize, 0);
    drawFace(cubeData.bottom, faceSize, faceSize * 2);
    drawFace(cubeData.front, faceSize, faceSize);
    drawFace(cubeData.back, faceSize * 3, faceSize);

    // Create a texture from the canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    // Create materials for each face
    const materials = [
        new THREE.MeshBasicMaterial({ map: texture }),
        new THREE.MeshBasicMaterial({ map: texture }),
        new THREE.MeshBasicMaterial({ map: texture }),
        new THREE.MeshBasicMaterial({ map: texture }),
        new THREE.MeshBasicMaterial({ map: texture }),
        new THREE.MeshBasicMaterial({ map: texture })
    ];

    // Set UV mapping for each face
    materials.forEach((material, index) => {
        const uv = new THREE.Vector4();
        uv.x = ((index % 3) * faceSize) / textureSize;
        uv.y = (Math.floor(index / 3) * faceSize) / textureSize;
        uv.z = uv.x + faceSize / textureSize;
        uv.w = uv.y + faceSize / textureSize;
        material.map.offset.set(uv.x, uv.y);
        material.map.repeat.set(faceSize / textureSize, faceSize / textureSize);
    });

    return materials;
}



function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Load the cube data
    fetch('green_cube.json')
        .then(response => response.json())
        .then(data => {
            console.log('Cube data loaded:', data);
            const cubeData = data.green_cube;
            const materials = load_cube(cubeData);
            
            // Create a cube with the loaded materials
            const geometry = new THREE.BoxGeometry();
            cube = new THREE.Mesh(geometry, materials);
            scene.add(cube);

            camera.position.z = 5;
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

window.addEventListener('resize', onWindowResize, false);

init();
animate();
