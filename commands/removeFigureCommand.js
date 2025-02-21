import { Command } from "./command.js";

class RemoveFigureAndContainedCommand extends Command{
    /**
     * @param {Object}          params
     * @param {Figure}          params.figureToDelete 
     */

    #figureToDelete
    #figureContainer
    #drawingView

    constructor(param,drawingView){
        super();
        this.#drawingView = drawingView;
        this.#figureToDelete  = param.figureToDelete;
        this.#figureContainer = this.#figureToDelete.getContainer();
    }
    do(){
        this.#figureContainer.detachFigure(this.#figureToDelete);
        this.#drawingView.clearSelection();
    }
    undo(){
        this.#figureContainer.appendFigure(this.#figureToDelete); 
        this.#drawingView.select(this.#figureToDelete);       
    }
    redo(){
        this.do();
    }
}

export {RemoveFigureAndContainedCommand as RemoveFigureAndContainedCommand}