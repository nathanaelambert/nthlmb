import { FundamentalEvent, createRunLoop } from "./create-loop";

// our simple simulated UI Kit events
import { SKEvent, SKKeyboardEvent, SKMouseEvent } from "./events";
// dispatchers
import { MouseDispatcher } from "./mousedispatch";
import { KeyboardDispatcher } from "./keyboarddispatch";

import {
  EventTranslator,
  fundamentalTranslator,
  clickTranslator,
  keypressTranslator,
  dblclickTranslator,
  dragTranslator,
} from "./translators";

import { SKElement } from "./widget";

// merges b into a, preserves order of each and puts "a" events first if same time
// assumes a and b are sorted by timestamp prop
function mergeEventQueues(a: SKEvent[], b: SKEvent[]): SKEvent[] {
  let result: SKEvent[] = [];
  let j = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i].timeStamp <= b[j].timeStamp) {
      result.push(a[i]);
    } else {
      while (j < b.length && b[j].timeStamp < a[i].timeStamp) {
        result.push(b[j]);
        j++;
      }
      result.push(a[i]);
    }
  }
  // push any later events still in b
  while (j < b.length) {
    result.push(b[j]);
    j++;
  }

  return result;
}

let doCoalesce = true;

function loop(
  gc: CanvasRenderingContext2D,
  eventQueue: FundamentalEvent[],
  time: number
) {
  // coalesce
  // TODO: rewrite to more clear
  function coalesce(events: FundamentalEvent[]) {
    const original = [...events];
    events.length = 0;
    original.forEach((e) => {
      if (e.type == "mousemove" || e.type == "resize") {
        const i = events.findIndex(
          (e) => e.type == "mousemove" || e.type == "resize"
        );
        if (i > -1) {
          events[i] = e;
        } else {
          events.push(e);
        }
      } else {
        events.push(e);
      }
    });
  }

  if (doCoalesce) {
    coalesce(eventQueue);
  }

  // list of events to dispatch
  let events: SKEvent[] = [];

  // translate fundamental events

  // if no fundamental events, send  a null event with time for
  // translators that trigger events based on time
  if (eventQueue.length == 0) {
    const nullEvent = { type: "null", timeStamp: time } as FundamentalEvent;
    translators.forEach((t) => {
      const translatedEvent = t.update(nullEvent);
      if (translatedEvent) {
        events.push(translatedEvent);
      }
    });
  }

  // if no fundamental events, send  a null event with time for
  // translators that trigger events based on time
  if (eventQueue.length == 0) {
    const nullEvent = { type: "null", timeStamp: time } as FundamentalEvent;
    translators.forEach((t) => {
      const translatedEvent = t.update(nullEvent);
      if (translatedEvent) {
        events.push(translatedEvent);
      }
    });
  }
  // use fundamental events to generate SKEvents
  while (eventQueue.length > 0) {
    const fundamentalEvent = eventQueue.shift();
    if (!fundamentalEvent) continue;
    translators.forEach((t) => {
      const translatedEvent = t.update(fundamentalEvent);
      if (translatedEvent) {
        events.push(translatedEvent);
      }
    });
  }

  // merge any other events
  // (assumes otherEvents sorted by timeStamp prop)
  events =
    otherEvents.length > 0 ? mergeEventQueues(events, otherEvents) : events;

  // dispatch to global handler
  events.forEach((e) => {
    if (mouseDispatcher && e instanceof SKMouseEvent) {
      const me = e as SKMouseEvent;
      mouseDispatcher.dispatch(me);
    }
    if (e instanceof SKKeyboardEvent) {
      // console.log(`${e.type} ${typeof e}`);
      const ke = e as SKKeyboardEvent;
      KeyboardDispatcher.dispatch(ke);
    }

    if (eventListener) eventListener(e);
  });

  // animation
  if (animateCallback) animateCallback(time);

  // if we have a UI root, draw that
  if (uiTreeRoot) {
    gc.clearRect(0, 0, canvas.width, canvas.height);
    uiTreeRoot.draw(gc);
  } else if (drawCallback)
    // now tell application to redraw
    drawCallback(gc, time);
}

// standard fundamental event translators
const translators: EventTranslator[] = [
  fundamentalTranslator,
  keypressTranslator,
  clickTranslator,
  dblclickTranslator,
  dragTranslator,
];

/**
 * Adds an fundamental event translator to the list of translators
 * @param translator the translator to add
 */
export function addSKEventTranslator(translator: EventTranslator) {
  translators.push(translator);
  console.log(`added event translator, now ${translators.length} translators`);
}

/**
 * Sets a global event listener
 * @param listener the event listener callback
 */
export function setSKEventListener(listener: EventListener) {
  eventListener = listener;
}
type EventListener = (e: SKEvent) => void;
let eventListener: EventListener;

/**
 * Sets function to draw graphics each frame
 * @param draw the draw callback
 */
export function setSKDrawCallback(draw: DrawCallback) {
  drawCallback = draw;
}
type DrawCallback = (gc: CanvasRenderingContext2D, time: number) => void;
let drawCallback: DrawCallback;

/**
 * Sets function to update animations each frame
 * @param animate the animation callback
 */
export function setSKAnimationCallback(animate: AnimationCallback) {
  animateCallback = animate;
}
type AnimationCallback = (time: number) => void;
let animateCallback: AnimationCallback;

// method to send other events
const otherEvents: SKEvent[] = [];

export function sendSKEvent(e: SKEvent) {
  otherEvents.push(e);
}

let uiTreeRoot: SKElement | null;
let mouseDispatcher: MouseDispatcher | null;

export function setSKRoot(root: SKElement) {
  uiTreeRoot = root;
  if (root) mouseDispatcher = new MouseDispatcher(root);
  else mouseDispatcher = null;
}

// SimpleKit draws everything in this canvas
let canvas: HTMLCanvasElement;

// clearRect convenience method
export function SKClearRect(gc: CanvasRenderingContext2D) {
  gc.clearRect(0, 0, canvas.width, canvas.height);
}

export function startSimpleKit() {
  console.log(`🧰 SimpleKit startup`);

  // setup the canvas
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (!canvas) {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    console.log(`created canvas`);
  } else {
    console.log(`found canvas`);
  }

  // set some styles to make it easier to see the canvas
  // canvas.style.setProperty("border", "1px solid black");
  canvas.style.setProperty("background", "whitesmoke");

  document.body.style.setProperty("margin", "0");
  document.body.style.setProperty("padding", "0");
  document.body.style.setProperty("height", "100vh");

  // make canvas fill the window
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  window.addEventListener("resize", () => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
  });

  // start the toolkit run loop
  createRunLoop(canvas, loop);
}
