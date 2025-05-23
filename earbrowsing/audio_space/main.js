import { AudioPlayer } from './AudioPlayer.js'; // Import your AudioPlayer class
import { TouchMovement } from './TouchMovement.js';
import { LineOfSight } from './LineOfSight.js';
import { Level } from './Level.js';
import { GameLogic } from './GameLogic.js';
import { items } from './items.js';
import { GUI } from './GUI.js';
import { Instructions } from './Instructions.js';


const soundCanvas = document.getElementById('soundCanvas');

const gameLogic = new GameLogic();

const start_button = document.getElementById('start-button');
start_button.onclick = () => {
  Tone.start();
  gameLogic.buttonStarted();
  start_button.style.display = 'none';
};

const level = new Level(soundCanvas, gameLogic);

const gui = new GUI(gameLogic, level, soundCanvas);

const instruct = new Instructions(gameLogic, gui);

const rounds = 3;
gameLogic.start_game(rounds, (score) => {
  alert(`Game ended! Score: ${score} out of ${rounds}`);
});

