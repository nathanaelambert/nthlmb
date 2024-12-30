import { Drawable } from "./drawable";

// type alias for a function that sets graphics context style
type SetStyle = (gc: CanvasRenderingContext2D) => void;

/**
 * A square that can be drawn on a canvas.
 */
export class Square implements Drawable {
  /**
   *
   * @param x x-coordinate of the center
   * @param y y-coordinate of the center
   * @param size width and height
   * @param setStyle function that sets the style
   */
  constructor(
    public x: number,
    public y: number,
    public size: number,
    public setStyle?: SetStyle
  ) {}

  draw(gc: CanvasRenderingContext2D) {
    if (this.setStyle != undefined) {
      gc.save();
      this.setStyle(gc);
    }
    gc.beginPath();
    gc.rect(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size
    );
    gc.fill();
    gc.stroke();
    if (this.setStyle != undefined) gc.restore();
  }
}
