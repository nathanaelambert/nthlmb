export class GameLogic {
    constructor(levelGenerator) {
      // levelGenerator should be a function that returns an array of items for the round
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
  
    start_game(number_of_rounds, end) {
      this.totalRounds = number_of_rounds;
      this.currentRound = 0;
      this.score = 0;
      this.endedCallback = end;
      this.phase = 'instructions';
      this._newRound();
    }
  
    _newRound() {
      this.items = this.levelGenerator();
      // Randomly pick secret item
      this.secretItem = this.items[Math.floor(Math.random() * this.items.length)];
      this.guessedThisRound = false;
      this.phase = 'instructions';
    }
  
    // Called by UI to move from instructions to search
    instructions_clear() {
      if (this.phase !== 'instructions') return;
      this.phase = 'search';
    }
  
    // Called by UI when player makes a guess
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
        this.phase = 'ended';
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
      // Only expose for testing or sound logic, not to the player
      return this.secretItem;
    }
  
    getItems() {
      return this.items;
    }
  }
  