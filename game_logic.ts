function rotateCube(tile, cubeData) {
    if (!tile || !tile.cube || !tile.orientation) {
        throw new Error("Invalid tile data");
    }

    const { cube: cubeName, orientation } = tile;
    const cube = JSON.parse(JSON.stringify(cubeData[cubeName])); // Deep copy to avoid mutating original data

    const [newTop, newFront] = orientation;

    // If the orientation is ["top", "front"], no rotation is needed
    if (newTop === "top" && newFront === "front") {
        return cube;
    }

    // Helper function to rotate a face 180 degrees
    function rotateFace180(face) {
        return face.map(row => [...row].reverse()).reverse();
    }

    // Swap faces based on the new orientation
    if (newTop === "bottom" && newFront === "front") {
        // Swap top and bottom
        [cube.top, cube.bottom] = [cube.bottom, cube.top];

        // Rotate front, back, left, and right 180 degrees
        cube.front = rotateFace180(cube.front);
        cube.back = rotateFace180(cube.back);
        cube.left = rotateFace180(cube.right); // Swap left and right
        cube.right = rotateFace180(cube.left);
    }

    // Additional rotations for other orientations can be added here as needed

    return cube;
}

// Example usage:
const levelTile = {
    cube: "cyan_cube",
    orientation: ["bottom", "front"],
};

const cyanCube = {
    "top": [[0, 1, 0], [0, 1, 0], [0, 1, 0]],
    "bottom": [[0, 0, 0], [1, 1, 1], [0, 0, 0]],
    "front": [[0, 1, 0], [1, 1, 0], [0, 0, 0]],
    "back": [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    "left": [[0, 0, 0], [0, 1, 1], [0, 1, 0]],
    "right": [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
};

const rotatedCube = rotateCube(levelTile, { cyan_cube: cyanCube });
console.log(rotatedCube);
