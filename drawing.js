import {CompositeFigure} from './figures.js';

// the drawing contains other figures, so it is basically a composite figure
class Drawing extends CompositeFigure{
    constructor(){
        super()
    }
    draw(ctx){
        ctx.fillText("Drawing Draws", 60,60);
    }
    
    // === invalidation management ===
    /**
     * called by: figures when invalidated
     */
    figureChanged(){

    }
    /**
     * called by: figure invalidated
     * will call: usually drawingView
     */
    drawingChanged(){

    }

}

export {Drawing}


