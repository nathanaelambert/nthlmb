// Import or define your loadLevel function here
import { loadLevel } from './game_run.js';

// Add event listeners for buttons
document.getElementById('level1').addEventListener('click', () => loadLevel(1));
document.getElementById('level2').addEventListener('click', () => loadLevel(2));
document.getElementById('level3').addEventListener('click', () => loadLevel(3));
