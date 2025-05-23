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
    this.audio_activated = false;
    this.level_readdy = false;
  }

  _setPhase(newPhase) {
    if (this.phase !== newPhase) {
      this.phase = newPhase;
      console.log(this.phase);
      this.notify({ phase: this.phase });
    } else {
      console.warn(`double call set phase ${newPhase}`);
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
    if (this.sounds_loaded){
      this._setPhase('level');
    } else {
      this._setPhase('loading');
    }
  }

  assets_loaded(){
    if (this.phase !== 'loading') {
      console.warn(`assets loaded in state ${this.phase}`);
    }
    this.sounds_loaded = true;
    this._setPhase('level');

  }
  
  levelGenerated() {
    if (this.phase != 'level') {
      console.warn('level generated outside level phase');
    }
    this.level_readdy = true;
    if (this.sounds_loaded) {
      this._setPhase('instructions');
    } else {
      console.warn('level generated with no audio');
    }
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
        this._setPhase('new game');
        this.currentRound = 0;
        this.score = 0;
        this._prepareNextRound();
      }
    } else {
      this._prepareNextRound();
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

  