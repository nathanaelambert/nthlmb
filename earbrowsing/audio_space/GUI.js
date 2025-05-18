import { Point2D, closestPointOnRectangle, sliceInTwo } from './math.js';

const SPEED_CONSTANT = 0.003; // Adjustable

export class GUI {
  constructor(gameLogic, level, instructionDiv, searchDiv, audioPlayer) {
    this.gameLogic = gameLogic;
    this.level = level;
    this.instructionDiv = instructionDiv;
    this.searchDiv = searchDiv;
    this.audioPlayer = audioPlayer;

    this._lastTapInstruction = 0;
    this._lastTapSearch = 0;

    this.gameLogic.addObserver(this);

    this.instructionDiv.addEventListener('touchend', (e) => this._handleInstructionDoubleTap(e));
    this.searchDiv.addEventListener('touchend', (e) => this._handleSearchDoubleTap(e));
    this.searchDiv.addEventListener('touchstart', (e) => this._handleSearchSingleTap(e));
  }

  update({ phase }) {
    this.instructionDiv.style.display = 'none';
    this.searchDiv.style.display = 'none';

    if (phase === 'instructions') {
      this._showInstruction();
    } else if (phase === 'search') {
      this._showSearch();
    }
  }

  _showInstruction() {
    const secret = this.gameLogic.getSecretItem();
    this.instructionDiv.textContent = `Find the item: ${secret.content}`;
    this.instructionDiv.style.display = 'flex';
    this.instructionDiv.style.justifyContent = 'center';
    this.instructionDiv.style.alignItems = 'center';
    this.instructionDiv.style.fontSize = '2em';
  }

  _showSearch() {
    this.searchDiv.style.display = 'block';
  }

  _handleInstructionDoubleTap(e) {
    const now = Date.now();
    if (now - this._lastTapInstruction < 300) {
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
        const touch = e.changedTouches[0];
        const rect = this.searchDiv.getBoundingClientRect();
        const x = (touch.clientX - rect.left) * (this.searchDiv.width ? this.searchDiv.width / rect.width : 1);
        const y = (touch.clientY - rect.top) * (this.searchDiv.height ? this.searchDiv.height / rect.height : 1);
        const point = new Point2D(x, y);

        const items = this.level.getLevel();
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

  async _handleSearchSingleTap(e) {
    if (this.gameLogic.getPhase() !== 'search') return;
    if (e.touches && e.touches.length > 1) return;
    if (e.defaultPrevented) return;
    e.preventDefault();

    const touch = e.touches ? e.touches[0] : e;
    const rect = this.searchDiv.getBoundingClientRect();
    const tap_x = (touch.clientX - rect.left) * (this.searchDiv.width ? this.searchDiv.width / rect.width : 1);
    const tap_y = (touch.clientY - rect.top) * (this.searchDiv.height ? this.searchDiv.height / rect.height : 1);
    const target = new Point2D(tap_x, tap_y);

    this.audioPlayer.stop_all();
    this.audioPlayer.place_listener(tap_x, tap_y);

    const items = this.level.getLevel();
    for (const { item, rectangle } of items) {
      const closest = closestPointOnRectangle(rectangle, target);
      const distance = target.distanceTo(closest);
      const time_start = distance * SPEED_CONSTANT;
      const [path1, path2] = sliceInTwo(rectangle, target);
      const height = rectangle.area();
      const audioPath = `../sounds/${item.type}s/${item.content}.mp3`;

      this.audioPlayer.schedule_audio(audioPath, time_start, path1, height);
      this.audioPlayer.schedule_audio(audioPath, time_start, path2, height);
    }
  }
}
