// js/main.js
import { AudioSpace } from './AudioSpace.js';
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

  const audioSpace = new AudioSpace(audioSpaceDiv);
  const lineOfSight = new LineOfSight(audioSpace);
  audioSpace.addObserver(lineOfSight);
  audioSpace.notify(audioSpace.getState());
});
