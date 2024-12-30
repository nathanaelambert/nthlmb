import { SKMouseEvent } from ".";
import { SKContainer } from "./widget/container";
import { SKElement } from "./widget/element";

function copySKMouseEvent(me: SKMouseEvent, type: string = ""): SKMouseEvent {
  return {
    timeStamp: me.timeStamp,
    type: type || me.type,
    x: me.x,
    y: me.y,
  } as SKMouseEvent;
}

export class MouseDispatcher {
  root: SKElement;

  constructor(root: SKElement) {
    this.root = root;
  }

  mouseFocus: SKElement | null = null;

  lastElement: SKElement | null = null;

  // flat display list version
  // elementsUnderMouse(mx: number, my: number): SKElement[] {
  //   // reverse the filter results to dispatch front to back
  //   return list.filter((el) => el.hittest(mx, my))?.reverse() || [];
  // }

  elementsUnderMouseTree(
    mx: number,
    my: number,
    element: SKElement
  ): SKElement[] {
    const result: SKElement[] = [];
    if (element instanceof SKContainer) {
      (element as SKContainer).children.forEach((child) =>
        result.push(
          ...this.elementsUnderMouseTree(mx - element.x, my - element.y, child)
        )
      );
    }
    // console.log(element.id);
    if (element.hittest(mx, my)) {
      return [element, ...result];
    } else {
      return result;
    }
  }

  dispatch(me: SKMouseEvent, root?: SKElement) {
    if (!root) root = this.root;
    if (this.mouseFocus) {
      this.mouseFocus.handleMouseEvent(me);
      if (me.type == "mouseup") this.mouseFocus = null;
    } else {
      // const frontToBackHitElements = this.elementsUnderMouse(me.x, me.y);
      // console.log(me.x, me.y);
      const frontToBackHitElements = this.elementsUnderMouseTree(
        me.x,
        me.y,
        root
      ).reverse();
      // console.log(frontToBackHitElements);
      frontToBackHitElements.every((element) => {
        if (me.type == "mousemove" && this.lastElement != element) {
          // console.log(`exit ${this.lastElement}`);
          if (this.lastElement) {
            this.lastElement.handleMouseEvent(
              copySKMouseEvent(me, "mouseexit")
            );
          }
          // console.log(`enter ${element}`);
          element.handleMouseEvent(copySKMouseEvent(me, "mouseenter"));
          this.lastElement = element;
        }

        const handled = element.handleMouseEvent(me);
        if (handled && me.type == "mousedown") this.mouseFocus = element;
        return handled;
      });
      if (frontToBackHitElements.length == 0 && this.lastElement) {
        // console.log(`exit ${lastElement}`);
        this.lastElement.handleMouseEvent(copySKMouseEvent(me, "mouseexit"));
        // console.log(`enter ${null}`);
        this.lastElement = null;
      }
    }
  }
}
