import {SimonLogic} from "./simonlogic";
import {Button} from "./button";
import { Animater, FOREVER } from "./animater";

export class Game {
    // 
    public animater: Animater; 

    // other modules shouldn't acces SimonLogic directly
    private _game: SimonLogic;

    // they can acces the score
    get score() {
        return this._game.score;
    }

    // basically the same as this._game.state, but with some
    // delay to let animation play out
    private _drawingState: "START" | "COMPUTER" | "HUMAN" | "WIN" | "LOSE";
    get drawingState() {
        return this._drawingState;
    }


    public cheatMode: boolean = false


    // render is the only module with access to window dimensions
    // they are needed here to generate rows of Buttons
    public windowWidth: number = 0;
    public windowHeight:number = 0;

    // Buttons
    public buttonsArray: Array<Button> = [];
    public buttonRadius: number = 60;
    private _hueAngle: number = 0;
    private _hueShift: number = 0;
    private _isClicking: boolean = false;

    //

    //-------------------------------------------------------------
    // constructor

    // when the App is launched
    constructor(){
        this._game = new SimonLogic();
        this.makeRow();
        this._drawingState = this._game.state;
        this.animater = new Animater()
        this.transitionState();
    }

    //-------------------------------------------------------------


    // initialise Row of Buttons
    private makeRow(shift = false): void{
        this._hueAngle = 360 / this._game.buttons;

        if (shift) {
            this._hueShift = Math.floor(Math.random() * this._hueAngle);
        } else {
            this._hueShift = 0;
        }
        
        const n = this._game.buttons;
        const spaceLeft = this.windowWidth - n*this.buttonRadius*2;
        const spacing = spaceLeft/(n+1);

        this.buttonsArray = Array.from({ length: n }, (_, i) =>
            new Button(spacing + this.buttonRadius + (spacing + this.buttonRadius*2) * i,
                    this.windowHeight * 0.5, 
                    i*this._hueAngle + this._hueShift,
                    this.buttonRadius,
                    i,
                    this
                    )
            );
    }
    

    remainingSequence(): string{
        const seq = this._game.remainingSequence().map((num) => num + 1);
        return seq.join(', ');
    }

    showHint() {
        const b : Button = this.buttonsArray[this._game.remainingSequence()[0]]
        this.animater.add(b.animateClick, () => {})
    }

    //-------------------------------------------------------------
    // here are the functions that will alter the state of the game:

    // called when window is resized
    updateWindow(w: number, h: number): void{
        //if window was resize
        if(this.windowHeight !== h || this.windowWidth !== w){
            //update size
            this.windowHeight = h;
            this.windowWidth  = w;
            //replace
            this.makeRow();
            this.transitionState();
        }
    }
    // make a new SimonLogic game, keep oscillating wave in place
    increment(increment: number) {
        
        // there can be from 1 up to 10 buttons
        const num = Math.max(Math.min(this._game.buttons + increment, 10), 1)
        this._game = new SimonLogic(num);
        // make row but keeps existing buttons color and y location
        this.makeRow();
        this.transitionState();  

    }
    transitionState(){
        this._drawingState = this._game.state;
        if  (this._drawingState === "START" || this.drawingState === "WIN"){
            this.buttonsArray.forEach((b: Button) => {
                this.animater.loop(b.animateSin);
            });
        } else if (this._drawingState === "LOSE") {
            this.buttonsArray.forEach((b: Button) => {
                this.animater.add(b.animateFall, () => {}, 0, FOREVER);
            });
        }
    }

    // when q is pressed, make a new SimonLogic game, restart animations
    restart() {
        //force animation end
        this.animater.clearAnims()

        this._game = new SimonLogic();
       
        this.makeRow();
        this.transitionState();  
    }

    


    // when space bar is pressed in START, WIN or LOSE
    newRound() {
        this._game.newRound();
        this.makeRow();
        this.transitionState(); // TO COMPUTER
        this.computerMove()
    }

    private computerMove() {
        const next = this._game.nextButton();
        // animate click
        this.animater.add(this.buttonsArray[next].animateClick, this.computerFinished, 500)
    }

    // should only be called by animater's callback
    computerFinished = () => {
        if (this._game.state === "HUMAN"){
            this.transitionState();
        } else { // state is COMPUTER
            this.computerMove();
        }
    }

    click(b: Button) {
        if (!this._isClicking){
            this._game.verifyButton(b.id)
            this.animater.add(b.animateClick, this.clickFinished)
        }    
    }

    // should only be called by animater's callback
    clickFinished = () => {
        this._isClicking = false;
        if (this._game.state === "WIN" || this._game.state === "LOSE") {
            this.transitionState();
        }
    }

    toggleCheat() {
        this.cheatMode = !this.cheatMode
    }



 
    


}