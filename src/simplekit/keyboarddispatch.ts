import { SKKeyboardEvent } from ".";
import { SKElement } from "./widget/element";

export class KeyboardDispatcher {
  static focusedElement: SKElement | null = null;

  constructor() {
    console.log("new KeyboardDispatcher");
  }

  static requestFocus(element: SKElement) {
    if (this.focusedElement == element) return;
    if (this.focusedElement) {
      const ke = {
        type: "focusout",
        timeStamp: performance.now(),
        key: null,
      } as SKKeyboardEvent;
      this.focusedElement.handleKeyboardEvent(ke);
      console.log(`lost focus ${this.focusedElement}`);
    }
    const ke = {
      type: "focusin",
      timeStamp: performance.now(),
      key: null,
    } as SKKeyboardEvent;
    element.handleKeyboardEvent(ke);
    this.focusedElement = element;
    console.log(`gained focus ${this.focusedElement}`);
  }

  static dispatch(ke: SKKeyboardEvent) {
    if (!this.focusedElement) return;

    console.log(`keyboardDispatch ${ke} ${this.focusedElement}`);
    this.focusedElement.handleKeyboardEvent(ke);
  }
}
