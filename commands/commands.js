

import { DrawingView } from "../drawingView.js";
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
     * @param {Object} moveFigureParams
     * @param {Point} moveFigureParams.moveBy 
     * @param {Figure} moveFigureParams.figure 
     * @returns {ChangeFigureRectCommand}
     */
    constructor(moveFigureParams, drawingView){
        const {figure,moveBy} = moveFigureParams;
        const oldRect = figure.getRect();
        const changedRect = oldRect.movedCopy(moveBy);

        const changeRectParams = {
            "changedRect":changedRect,
            "figure":figure
        }
        
        const changeFigureRectCommand = new ChangeFigureRectCommand(changeRectParams,drawingView);
        return changeFigureRectCommand;
    }
}

class ResizeFigureCommand{
    /**
     * @param {Object} resizeFigureParams
     * @param {Point} resizeFigureParams.resizeBy - document coordinates
     * @param {string} resizeFigureParams.direction - coordinates: top, topright,right,bottomright, bottom, bottomleft, left, topleft
     * @returns 
     */
    constructor(resizeFigureParams, drawingView){
        const figure = resizeFigureParams.figure;
        const figureRect = figure.getRect();
        const corners = figureRect.getCorners();

        const direction = resizeFigureParams.direction;
        
        /* 
        since any rectangle can be defined by two opposite corners
        we pick a movingPoint and its opposite fixedPoint 
        and use it to define a new rectangle
        In case of constrained movements to top, right, bottom or left
        we need to pick one of the two points which is not part of that 
        direction (e.g. for "right" pick either bottomLEFT or topLEFT)
        and then the opposite of the picked point.
        */

        let fixedPoint = null; 
        let movingPoint = null; 

        // movement in one direction only for use in 
        // top/bottom (vertical) or left/right (horizontal)
        const verticalMovement = new Point({x:0,y:resizeBy.y});  
        const horizontalMovement = new Point({x:resizeBy.x, y:0});

        //create points based on direction
        switch(direction){
            case "top":{
                fixedPoint = corners.bottomleft;
                movingPoint = corners.topright.add(verticalMovement);
                break;
            }
            case "topright":{
                fixedPoint = corners.bottomleft;
                movingPoint = corners.topright.add(direction);
                break;
            }
            case "right":{
                fixedPoint = corners.topleft;
                movingPoint = corners.bottomright.add(horizontalMovement);
                break;
            }
            case "bottomright":{
                fixedPoint = corners.topleft;
                movingPoint = corners.bottomright.add(direction);
                break;
            }
            case "bottom":{
                fixedPoint = corners.topleft;
                movingPoint = corners.bottomright.add(verticalMovement);
                break;
            }
            case "bottomleft":{
                fixedPoint =  corners.topright;
                movingPoint = corners.bottomleft.add(resizeBy);
            }
            case "left":{
                fixedPoint = corners.topright;
                movingPoint = corners.bottomleft.add(horizontalMovement);
                break;
            }
            case "topleft":{
                fixedPoint = corners.bottomleft;
                movingPoint = corners.topleft.add(resizeBy);
                break;
            }
            default:{
                throw new Error("ResizeFigureCommand: Passed direction not recognized, value was:"+direction);
            }

        }

        const changedRect = Rect.createFromCornerPoints(fixedPoint,movingPoint);
        const params = {
            changedRect:changedRect,
            figure:figure
        };
        const changeFigureRectCommand = new ChangeFigureRectCommand(params, drawingView);
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
    /**
     * @param {Object} params
     * @param {Figure} params.figure
     * @param {Rect}   params.changedRect
     */
    constructor(params, drawingView){
        super();
        const {figure,changedRect} = params;
        
        if(!figure||!changedRect || !drawingView){
            throw Error(`tried to create new ChangeFigureRectCommand, but at least one parameter was not defined`);
        }

        //store non-derived data
        this.#figure = figure;
        this.#fromContainer = figure.getContainer();
        this.#oldRect = figure.getRect();
        this.#changedRect = changedRect;

        //find new container and enclosed figures at new position/size of rectangle
        const {rectEnclosesFigures, rectEnclosedByFigure} = drawingView.drawing.findFiguresEnclosingAndEnclosed(changedRect);
        this.#toContainer = rectEnclosedByFigure;
        this.#appendFigures = rectEnclosesFigures;
    }
    do(){
        this.#figure.changeRect(this.#changedRect);
        this.#figure.appendFigures(this.#appendFigures);
        this.#toContainer.appendFigure(this.#figure);
    }
    undo(){        
        this.#fromContainer.appendFigures(this.#appendFigures);
        this.#figure.changeRect(this.#oldRect);
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

export {CommandStack, MoveFigureCommand, ResizeFigureCommand, CreateFigureCommand}