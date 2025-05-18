import { Point2D } from './math.js';

export class GUI {
  constructor(gameLogic, level, canvas) {
    this.gameLogic = gameLogic;
    this.level = level;
    this.canvas = canvas;

    this._lastTapInstruction = 0;
    this._lastTapSearch = 0;

    // Observe phase changes
    this.gameLogic.addObserver(this);
  }

  // Observer interface
  update({ phase }) {
    if (phase === 'instructions') {
    } else if (phase === 'search') {
    }
  }

  // _showInstruction() {
  //   const secret = this.gameLogic.getSecretItem().content;
  //   this.instructionDiv.textContent = `Find the item: ${secret}`;
  //   this.instructionDiv.style.display = 'flex';
  //   this.instructionDiv.style.justifyContent = 'center';
  //   this.instructionDiv.style.alignItems = 'center';
  //   this.instructionDiv.style.fontSize = '2em';
  // }

  // _showSearch() {
  //   this.searchDiv.style.display = 'block';
  //   // Level rendering is handled elsewhere
  // }


}
