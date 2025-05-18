import { items } from './items.js';
import { Rectangle, Point2D } from './math.js';

export class Level {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Parameters (with defaults)
    this.numberOfItems = 15;
    this.gridMargin = 20;
    this.rectMinSize = 60;
    this.rectMaxSize = 120;

    this.levelItems = [];
    this.rectangles = [];

    // Observe canvas resizing and regenerate level
    this._observeCanvasResize();
  }

  // Observe canvas resizing using ResizeObserver
  _observeCanvasResize() {
    // Fallback for browsers that don't support ResizeObserver
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this._onCanvasResize();
      });
      this.resizeObserver.observe(this.canvas);
    } else {
      // Fallback: listen to window resize
      window.addEventListener('resize', () => this._onCanvasResize());
    }
  }

  _onCanvasResize() {
    // Optionally, set canvas size to match its display size
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    // Regenerate the level if the canvas is big enough
    if (this._isCanvasBigEnough()) {
      this.newLevel();
      this.show_level();
    } else {
      this._showTooSmallMessage();
    }
  }

  // Check if canvas is big enough for the level
  _isCanvasBigEnough() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const margin = this.gridMargin;
    const cellW = this.rectMinSize + margin;
    const cellH = this.rectMinSize + margin;
    const cols = Math.floor(w / cellW);
    const rows = Math.floor(h / cellH);

    // Need at least enough cells for the number of items
    const possibleCells = Math.floor((cols - 2) / 2) * Math.floor((rows - 2) / 2);
    return possibleCells >= this.numberOfItems;
  }

  // Show a message if the canvas is too small
  _showTooSmallMessage() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#c00";
    this.ctx.font = "24px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Canvas too small for this level!",
      this.canvas.width / 2,
      this.canvas.height / 2
    );
  }

  // Generate a new level
  newLevel() {
    // Check if canvas is big enough
    if (!this._isCanvasBigEnough()) {
      this._showTooSmallMessage();
      return;
    }

    // Clear previous
    this.levelItems = [];
    this.rectangles = [];

    // 1. Sample random items
    const shuffled = items.slice().sort(() => Math.random() - 0.5);
    this.levelItems = shuffled.slice(0, this.numberOfItems);

    // 2. Compute grid
    const w = this.canvas.width;
    const h = this.canvas.height;
    const margin = this.gridMargin;
    // Compute grid cell size (min size + margin)
    const cellW = this.rectMinSize + margin;
    const cellH = this.rectMinSize + margin;
    const cols = Math.floor(w / cellW);
    const rows = Math.floor(h / cellH);

    // Make cols and rows odd
    const nCols = cols % 2 === 0 ? cols - 1 : cols;
    const nRows = rows % 2 === 0 ? rows - 1 : rows;

    // 3. Generate grid positions (even indices only, not on border)
    let possibleCells = [];
    for (let y = 1; y < nRows - 1; y += 2) {
      for (let x = 1; x < nCols - 1; x += 2) {
        possibleCells.push({ x, y });
      }
    }
    // Shuffle and pick as many as needed
    possibleCells = possibleCells.sort(() => Math.random() - 0.5)
                                 .slice(0, this.levelItems.length);

    // 4. Place rectangles at grid positions
    this.rectangles = [];
    for (let i = 0; i < this.levelItems.length; i++) {
      const cell = possibleCells[i];
      const x1 = cell.x * cellW + margin / 2;
      const y1 = cell.y * cellH + margin / 2;
      const x2 = x1 + this.rectMinSize;
      const y2 = y1 + this.rectMinSize;
      this.rectangles.push(new Rectangle(x1, y1, x2, y2));
    }

    // 5. Grow rectangles in random order of directions
    for (let i = 0; i < this.rectangles.length; i++) {
      this._growRectangle(i, cellW, cellH, w, h, margin);
    }
  }

  // Helper to grow a rectangle in random directions
  _growRectangle(idx, cellW, cellH, maxW, maxH, margin) {
    const rect = this.rectangles[idx];
    const directions = ['left', 'left', 'right', 'right', 'up', 'down'].sort(() => Math.random() - 0.5);
    for (const dir of directions) {
      let grown = true;
      while (grown) {
        grown = false;
        let newRect;
        switch (dir) {
          case 'left':
            newRect = new Rectangle(rect.x1 - 1, rect.y1, rect.x2, rect.y2);
            if (rect.x1 - margin > 0 && this._canGrow(newRect, idx, margin, maxW, maxH)) {
              rect.x1 -= 1;
              grown = true;
            }
            break;
          case 'right':
            newRect = new Rectangle(rect.x1, rect.y1, rect.x2 + 1, rect.y2);
            if (rect.x2 + margin < maxW && this._canGrow(newRect, idx, margin, maxW, maxH)) {
              rect.x2 += 1;
              grown = true;
            }
            break;
          case 'up':
            newRect = new Rectangle(rect.x1, rect.y1 - 1, rect.x2, rect.y2);
            if (rect.y1 - margin > 0 && this._canGrow(newRect, idx, margin, maxW, maxH)) {
              rect.y1 -= 1;
              grown = true;
            }
            break;
          case 'down':
            newRect = new Rectangle(rect.x1, rect.y1, rect.x2, rect.y2 + 1);
            if (rect.y2 + margin < maxH && this._canGrow(newRect, idx, margin, maxW, maxH)) {
              rect.y2 += 1;
              grown = true;
            }
            break;
        }
      }
    }
  }

  // Helper to check if a rectangle can grow without overlapping others and respecting margin
  _canGrow(candidate, idx, margin, maxW, maxH) {
    // Check bounds
    if (candidate.x1 < margin || candidate.y1 < margin ||
        candidate.x2 > maxW - margin || candidate.y2 > maxH - margin) {
      return false;
    }
    // Check overlap with other rectangles (with margin)
    for (let j = 0; j < this.rectangles.length; j++) {
      if (j === idx) continue;
      const other = this.rectangles[j];
      if (this._rectsOverlap(candidate, other, margin)) {
        return false;
      }
    }
    return true;
  }

  // Helper to check overlap with margin
  _rectsOverlap(a, b, margin) {
    return !(a.x2 + margin < b.x1 ||
             a.x1 - margin > b.x2 ||
             a.y2 + margin < b.y1 ||
             a.y1 - margin > b.y2);
  }

  // Return the level data: array of {item, rectangle}
  getLevel() {
    return this.levelItems.map((item, i) => ({
      item,
      rectangle: this.rectangles[i]
    }));
  }

  // Debug: render rectangles and labels on canvas
  show_level() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = 0; i < this.rectangles.length; i++) {
      const rect = this.rectangles[i];
      const item = this.levelItems[i];
      // Draw rectangle
      this.ctx.strokeStyle = '#0080ff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(rect.x1, rect.y1, rect.x2 - rect.x1, rect.y2 - rect.y1);
      // Draw label
      this.ctx.fillStyle = '#222';
      this.ctx.font = '16px sans-serif';
      this.ctx.fillText(item.content, rect.x1 + 4, rect.y1 + 20);
    }
  }
}
