
export const CLICK_DURATION: Time = 500;
export const FOREVER: Time = 10000000000000;


export type Time = number;
export type UpdateFunction = (start: number, current: number, end: number) => void;

// an animation is a function to be called every fram in time bound
class Animation {
    // the time bounds of the animation
    public start: Time;
    public end: Time;

    // the method to call every frame within the time bound
    public update: UpdateFunction;

    // the method to call when the animation is finished
    public callback: () => void;

    constructor(start: Time, end: Time, update: UpdateFunction, callback: () => void){
        this.start = start;
        this.end = end;
        this.update = update;
        this.callback = callback;
    }
}

// the animater maintains a list of animations and call them at the right time
export class Animater {
    // list of animations to call every frame
    private _anims: Animation[];

    private _time: Time;

    constructor(){
        this._anims = []
        this._time = 0;
    }

    // maintains animations in progress over time
    // must be called almost every frame
    animate(time: Time){
        this._time = time;

        let new_anims: Animation[] = []

        for (const anim of this._anims){
            if (time >= anim.start){
                anim.update(anim.start, Math.min(time, anim.end), anim.end)
            
                if (time >= anim.end) {
                    anim.callback()
                } else {
                    new_anims.push(anim)
                }
            } else {
                // delayed anim
                new_anims.push(anim)
            }
            
        }
        this._anims = new_anims
    }

    // add an Animation to the list of maintained animations
    add(update: UpdateFunction, callback: () => void, delay: Time = 0,
                                                      duration: Time = CLICK_DURATION){

        this._anims.push(new Animation(
            this._time + delay,
            this._time + delay + duration,
            update,
            callback
        ))
    }

    // if q is pressed quickly
    clearAnims(){
        for(const anim of this._anims){
            anim.update(anim.start, anim.end, anim.end)
        }
        this._anims = []
    }

    // add an Animation which last FOREVER
    // recusively add the same animation every time FOREVER ends
    loop(f: UpdateFunction, delay=0){
        this.add(f,() => {this.loop(f)}, delay, FOREVER)
    }
}
