import { Command } from "./command.js";
import {Rect}      from "../data/rect.js";

class CreateFigureCommand extends Command{
    /**
     * @param {Object}          params
     * @param {Figure}          params.newFigurePrototype - do not use directly, copy() it. 
     * @param {Point}           params.cornerPoint1 
     * @param {Point}           params.cornerPoint2   
     */

    #newFigure
    #newFigureRect
    #appendFigures
    #toContainer

    constructor(params,drawingView){
        super()
        const {cornerPoint1, cornerPoint2, newFigurePrototype} = params; 
        
        this.drawingView = drawingView;

        const newFigureRect = Rect.createFromCornerPoints(cornerPoint1, cornerPoint2);
        const {rectEnclosesFigures, rectEnclosedByFigure} = drawingView.drawing.findFiguresEnclosingAndEnclosed(newFigureRect);

        //create figure
        const nameFigureClassMapper = drawingView.getNameFigureClassMapper();
        const newFigure = newFigurePrototype.copy(nameFigureClassMapper);
        this.#newFigureRect = newFigureRect;
        this.#newFigure = newFigure;
        this.#toContainer = rectEnclosedByFigure;
        this.#appendFigures= rectEnclosesFigures;
    }
    do(){
        console.log("appending figures:", this.#appendFigures);
        this.#newFigure.setRect(this.#newFigureRect);
        this.#toContainer.appendFigure(this.#newFigure);
        this.#newFigure.appendFigures(this.#appendFigures); 
        
        this.drawingView.select(this.#newFigure);
    }
    undo(){
        this.drawingView.clearSelection(); 
        //reattach formerly contained figures
        this.#toContainer.appendFigures(this.#appendFigures)
        
        //detach figure
        this.#toContainer.detachFigure(this.#newFigure);
        
    }
    redo(){
        this.do();
    }
}

export {CreateFigureCommand}