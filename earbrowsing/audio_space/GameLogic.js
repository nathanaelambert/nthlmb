import { Observable } from './Observable.js';
import { items } from './items.js';

export class GameLogic extends Observable {
  constructor() {
    super();
    this.phase = 'idle';
    this.currentRound = 0;
    this.totalRounds = 0;
    this.score = 0;
    this.secretItem = null;
    this.levelItems = [];
    this.endedCallback = null;
    this.guessedThisRound = false;
    this.numberOfItems = 15;
    this.sounds_loaded = false;
  }

  _setPhase(newPhase) {
    if (this.phase !== newPhase) {
      this.phase = newPhase;
      console.log(this.phase);
      this.notify({ phase: this.phase });
    }
  }

  start_game(number_of_rounds, end) {
    this.totalRounds = number_of_rounds;
    this.currentRound = 0;
    this.score = 0;
    this.endedCallback = end;
    this._prepareNextRound();
  }

  _prepareNextRound() {
    const shuffled = items.slice().sort(() => Math.random() - 0.5);
    this.levelItems = shuffled.slice(0, this.numberOfItems);
    this.secretItem = this.levelItems[Math.floor(Math.random() * this.levelItems.length)];
    this.guessedThisRound = false;
    this._setPhase('ready');
  }

  assets_loaded(){
    this.sounds_loaded = true;
  }
  
  levelGenerated() {
    if (this.phase === 'level') this._setPhase('instructions');
  }


  instructions_clear() {
    if (this.phase !== 'instructions') return;
    this._setPhase('search');
  }

  guess(item) {
    if (this.phase !== 'search' || this.guessedThisRound) return;
    this.guessedThisRound = true;
    let correct = false;
    if (item === this.secretItem) {
      this.score++;
      correct = true;
    }
    this.currentRound++;
    if (this.currentRound >= this.totalRounds) {
      this._setPhase('ended');
      if (typeof this.endedCallback === 'function') {
        this.endedCallback(this.score);
      }
    } else {
      this._prepareNextRound();
      this._setPhase('instructions');
    }
    return correct;
  }

  // Getters for UI or other logic to query state
  getPhase() {
    return this.phase;
  }

  getRound() {
    return this.currentRound + 1; // 1-based for UI
  }
  
  getLevelItems() {
    return this.levelItems;
  }

  getNumberOfItems() {
    return this.numberOfItems;
  }

  getTotalRounds() {
    return this.totalRounds;
  }

  getScore() {
    return this.score;
  }

  getSecretItem() {
    return this.secretItem;
  }
}

  