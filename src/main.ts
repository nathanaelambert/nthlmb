// You can import anything from "./simplekit/utility".
// You can import anything from "./simplekit/drawable".

import {
  startSimpleKit,
  setSKDrawCallback,
  setSKEventListener,
  setSKAnimationCallback,
  addSKEventTranslator,
  } from "./simplekit";

import { Draw } from "./render";
import { HandleEvent, longpressTranslator } from "./eventHandler";
import { Game } from "./game";




startSimpleKit();

// game is the main module for everything UI related
const game = new Game();

setSKEventListener((e) => HandleEvent(e, game));

addSKEventTranslator(longpressTranslator);

setSKDrawCallback((gc) => {Draw(gc, game);});

setSKAnimationCallback((t) => game.animater.animate(t));
