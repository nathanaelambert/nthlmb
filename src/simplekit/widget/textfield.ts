import { SKKeyboardEvent, SKMouseEvent } from "..";
import { insideHitTestRectangle } from "../utility/hittest";
import { SKElement, SKStyle } from "./element";
import { KeyboardDispatcher } from "../keyboarddispatch";

export class SKTextfield extends SKElement {
  text: string;

  state: "idle" | "hover" = "idle";
  focus = false;

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

  protected applyEdit(text: string, key: string): string {
    if (key == "Backspace") {
      return text.slice(0, -1);
    } else if (key.length == 1) {
      return text + key;
    } else return text;
  }

  handleKeyboardEvent(ke: SKKeyboardEvent) {
    switch (ke.type) {
      case "focusout":
        this.focus = false;
        return true;
        break;
      case "focusin":
        this.focus = true;
        return true;
        break;
      case "keypress":
        if (this.focus && ke.key) {
          this.text = this.applyEdit(this.text, ke.key);
        }
        return true;
        break;
    }

    return false;
  }

  handleMouseEvent(me: SKMouseEvent) {
    switch (me.type) {
      case "mouseenter":
        this.state = "hover";
        return true;
        break;
      case "mouseexit":
        this.state = "idle";
        return true;
        break;
      case "click":
        KeyboardDispatcher.requestFocus(this);
        return true;
        break;
      case "mousedown":
        return false;
        break;
      case "mouseup":
        return false;
        break;
    }
    return false;
  }

  hittest(mx: number, my: number): boolean {
    return insideHitTestRectangle(
      mx,
      my,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  draw(gc: CanvasRenderingContext2D) {
    const padding = 10;

    gc.save();

    // thick highlight rect
    if (this.state == "hover") {
      gc.beginPath();
      gc.rect(this.x, this.y, this.width, this.height);
      gc.strokeStyle = SKStyle.highlightColor;
      gc.lineWidth = 8;
      gc.stroke();
    }

    // border
    gc.beginPath();
    gc.rect(this.x, this.y, this.width, this.height);
    gc.fillStyle = "white";
    gc.fill();
    gc.lineWidth = 1;
    gc.strokeStyle = this.focus ? "mediumblue" : "black";
    gc.stroke();

    // highlight
    // gc.fillStyle = SKStyle.highlightColor;
    // gc.fillRect(
    //   this.x + padding,
    //   this.y + padding / 2,
    //   50,
    //   this.height - padding
    // );

    // text
    gc.font = SKStyle.font;
    gc.fillStyle = "black";
    gc.textBaseline = "middle";
    gc.textAlign = "left";
    gc.fillText(this.text, this.x + padding, this.y + this.height / 2);

    gc.restore();
  }

  public toString(): string {
    return `SKTextfield '${this.text}' id:${this.id}`;
  }
}
