import {CompositeFigure} from './figures.js';
import {Rect} from './geom.js';
import {findFiguresBelowPoint, findEnclosingFigures, findEnclosedFigures, findFiguresEnclosingAndEnclosed} from './hitTest.js';

// the drawing contains other figures, so it is basically a composite figure
class Drawing extends CompositeFigure{
    constructor(){
        super()
        this.setRect(new Rect({
            "x":0,
            "y":0,
            "width":600,
            "height":600
        }));
    }
    draw(ctx){
        const {width, height} = this.getRect();
        ctx.save();
        ctx.fillStyle = "lightgray";
        ctx.fillRect(0,0,width,height);
        ctx.restore()
        this.drawContainedFigures(ctx);
    }
    //#region hit tests
    /**
     * Convenience method for the most common use for hit-testing figures: 
     * Finding the innermost enclosing figure and the enclosed figures that are 
     * enclosed in this enclosing figures (which would then attached to the figures passed for hit-testing)
     * 
     * @param {Rect} figure 
     * @returns {Object} 
     */
    findFiguresEnclosingAndEnclosed(rect){
        //unpacking the variables and repackaging again does not make much sense, but I want to show what is in the object. lets see how to do this better. 
        const {rectEnclosesFigures,rectEnclosedByFigure} = findFiguresEnclosingAndEnclosed(this,rect);

        return {
            "rectEnclosesFigures":  rectEnclosesFigures,
            "rectEnclosedByFigure": rectEnclosedByFigure
        };
    }

    findFiguresEnclosingPoint(point){
       const figuresBelowPoint = findFiguresBelowPoint(this,point,false); //…,…,false = don’t allow to select the drawing itself
       return figuresBelowPoint;
    }
    toJSON(){
        return{
            "containedFigures":this.getJsonOfContainedFigures()
        }
    }
}

export {Drawing}


