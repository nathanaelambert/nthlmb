import { SKEvent, SKKeyboardEvent, SKMouseEvent } from "..";
import { Drawable } from "../drawable/drawable";
import { BoundingBox } from "../utility";

type EventHandler = (me: SKEvent) => void;

type DispatchRoute = {
  type: string;
  handler: EventHandler;
};

export class SKStyle {
  // standard style
  static font = "12pt sans-serif";
  static highlightColor = "lightskyblue";
}

export abstract class SKElement implements Drawable {
  abstract draw(gc: CanvasRenderingContext2D): void;

  id = "";

  bounds: BoundingBox = new BoundingBox(0, 0, 0, 0);

  x = 0;
  y = 0;
  minWidth = 32;
  width = 32;
  maxWidth = 256;
  minHeight = 32;
  height = 32;
  maxHeight = 256;

  //#region event dispatcher

  private dispatchTable: DispatchRoute[] = [];

  protected dispatch(e: SKEvent) {
    this.dispatchTable.forEach((d) => {
      if (d.type == e.type) {
        d.handler(e);
      }
    });
  }

  addEventListener(type: string, handler: EventHandler) {
    this.dispatchTable.push({ type, handler });
  }

  removeEventListener(type: string, handler: EventHandler) {
    this.dispatchTable = this.dispatchTable.filter(
      (d) => d.type != type && d.handler != handler
    );
  }

  //#endregion

  handleKeyboardEvent(ke: SKKeyboardEvent): boolean {
    return false;
  }

  handleMouseEvent(ms: SKMouseEvent): boolean {
    return false;
  }

  hittest(x: number, y: number) {
    return false;
  }

  public toString(): string {
    return `SKElement id:${this.id}`;
  }
}
