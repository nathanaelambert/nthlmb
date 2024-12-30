export class SimonLogic {
  /**
   * The current state of the game:
   * START - game is ready to start
   * COMPUTER - computer is playing a sequence of buttons
   * HUMAN - human is guessing the sequence of buttons
   * WIN - game is over, human won
   * LOSE - game is over, human lost
   */
  get state() {
    return this._state;
  }
  private _state: "START" | "COMPUTER" | "HUMAN" | "WIN" | "LOSE";

  /**
   * The current score
   */
  get score() {
    return this._score;
  }
  private _score = 0;

  /**
   * The length of the button sequence
   */
  get length() {
    return this._length;
  }
  private _length = 1;

  /**
   * The index of the current button in the sequence
   */
  get index() {
    return this._index;
  }
  private _index = 0;

  private sequence: Array<number> = [];

  private button = 0;

  /**
   * Creates new Simon game
   * @param buttons number of buttons in the game
   * @param debug show debug messages in console
   */
  constructor(public buttons = 4, public debug = true) {
    this.debugMsg("creating game");
    this.debug = debug;
    this.buttons = buttons;
    this._state = "START";
    this.debugMsg(`starting ${this.buttons} button game`);
  }

  private debugMsg(msg: string) {
    if (this.debug) console.log(` ${msg}`);
  }

  /**
   * Get the remaining sequence of buttons to show
   * @returns array of button indices
   */
  remainingSequence() {
    return this.sequence.slice(this._index);
  }

  /**
   * Start a new round of the game
   * resets the length and score
   * generates a new sequence
   * sets the state to COMPUTER
   */
  newRound() {
    this.debugMsg(`newRound from state ${this._state}`);

    if (this._state == "LOSE" || this._state == "START") {
      this.debugMsg(`reset length and score`);
      this._length = 1;
      this._score = 0;
    }

    this.sequence = [...Array(this._length)].map(() =>
      Math.floor(Math.random() * this.buttons)
    );

    this.debugMsg(`new sequence: [${this.sequence}]`);

    this._index = 0;
    this._state = "COMPUTER";
  }

  /**
   * Get the next button to show when computer is playing
   * returns the button number to show
   * if all the buttons were shown, updates game state to HUMAN
   */
  nextButton(): number {
    if (this._state != "COMPUTER") {
      console.warn(`[WARNING] nextButton called in state ${this._state}`);
    }

    // this is the next button to show in the sequence
    this.button = this.sequence[this._index];

    this.debugMsg(`nextButton: index ${this._index} button ${this.button}`);

    // advance to next button
    this._index++;

    // if all the buttons were shown, give
    // the human a chance to guess the sequence
    if (this._index >= this._length) {
      this._index = 0;
      this._state = "HUMAN";
    }
    return this.button;
  }

  /**
   * Verify the button pressed by the human
   * if the button is correct, checks if sequence is finished, and returns true
   * if the button is wrong, sets the state to LOSE and returns false
   */
  verifyButton(button: number): boolean {
    if (this._state != "HUMAN") {
      console.warn(`[WARNING] verifyButton called in state ${this._state}`);
    }

    // did they press the right button?
    let correct = button == this.sequence[this._index];

    this.debugMsg(
      `verifyButton: index ${this._index} pushed ${button} sequence ${
        this.sequence[this._index]
      }`
    );

    // advance to next button
    this._index++;

    // pushed the wrong button, game over
    if (!correct) {
      this._state = "LOSE";
      this.debugMsg(` wrong, state is now ${this._state}`);
      return false;
    }

    // pushed the right button
    this.debugMsg(` correct`);

    // check if they finished the sequence
    if (this._index == this._length) {
      this._state = "WIN";
      this.debugMsg(`state is now ${this._state}`);
      // update the score
      this._score++;
      // increase the difficulty
      this._length++;
      this.debugMsg(
        `new score ${this._score}, length increased to ${this._length}`
      );
    }

    return true;
  }
}
