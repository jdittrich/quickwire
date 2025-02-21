import { Figure } from "./figure.js";
import { Rect } from "../data/rect.js";

class NoOpFigure extends Figure{
    constructor(){
        super({ //figure needs some data, so we make some.
            rect: new Rect({
                x:0,
                y:0,
                width:10,
                height:10
            })
        });
    }
    drawFigure(ctx){}
}

export {NoOpFigure}