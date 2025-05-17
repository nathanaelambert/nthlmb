import { Observable } from './Observable.js';

export class GameLogic extends Observable {
  constructor(levelGenerator) {
    super();
    this.levelGenerator = levelGenerator;
    this.phase = 'idle'; // 'idle', 'instructions', 'search', 'ended'
    this.currentRound = 0;
    this.totalRounds = 0;
    this.score = 0;
    this.secretItem = null;
    this.items = [];
    this.endedCallback = null;
    this.guessedThisRound = false;
  }

  // Private method to set phase and notify observers if changed
  _setPhase(newPhase) {
    if (this.phase !== newPhase) {
      this.phase = newPhase;
      this.notify({ phase: this.phase });
    }
  }

  start_game(number_of_rounds, end) {
    this.totalRounds = number_of_rounds;
    this.currentRound = 0;
    this.score = 0;
    this.endedCallback = end;
    this._setPhase('instructions');
    this._newRound();
  }

  _newRound() {
    this.items = this.levelGenerator();
    this.secretItem = this.items[Math.floor(Math.random() * this.items.length)];
    this.guessedThisRound = false;
    this._setPhase('instructions');
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
      this._newRound();
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

  getTotalRounds() {
    return this.totalRounds;
  }

  getScore() {
    return this.score;
  }

  getSecretItem() {
    return this.secretItem;
  }

  getItems() {
    return this.items;
  }
}

  