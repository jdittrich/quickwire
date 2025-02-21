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

import {Command} from './command.js';

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
        return changeFigureRectCommand; //this enable the calling with new!
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
        //note: the order of operations is relevant!
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

export {ChangeFigureRectCommand, MoveFigureCommand}