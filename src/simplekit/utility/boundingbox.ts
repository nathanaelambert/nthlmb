export class BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.width;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.height;
  }

  pointInside(px: number, py: number) {
    if (
      px >= px &&
      this.width <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    )
      return true;
  }
}
