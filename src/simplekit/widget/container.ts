import { insideHitTestRectangle } from "../utility/hittest";
import { SKElement } from "./element";
import { LayoutMethod, rowWrapLayout } from "../layout";

export class SKContainer extends SKElement {
  fill: string = "";

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  protected _layoutMethod: LayoutMethod | undefined;
  set layoutMethod(lm: LayoutMethod) {
    this._layoutMethod = lm;
  }

  doLayout() {
    if (this._layoutMethod) {
      this._layoutMethod(
        { width: this.width, height: this.height },
        this.children
      );
      // console.log(width, height);
      // this.width = width;
      // this.height = height;
    }
  }

  //#region managing children

  children: SKElement[] = [];
  addChild(element: SKElement) {
    this.children.push(element);
  }
  removeChild(element: SKElement) {
    this.children = this.children.filter((el) => el != element);
  }

  //#endregion

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
    if (this.fill) {
      gc.save();
      gc.fillStyle = this.fill;
      gc.fillRect(this.x, this.y, this.width, this.height);
      gc.restore();
    }

    gc.save();
    gc.translate(this.x, this.y);
    this.children.forEach((el) => el.draw(gc));
    gc.restore();
  }

  public toString(): string {
    return `SKContainer id:${this.id}`;
  }
}
