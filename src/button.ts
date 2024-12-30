// import {Point2} from "./simplekit/utility";
import { Time } from "./animater";
import { Game } from "./game";

export class Button {
    private _x: number;
    private _y: number;
    private _default_y: number;
    private _hue: number;
    private _radius: number;
    private _default_radius: number;

    get id(){
        return this._id;
    }
    private _id: number;

    //are updated by eventHandler to be consistent with user input
    public hover: boolean ;

    // wether this button isAnimating
    private _isAnimating: boolean;

    private _game: Game;
    
    constructor(x: number, y: number, hue: number, radius: number, 
                id: number, game: Game){
        this._x = x;
        this._y = y;
        this._default_y = y;
        this._hue = hue;
        this._radius = radius;
        this._default_radius = radius;
        this._id = id;
        this.hover = false;
        this._isAnimating = false;
        this._game = game;
    }

    updatePos(x: number, y: number): void {
        this._x = x;
        this._y = y;
    }

    // called every frame will draw button 
    // with radius, color, position...
    draw(gc: CanvasRenderingContext2D): void{

        if (this.hover && !this._isAnimating && this._game.drawingState === "HUMAN") {
            gc.fillStyle = `hsl(${60}, ${100}%, ${60}%)`;
            // draw a yellow circle
            gc.beginPath();
            gc.arc(this._x, this._y, this._radius*7/6, 0, Math.PI * 2);
            gc.fill();
            gc.closePath();
        }

        gc.fillStyle = `hsl(${this._hue}, ${90}%, ${38}%)`;
        // draw a circle
        gc.beginPath();
        gc.arc(this._x, this._y, this._radius, 0, Math.PI * 2);
        gc.fill();
        gc.closePath();
        

        gc.fillStyle = "white";
        gc.font = "36pt sans-serif";
        gc.textAlign = "center";
        gc.textBaseline  ="middle";
        // draw button id
        gc.fillText(`${this._id + 1}`, this._x, this._y);

    }

    // returns true if (x, y) hits this button
    hitTest(x: number, y: number): boolean{
        return Math.pow(this._x - x, 2) + Math.pow(this._y - y, 2) <= Math.pow(this._radius, 2);
    }

    // called almost every frame for the time between start and end
    // current is the time at which it is called
    // this function must at least be called 1 time with current === end
    animateClick = (start: Time, current: Time, end: Time) => {
        if(current === end) {
            this._isAnimating = false;
            this._radius = this._default_radius;
        } else {
            this._isAnimating = true;
            const normalised = (current - start) / (end - start)
            this._radius = this._default_radius * (1 + 0.25*normalised)
        }
    }

    // called almost every frame for the time between start and end
    // current is the time at which it is called
    // this function must at least be called 1 time with current === end
    animateSin = (start: Time, current: Time, end: Time) => {
        
        if(current === end) {
            this._isAnimating = false;
            this._y = this._default_y;
        } else {
            this._isAnimating = true;
            const shape = 3*Math.sin((this.id + 1)/7) - 5;
            const a = this._game.windowHeight/3 - this._default_radius * 1.4;
            const time = (current - start) / 5000
            this._y = this._default_y  - a*Math.sin(time*Math.PI*2 + shape);
        
            
        }
    }

    // called almost every frame for the time between start and end
    // current is the time at which it is called
    // this function must at least be called 1 time with current === end
    animateFall = (start: Time, current: Time, end: Time) => {
        if(current === end) {
            this._isAnimating = false;
            this._y = this._default_y;
        } else {
            this._isAnimating = true;
            this._y = this._default_y  + (current - start);
        
            
        }
 
    }
}
