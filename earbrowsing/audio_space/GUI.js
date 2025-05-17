import { Point2D } from './math.js';

export class GUI {
  constructor(gameLogic, level, instructionDiv, searchDiv) {
    this.gameLogic = gameLogic;
    this.level = level;
    this.instructionDiv = instructionDiv;
    this.searchDiv = searchDiv;

    this._lastTapInstruction = 0;
    this._lastTapSearch = 0;

    // Observe phase changes
    this.gameLogic.addObserver(this);

    // Double-tap on instruction div
    this.instructionDiv.addEventListener('touchend', (e) => this._handleInstructionDoubleTap(e));

    // Double-tap on search div
    this.searchDiv.addEventListener('touchend', (e) => this._handleSearchDoubleTap(e));
  }

  // Observer interface
  update({ phase }) {
    // Hide both, then show the correct one
    this.instructionDiv.style.display = 'none';
    this.searchDiv.style.display = 'none';

    if (phase === 'instructions') {
      this._showInstruction();
    } else if (phase === 'search') {
      this._showSearch();
    }
  }

  _showInstruction() {
    const secret = this.gameLogic.getSecretItem().content;
    this.instructionDiv.textContent = `Find the item: ${secret}`;
    this.instructionDiv.style.display = 'flex';
    this.instructionDiv.style.justifyContent = 'center';
    this.instructionDiv.style.alignItems = 'center';
    this.instructionDiv.style.fontSize = '2em';
  }

  _showSearch() {
    this.searchDiv.style.display = 'block';
    // Level rendering is handled elsewhere
  }

  _handleInstructionDoubleTap(e) {
    const now = Date.now();
    if (now - this._lastTapInstruction < 300) { // 300ms for double tap
      if (this.gameLogic.getPhase() === 'instructions') {
        this.gameLogic.instructions_clear();
      }
    }
    this._lastTapInstruction = now;
  }

  _handleSearchDoubleTap(e) {
    const now = Date.now();
    if (now - this._lastTapSearch < 300) {
      if (this.gameLogic.getPhase() === 'search') {
        // Get tap position
        const touch = e.changedTouches[0];
        const rect = this.searchDiv.getBoundingClientRect();
        const x = (touch.clientX - rect.left) * (this.searchDiv.width ? this.searchDiv.width / rect.width : 1);
        const y = (touch.clientY - rect.top) * (this.searchDiv.height ? this.searchDiv.height / rect.height : 1);
        const point = new Point2D(x, y);

        // Check if the tap is inside any item rectangle
        const items = this.level.getLevel(); // Should be array of {rect, item}
        for (const obj of items) {
          if (point.isInside(obj.rectangle)) {
            this.gameLogic.guess(obj.item);
            break;
          }
        }
      }
    }
    this._lastTapSearch = now;
  }
}
