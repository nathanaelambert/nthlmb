// js/main.js
import { TouchMovement } from './TouchMovement.js';
import { LineOfSight } from './LineOfSight.js';
import { Level } from './Level.js';
import { GameLogic } from './GameLogic.js';
import { items } from './items.js';

function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

document.getElementById('line-btn').addEventListener('click', () => {
  const audioSpaceDiv = document.getElementById('audio-space');
  audioSpaceDiv.style.display = 'block';
  openFullscreen(audioSpaceDiv);
  document.getElementById('container').style.display = 'none';
  const touchMovement = new TouchMovement(audioSpaceDiv);
  const lineOfSight = new LineOfSight(touchMovement);
  touchMovement.addObserver(lineOfSight);
  touchMovement.notify(touchMovement.getState());
});

document.getElementById('wave-btn').addEventListener('click', () => {
  const audioSpaceDiv = document.getElementById('audio-space');
  audioSpaceDiv.style.display = 'block';
  openFullscreen(audioSpaceDiv);
  document.getElementById('container').style.display = 'none';

  // Create Level instance, passing in the div
  const level = new Level(audioSpaceDiv, {
    numberOfItems: 12, // or any other parameter you want
    gridMargin: 20,
    rectMinSize: 60
  });

  // Create GameLogic instance, using a level generator that returns the items for the level
  const gameLogic = new GameLogic(() => {
    // Generate a new level and return its items for this round
    level.newLevel();
    // Optionally, display the debug view
    level.show_level();
    // Return just the items for the round (for GameLogic)
    return level.getLevel().map(obj => obj.item);
  });

  // Start the game with 1 round and a simple end callback
  gameLogic.start_game(1, (score) => {
    alert(`Game ended! Score: ${score}`);
  });

  // Show the level in debug mode
  level.show_level();
});
