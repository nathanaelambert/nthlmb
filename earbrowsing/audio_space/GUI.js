import { Point2D, closestPointOnRectangle, sliceInTwo } from './math.js';

const SPEED_CONSTANT = 0.003; // Adjustable
const DOUBLE_TAP_DELAY = 300; // ms

export class GUI {
  constructor(gameLogic, level, instructionDiv, searchDiv, audioPlayer) {
    this.gameLogic = gameLogic;
    this.level = level;
    this.instructionDiv = instructionDiv;
    this.searchDiv = searchDiv;
    this.searchCanvas = document.createElement('canvas');
    this.searchCanvas.style.position = 'absolute';
    this.searchCanvas.style.top = '0';
    this.searchCanvas.style.left = '0';
    this.searchCanvas.style.pointerEvents = 'none';
    this.searchCanvas.style.zIndex = 10;
    this.searchDiv.appendChild(this.searchCanvas);

    this.audioPlayer = audioPlayer;

    this._lastTapInstruction = 0;
    this._lastTapSearch = 0;
    this._searchTapTimeout = null;
    this._doubleTapHappened = false; // NEW: flag to block single tap after double tap

    this.gameLogic.addObserver(this);

    this.instructionDiv.addEventListener('touchend', (e) => this._handleInstructionDoubleTap(e));
    this.searchDiv.addEventListener('touchend', (e) => this._handleSearchTouchEnd(e));
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
    this._resizeCanvas();
  }
  _resizeCanvas() {
    this.searchCanvas.width = this.searchDiv.offsetWidth;
    this.searchCanvas.height = this.searchDiv.offsetHeight;
  }
  

  _handleInstructionDoubleTap(e) {
    const now = Date.now();
    if (now - this._lastTapInstruction < DOUBLE_TAP_DELAY) {
      if (this.gameLogic.getPhase() === 'instructions') {
        this.gameLogic.instructions_clear();
      }
    }
    this._lastTapInstruction = now;
  }

  _handleSearchTouchEnd(e) {
    if (e.changedTouches && e.changedTouches.length > 1) return;
    if (this._searchTapTimeout) {
      clearTimeout(this._searchTapTimeout);
      this._searchTapTimeout = null;
      this._doubleTapHappened = true; // Set flag
      this._handleSearchDoubleTap(e);
    } else {
      this._doubleTapHappened = false; // Reset flag for new tap sequence
      this._searchTapTimeout = setTimeout(() => {
        this._searchTapTimeout = null;
        this._handleSearchSingleTap(e);
      }, DOUBLE_TAP_DELAY);
    }
  }

  _handleSearchDoubleTap(e) {
    // Always stop all audios
    this.audioPlayer.stop_all();

    if (this.gameLogic.getPhase() !== 'search') return;
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

  async _handleSearchSingleTap(e) {
    // If a double tap just happened, abort this single tap handler
    if (this._doubleTapHappened) return;

    if (this.gameLogic.getPhase() !== 'search') return;
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const rect = this.searchDiv.getBoundingClientRect();
    const tap_x = (touch.clientX - rect.left) * (this.searchDiv.width ? this.searchDiv.width / rect.width : 1);
    const tap_y = (touch.clientY - rect.top) * (this.searchDiv.height ? this.searchDiv.height / rect.height : 1);
    const target = new Point2D(tap_x, tap_y);

    this.audioPlayer.stop_all();
    this.audioPlayer.place_listener(tap_x, tap_y);

    const items = this.level.getLevel();
    for (const { item, rectangle } of items) {
      // If a double tap happened during the async loop, abort early
      if (this._doubleTapHappened) return;

      const closest = closestPointOnRectangle(rectangle, target);
      let distance = target.distanceTo(closest);
      if (target.isInside(rectangle)) distance = 0;
      const [path1, path2] = sliceInTwo(rectangle, target);

      // Start visualization
      this._animateCircle({
        tap: target,
        closest,
        paths: [path1, path2],
        rect: rectangle,
        distance,
        speed: SPEED_CONSTANT
      });

      const time_start = distance * SPEED_CONSTANT;
      if (rectangle.x2 - rectangle.x1 <= 0 || rectangle.y2 - rectangle.y1 <= 0) {
        console.warn('Degenerate rectangle found');
        continue;
      }

      const height = rectangle.area();
      const audioPath = `../sounds/${item.type}s/${item.content}.mp3`;

      this.audioPlayer.schedule_audio(audioPath, time_start, path1, height);
      this.audioPlayer.schedule_audio(audioPath, time_start, path2, height);
    }
  }

  _drawVisualization({tap, closest, paths, rect, startTime, maxRadius}) {
    const ctx = this.searchCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.searchCanvas.width, this.searchCanvas.height);
  
    // Draw rectangle
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1);
    ctx.stroke();
  
    // Draw growing circle
    if (maxRadius > 0) {
      ctx.beginPath();
      ctx.arc(tap.x, tap.y, maxRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(0,128,255,0.5)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  
    // Draw closest point
    ctx.beginPath();
    ctx.arc(closest.x, closest.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  
    // Draw paths
    const colors = ['#2ecc40', '#ff4136'];
    paths.forEach((path, idx) => {
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let pt of path.points.slice(1)) {
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = colors[idx];
      ctx.lineWidth = 4;
      ctx.stroke();
  
      // Mark corners and end point
      for (let i = 0; i < path.points.length; i++) {
        ctx.beginPath();
        ctx.arc(path.points[i].x, path.points[i].y, i === path.points.length-1 ? 7 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = i === path.points.length-1 ? colors[idx] : '#fff';
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      }
    });
  }

  _animateCircle({tap, closest, paths, rect, distance, speed}) {
    const startTime = performance.now();
    const duration = distance / speed * 1000; // ms
    const maxRadius = distance;
  
    const animate = (now) => {
      const elapsed = now - startTime;
      let currentRadius = Math.min(maxRadius, (elapsed / duration) * maxRadius);
  
      this._drawVisualization({
        tap,
        closest,
        paths,
        rect,
        startTime,
        maxRadius: currentRadius
      });
  
      if (currentRadius < maxRadius) {
        this._visualizationFrame = requestAnimationFrame(animate);
      }
    };
  
    if (this._visualizationFrame) cancelAnimationFrame(this._visualizationFrame);
    this._visualizationFrame = requestAnimationFrame(animate);
  }
  
  
}