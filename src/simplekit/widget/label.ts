import { SKElement, SKStyle } from "./element";

export class SKLabel extends SKElement {
  text: string;
  align: "centre" | "left" | "right" = "centre";

  constructor(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    super();
    this.x = x;
    this.y = y;
    this.text = text;

    this.width = width;
    this.height = height;
  }

  measureText(gc: CanvasRenderingContext2D) {
    gc.measureText("");
  }

  draw(gc: CanvasRenderingContext2D) {
    gc.save();

    // border
    gc.strokeStyle = "grey";
    gc.setLineDash([3, 3]);
    gc.strokeRect(this.x, this.y, this.width, this.height);

    // button label
    gc.font = SKStyle.font;
    gc.fillStyle = "black";
    gc.textBaseline = "middle";
    const padding = 10;
    switch (this.align) {
      case "left":
        gc.textAlign = "left";
        gc.fillText(this.text, this.x + padding, this.y + this.height / 2);

        break;
      case "centre":
        gc.textAlign = "center";
        gc.fillText(
          this.text,
          this.x + this.width / 2,
          this.y + this.height / 2
        );

        break;
      case "right":
        gc.textAlign = "right";
        gc.fillText(
          this.text,
          this.x + this.width - padding,
          this.y + this.height / 2
        );

        break;
    }

    gc.restore();
  }

  public toString(): string {
    return `SKLabel '${this.text}' id:${this.id}`;
  }
}
