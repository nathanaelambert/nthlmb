import { TouchMovement } from './TouchMovement.js';
import { LineOfSight } from './LineOfSight.js';
import { Level } from './Level.js';
import { GameLogic } from './GameLogic.js';
import { items } from './items.js';
import { GUI } from './GUI.js';

function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

function fitElementToScreen(elem) {
  elem.style.position = 'fixed';
  elem.style.top = '0';
  elem.style.left = '0';
  elem.style.width = '100vw';
  elem.style.height = '100vh';
  elem.style.zIndex = '9999';
  elem.style.margin = '0';
  elem.style.padding = '0';
  elem.style.background = 'white';
}

document.getElementById('line-btn').addEventListener('click', () => {
  const audioSpaceDiv = document.getElementById('audio-space');
  audioSpaceDiv.style.display = 'block';
  fitElementToScreen(audioSpaceDiv);
  document.getElementById('container').style.display = 'none';
  const touchMovement = new TouchMovement(audioSpaceDiv);
  const lineOfSight = new LineOfSight(touchMovement);
  touchMovement.addObserver(lineOfSight);
  touchMovement.notify(touchMovement.getState());
});

document.getElementById('wave-btn').addEventListener('click', () => {
  const audioSpaceDiv = document.getElementById('audio-space');
  audioSpaceDiv.style.display = 'block';
  fitElementToScreen(audioSpaceDiv);
  document.getElementById('container').style.display = 'none';

  // Setup instruction and search divs
  const instructionDiv = document.getElementById('instruction');
  const searchDiv = document.getElementById('search');
  instructionDiv.style.display = 'none';
  searchDiv.style.display = 'none';
  instructionDiv.style.position = 'absolute';
  instructionDiv.style.top = '0';
  instructionDiv.style.left = '0';
  instructionDiv.style.width = '100%';
  instructionDiv.style.height = '100%';
  searchDiv.style.position = 'absolute';
  searchDiv.style.top = '0';
  searchDiv.style.left = '0';
  // Ensure searchDiv is visible and sized before creating Level
  searchDiv.style.display = 'block';
  searchDiv.style.width = '100%';
  searchDiv.style.height = '100%';
  searchDiv.offsetWidth; // force reflow

  // Create Level instance, passing in the search div
  const level = new Level(searchDiv, {});

  // Create GameLogic instance, using a level generator that returns the items for the level
  const gameLogic = new GameLogic(() => {
    level.newLevel();
    level.show_level();
    return level.getLevel().map(obj => obj.item);
  });

  // Create GUI observer
  const gui = new GUI(gameLogic, level, instructionDiv, searchDiv);

  const rounds = 3;
  gameLogic.start_game(rounds, (score) => {
    alert(`Game ended! Score: ${score} out of ${rounds}`);
  });
});
