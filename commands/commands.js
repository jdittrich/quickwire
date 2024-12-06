

import { Rect, Point } from "../geom.js";

/**
 * Extend to create new Commands
 *  
 * While commands can take any number of parameters, the standard is passing a parameter obejct
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

// Maybe have Command → UndoableCommand, since we might want to have something like commands for creating selections etc. 

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
        this.#toContainer = rectEnclosedByFigure;
        this.#appendFigures= rectEnclosesFigures;
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

// TODO: 19.11.24 
// maybe make this a changeFigureRect that works for resize and drag? 
// it would be cool to still be able to create a simplified move command by just
// passing a drag vector.  I could have a MoveFigureCommand that I can new, which just wraps a 
// changeRectCommand by returning the new command object from the constructor, see
// https://javascript.info/constructor-new#return-from-constructors (this works for objects, not primitives, e.g. "string", 1234…)
// so I could have a:
// class MoveFigureCommand
// class resizeFigureCommand
// both just return a custom changeRectFigureCommand
// but they all can be used with new ()… (instead of relying on a helper function that can't be new-ed)

class MoveFigureCommand{
    /**
     * WIP
     * This is a facade to ChangeFigureRectCommand which can be called with new
     * @param {Object} moveFigureParam
     * @param {Point} moveFigureParam.moveBy 
     * @param {Figure} moveFigureParam.figure 
     * @returns {ChangeFigureRectCommand}
     */
    constructor(moveFigureParam, drawingView){
        const {figure,moveBy} = moveFigureParam;
        const oldRect = figure.getRect();
        const changedRect = oldRect.movedCopy(moveBy);

        const changeRectParam = {
            "changedRect":changedRect,
            "figure":figure
        }
        
        const changeFigureRectCommand = new ChangeFigureRectCommand(changeRectParam,drawingView);
        return changeFigureRectCommand;
    }
}



class ChangeFigureRectCommand extends Command{
    #figure
    #fromContainer
    #toContainer
    #changedRect
    #oldRect
    #appendFigures
    #figuresNotContainedAnymore
    /**
     * @param {Object} param
     * @param {Figure} param.figure
     * @param {Rect}   param.changedRect
     */
    constructor(param, drawingView){
        super();
        const {figure,changedRect} = param;
        
        if(!figure||!changedRect || !drawingView){
            throw Error(`tried to create new ChangeFigureRectCommand, but at least one parameter was not defined`);
        }

        //store non-derived data
        this.#figure = figure;
        this.#fromContainer = figure.getContainer();
        this.#oldRect = figure.getRect();
        this.#changedRect = changedRect;

        const oldPosition = this.#oldRect.getPosition();
        const newPosition = this.#changedRect.getPosition();
        const positionChange = oldPosition.offsetTo(newPosition);
    

        //find new container and enclosed figures at new position/size of rectangle
        const {rectEnclosesFigures, rectEnclosedByFigure} = drawingView.drawing.findFiguresEnclosingAndEnclosed(changedRect);

        // find out which contained figures are not contained anymore after the change 
        // (e.g. after making the rect much smaller)
        // these need to be appended to the figures enclosing figure ("parent"), ie. #toContainer
        const currentlyContainedFigures = figure.getContainedFigures(); 
        const figuresNotContainedAnymore = currentlyContainedFigures.filter((containedFigure)=>{
            const containedFigureRect = containedFigure.getRect();
            const containedFigureRectAfterMove = containedFigureRect.movedCopy(positionChange);
            
            // with the rect of the parent changing and the contained figures moved along, 
            // are the child figures still inside the rect?
            const  isContained = this.#changedRect.enclosesRect(containedFigureRectAfterMove)
            const  isNotContained = !isContained;
            return isNotContained;
        })

        this.#figuresNotContainedAnymore = figuresNotContainedAnymore;
        this.#toContainer = rectEnclosedByFigure;
        this.#appendFigures = rectEnclosesFigures;
    }
    do(){
        this.#figure.changeRect(this.#changedRect); //moves also the currently contained figures
        this.#figure.appendFigures(this.#appendFigures); //appends figures that are enclosed in the new Rectangle
        this.#toContainer.appendFigures(this.#figuresNotContainedAnymore); //if new rectangle is smaller, some figures might not be enclosed anymore
        this.#toContainer.appendFigure(this.#figure); //append figure to its new container.
    }
    undo(){        
        this.#fromContainer.appendFigures(this.#appendFigures);
        this.#figure.changeRect(this.#oldRect);
        this.#figure.appendFigures(this.#figuresNotContainedAnymore); //reappend figures that are included again in the changed rect
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

export {CommandStack, CreateFigureCommand,MoveFigureCommand, ChangeFigureRectCommand}