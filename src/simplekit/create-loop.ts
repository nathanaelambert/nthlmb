/**
 * Creates a simulated UI toolkit run loop only with low-level fundamental system events
 * @module create-loop
 *
 */

export interface FundamentalEvent {
  type:
    | "resize"
    | "keydown"
    | "keyup"
    | "mousemove"
    | "mousedown"
    | "mouseup"
    | "null";
  timeStamp: DOMHighResTimeStamp;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  key?: string;
}

function createFundamentalEvent(domEvent: Event): FundamentalEvent | undefined {
  if (domEvent.type == "resize") {
    return {
      type: domEvent.type,
      timeStamp: domEvent.timeStamp,
      width: document.body.clientWidth,
      height: document.body.clientHeight,
      // width: window.innerWidth,
      // height: window.innerHeight,
    };
  } else if (
    domEvent.type == "mouseup" ||
    domEvent.type == "mousedown" ||
    domEvent.type == "mousemove"
  ) {
    const me = domEvent as MouseEvent;
    return {
      type: domEvent.type,
      timeStamp: domEvent.timeStamp,
      x: me.x,
      y: me.y,
    };
  } else if (domEvent.type == "keyup" || domEvent.type == "keydown") {
    const ke = domEvent as KeyboardEvent;
    if (ke.repeat) return;
    return {
      type: domEvent.type,
      timeStamp: domEvent.timeStamp,
      key: ke.key,
    };
  } else {
    console.warn(`event ${domEvent.type} not supported as FundamentalEvent`);
    return;
  }
}

export type LoopHandler = (
  gc: CanvasRenderingContext2D,
  eventQueue: FundamentalEvent[],
  time: DOMHighResTimeStamp
) => void;

/**
 * Creates a simple run loop to simulate a UI kit main loop.
 * @param {HTMLCanvasElement} canvas - The canvas element to run the loop.
 * @param {LoopHandler} loopFunction - Callback function on each loop iteration.
 */
export function createRunLoop(
  canvas: HTMLCanvasElement,
  loopFunction: LoopHandler
) {
  const options = {
    coalesceEvents: false,
    log: false,
  };

  if (!canvas) {
    console.warn("Expecting HTML canvas element");
    return;
  }

  const gc = canvas.getContext("2d");
  if (gc == null) {
    console.warn("Unable to find canvas rendering context");
    return;
  }

  // setup fundamental event queue
  const eventQueue: FundamentalEvent[] = [];

  // callback used for all events we want to add to the queue
  function saveEvent(domEvent: Event) {
    const fundamentalEvent = createFundamentalEvent(domEvent);

    if (!fundamentalEvent) {
      return;
    }

    // coalesce frequent continuous events
    if (options.coalesceEvents) {
      const i = eventQueue.findIndex(
        (e) => e.type == "mousemove" || e.type == "resize"
      );
      if (i > -1) {
        eventQueue[i] = fundamentalEvent;
      } else {
        eventQueue.push(fundamentalEvent);
      }
      if (options.log) {
        console.log(
          `enqueue ${fundamentalEvent.type}, ${eventQueue.length} ${
            i < 0 ? "(new)" : i
          }`
        );
      }
    } else {
      eventQueue.push(fundamentalEvent);
    }
  }

  // listen for fundamental events to simulate low-level system event queue
  window.addEventListener("mousedown", saveEvent);
  window.addEventListener("mouseup", saveEvent);
  window.addEventListener("mousemove", saveEvent);
  window.addEventListener("keydown", saveEvent);
  window.addEventListener("keyup", saveEvent);
  window.addEventListener("resize", saveEvent);

  // push a resize event when loop starts
  const initialResizeEvent = createFundamentalEvent(new Event("resize"));
  if (initialResizeEvent) eventQueue.push(initialResizeEvent);

  // run the provided user draw loop
  function loop(time: DOMHighResTimeStamp) {
    if (gc != null) loopFunction(gc, eventQueue, time);
    // schedule to run again
    window.requestAnimationFrame(loop);
  }

  // launch first frame of loop
  window.requestAnimationFrame(loop);
}
