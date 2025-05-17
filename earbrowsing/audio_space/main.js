// js/main.js
import { TouchMovement } from './TouchMovement.js';
import { LineOfSight } from './LineOfSight.js';

function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

document.getElementById('demo-btn').addEventListener('click', () => {
  const audioSpaceDiv = document.getElementById('audio-space');
  audioSpaceDiv.style.display = 'block';
  openFullscreen(audioSpaceDiv);
  document.getElementById('container').style.display = 'none';

  const touchMovement = new TouchMovement(audioSpaceDiv);
  const lineOfSight = new LineOfSight(touchMovement);
  touchMovement.addObserver(lineOfSight);
  touchMovement.notify(touchMovement.getState());
});
