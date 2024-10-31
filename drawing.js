import {CompositeFigure} from './figures.js';
import {Rect} from './geom.js';
import {findFiguresBelowPoint, findEnclosingFigures, findEnclosedFigures} from './hitTest.js';

// the drawing contains other figures, so it is basically a composite figure
class Drawing extends CompositeFigure{
    constructor(){
        super()
        this.setRect(new Rect({
            "x":0,
            "y":0,
            "width":1000,
            "height":1000
        }));
    }
    draw(ctx){
        this.drawContainedFigures(ctx);
    }
    //#region hit tests
    findFiguresEnclosingPoint(point){
       const figuresBelowPoint = findFiguresBelowPoint(this,point,true);
       return figuresBelowPoint;
    }
    findFiguresEnclosingFigure(figure){
        const enclosingFigures = findEnclosingFigures(this,figure, true);
        return enclosingFigures;
    }
    findFiguresEnclosedByFigure(figure){
        const enclosedFigures = findEnclosedFigures(this,figure,true);
        return enclosedFigures;
    }
}

export {Drawing}


