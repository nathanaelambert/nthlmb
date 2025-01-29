import { loadLevel } from './game_run.js';
import { viewAngle } from './game_run.js';

// Add event listeners for buttons
document.getElementById('level1').addEventListener('click', () => loadLevel(1));
document.getElementById('level2').addEventListener('click', () => loadLevel(2));
document.getElementById('level3').addEventListener('click', () => loadLevel(3));


const slider = document.getElementById('degreeSlider');
const sliderValue = document.getElementById('sliderValue');

slider.addEventListener('input', function() {
  const value = this.value;
  sliderValue.textContent = value + '°';
  viewAngle.set(parseFloat(value));
});

