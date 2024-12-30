import {
    SKEvent,
    SKMouseEvent,
    SKKeyboardEvent,
    SKResizeEvent,
    } from "./simplekit";
import { FundamentalEvent } from "./simplekit/create-loop";
import { Game } from "./game";
import { Button } from "./button";
import { distance } from "./simplekit/utility/misc";

export const longpressTranslator = {
  state: "IDLE",
  // parameters for transitions
  movementThreshold: 50,
  timeThreshold: 1000, // milliseconds
  // for tracking thresholds
  startX: 0,
  startY: 0,
  startTime: 0,

  // returns a click event if found
  update(fe: FundamentalEvent): SKMouseEvent | undefined {
    switch (this.state) {
      case "IDLE":
        if (fe.type == "mousedown") {
          this.state = "DOWN";
          this.startX = fe.x || 0;
          this.startY = fe.y || 0;
          this.startTime = fe.timeStamp;
        }
        break;

      case "DOWN":
        if (fe.timeStamp - this.startTime > this.timeThreshold) {
          this.state = "IDLE";
          return new SKMouseEvent("longpress", fe.timeStamp, fe.x || 0, fe.y || 0);
        } else if (
          fe.x &&
          fe.y &&
          distance(fe.x, fe.y, this.startX, this.startY) >
            this.movementThreshold
        ) {
          this.state = "IDLE";
        } else if (fe.type == "mouseup") {
          this.state = "IDLE";
        }
        break;
    }
    return;
  },
};

export function HandleEvent(e: SKEvent, game: Game): void {
  switch (e.type) {
    case "longpress":
      if (game.drawingState === "HUMAN") {
        game.showHint();
      }
      break;
    case "mousemove":
      if (game.drawingState === "HUMAN"){
        const me = e as SKMouseEvent;
        // this._mousePos = new Point2(me.x, me.y);
        game.buttonsArray.forEach((b: Button) => {
          b.hover = b.hitTest(me.x, me.y);
        });
      }
      break;
    case "click":
      if (game.drawingState === "HUMAN") {
        for (const b of game.buttonsArray){
          if (b.hover) {
            game.click(b);
          }
        }
      }
      break;
    case "drag":
      break;
    case "dblclick":
      break;
    case "keypress":
      const ke = e as SKKeyboardEvent;
      switch (ke.key) {
        case " ":
          if (game.drawingState === "START" || game.drawingState === "WIN" ||
              game.drawingState === "LOSE") {
            game.newRound();
              }
          break;
        case "q":
          game.restart();
          break;
        case "-":
          if (game.drawingState === "START" || game.drawingState === "WIN" ||
              game.drawingState === "LOSE") {
            game.increment(-1)
          }
          break;
        case "+":
          if (game.drawingState === "START" || game.drawingState === "WIN" ||
              game.drawingState === "LOSE") {
            game.increment(1)
          }
          break;
        case "?":
          game.toggleCheat()
          break;

      }
      break;
    case "resize":
      const {width : w, height: h} = e as SKResizeEvent;
      game.updateWindow(w, h);
      break;
  }
}


  
