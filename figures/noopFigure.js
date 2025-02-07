import { Figure } from "./figure.js";

class NoOpFigure extends Figure{
    constructor(){
        super({ //figure needs some data, so we make some.
            x:0,
            y:0,
            width:10,
            height:10
        });
    }
    drawFigure(ctx){}
}

export {NoOpFigure}