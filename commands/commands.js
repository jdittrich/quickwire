

import { DrawingView } from "../drawingView.js";
import { Rect } from "../geom.js";

/**
 * Extend to create new Commands
 *  
 * While commands can take any number of parameters, the standard is passign a parameter obejct
 * 
 * Usually redo() just calls do(). 
 */
class Command{
    constructor(params){}
    do(){}
    undo(){}
    redo(){}
}

// Composite Command: allows to combine several commands, with start/end transactions: 
// See https://freegroup.github.io/draw2d/index.html#/api/draw2d/command/commandstack

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
        
        const newFigureRect = Rect.createFromCornerPoints(cornerPoint1, cornerPoint2);
        //TODO: the enclosed figures seem not to work yet 9.11.24
        const {rectEnclosesFigures, rectEnclosedByFigure} = drawingView.drawing.findFiguresEnclosingAndEnclosed(newFigureRect);

        //create figure
        const newFigure = newFigurePrototype.copy();
        this.#newFigureRect = newFigureRect;
        this.#newFigure = newFigure;
        this.#appendFigures= rectEnclosesFigures;
        this.#toContainer = rectEnclosedByFigure;
    }
    do(){
        console.log("appending figures:", this.#appendFigures);
        this.#newFigure.setRect(this.#newFigureRect);
        this.#toContainer.appendFigure(this.#newFigure);
        this.#newFigure.appendFigures(this.#appendFigures); 
    }
    undo(){
        //reattach formerly contained figures
        this.#toContainer.appendFigures(this.#appendFigures)
        
        //detach figure
        this.#toContainer.detachFigure(this.#newFigure);
    }
    redo(){
        this.do();
    }

}

//TODO: Move command does not properly consider pan! 10.11.24
class MoveFigureCommand extends Command{
    #figure
    #fromContainer
    #toContainer
    #moveBy
    #appendFigures
    
    /**
     * @param {Object} params
     * @param {Figure} params.figure
     * @param {Point}  params.moveBy
     * @param {DrawingView} drawingView
     */
    constructor(params, drawingView){
        super();
        const {moveBy, figure} = params;
        if(!figure||!moveBy || !drawingView){
            throw Error(`tried to create new MoveCommand, but at least one parameter was not defined`);
        }
        //store figure,  moveBy and current Container
        this.#figure = figure;
        this.#moveBy = moveBy;
        this.#fromContainer = figure.getContainer();

        //find new container and enclosed figures at new position
        const newFigureRect = figure.getRect().movedCopy(moveBy);
        const {rectEnclosesFigures, rectEnclosedByFigure} = drawingView.drawing.findFiguresEnclosingAndEnclosed(newFigureRect);
        //actually, having the function only take rect makes a lot of sense ↑, so we do not move the figure to do calculations for the unmoved figure etc. 
        this.#toContainer = rectEnclosedByFigure;
        this.#appendFigures = rectEnclosesFigures; //these are figures currently contained by #toContainer, but we will append them to figure. 
    }
    do(){
        console.log("appending figures:", this.#appendFigures);
        this.#figure.movePositionBy(this.#moveBy);
        this.#figure.appendFigures(this.#appendFigures);
        this.#toContainer.appendFigure(this.#figure);
    }
    undo(){
        const moveByInverse = this.#moveBy.inverse();
        
        this.#fromContainer.appendFigures(this.#appendFigures);
        this.#figure.movePositionBy(moveByInverse);
        this.#fromContainer.appendFigure(this.#figure);
    }
    redo(){
        this.do();
    }
}

class CommandStack extends EventTarget{
    #undoStack =[]
    #redoStack = []

    /**
     * Are there commands that can be undone?
     * @returns {Boolean}
     */
    canUndo(){
        const canUndo = this.#undoStack.length > 0 ? true:false;
        return canUndo;
    }

    /**
     * Are there commands that can be redone (after an undo?)
     * @returns {Boolean}
     */
    canRedo(){
        const canRedo = this.#redoStack.length > 0 ? true:false;
        return canRedo
    }

    /**
     * Runs the command and puts in on the list of undoable actions
     * @param {Command} command
     */
    do(command){
        command.do();
        this.#undoStack.unshift(command);
        this.#redoStack = [] //every new command flushes redo
        //redraw
    }

    /**
     * Undoes the most recent command and pushes it on redo list
     */
    undo(){
        if(this.canUndo() === false){return} //this fails silently… good or bad?
        const commandToUndo = this.#undoStack.shift();
        commandToUndo.undo();
        this.#redoStack.unshift(commandToUndo);
    }

    /**
     * Redoes the most recently undone command and pushes it back on the undo list. 
     */
    redo(){
        if(this.canRedo()=== false){return}
        const commandToRedo = this.#redoStack.shift();
        commandToRedo.redo();
        this.#undoStack.unshift(commandToRedo);
    }
}

export {CommandStack, MoveFigureCommand, CreateFigureCommand}