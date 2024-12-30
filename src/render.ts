import {Game} from "./game";
import {Point2} from "./simplekit/utility";
import {Button} from "./button";




function text(gc: CanvasRenderingContext2D, message: string, pos: Point2) {
    gc.save();
    gc.font = "18pt sans-serif";
    gc.textAlign = "center";
    gc.fillText(message, pos.x, pos.y);
    gc.restore();
}
function grey_text(gc: CanvasRenderingContext2D, message: string, pos: Point2) {
    gc.save();
    gc.font = "16pt sans-serif";
    gc.textAlign = "right";
    gc.fillStyle = 'grey';
    gc.fillText(message, pos.x, pos.y);
    gc.restore();
}
export function Draw(gc: CanvasRenderingContext2D, game: Game) {
    const width = gc.canvas.clientWidth
    const height = gc.canvas.clientHeight
    
    // clear canvas to avoid cluter
    gc.clearRect(0, 0, width, height)


    // drawing the different sections and their content: 
    
    //------------------------------------------------------
    // MIDDLE
    gc.save();
    game.buttonsArray.forEach((b: Button) => b.draw(gc));
    gc.restore();
    
    //------------------------------------------------------
    // TOP
    const top: Point2 = new Point2(width *0.5, height *0.2);
    text(gc, `score ${game.score}`, top);

    //------------------------------------------------------
    // BOTTOM
    const bottom: Point2 = new Point2(width *0.5, height *0.7);
    if (game.drawingState === "START") {
        text(gc, "Press SPACE to play", bottom);
    }
    if (game.drawingState === "COMPUTER") {
        text(gc, "Watch what I do ...", bottom);
    }
    if (game.drawingState === "HUMAN") {
        if (game.cheatMode) {
            text(gc, game.remainingSequence(), bottom);
        } else {
            text(gc, "Now it’s your turn", bottom);
        }

    }
    if (game.drawingState === "WIN") {
        text(gc, "You won! Press SPACE to continue", bottom);

    }
    if (game.drawingState === "LOSE") {
        text(gc, "You lose. Press SPACE to play again", bottom);

    }

    //------------------------------------------------------
    // RIGHTCORNER
    const corner: Point2 = new Point2(width *0.95, height * 0.95)
    if (game.cheatMode) {
        grey_text(gc, "CHEATING", corner);
    } 
    

}
