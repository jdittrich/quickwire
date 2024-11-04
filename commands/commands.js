class Command{
    constructor(params){}
    do(){}
    undo(){}
    redo(){}
}

// Composite Command: allows to combine several commands, with start/end transactions: 
// See https://freegroup.github.io/draw2d/index.html#/api/draw2d/command/commandstack

class MoveCommand extends Command{
    /**
     * @param {Object} params 
     * @param {Point}  params.toPosition
     * @param {Figure} params.toContainer
     */
    constructor(figure,params){
        super();
        const {toPosition, toContainer} = params;
        if(!figure||!toPosition|| !toContainer){
            throw Error(`tried to create new MoveCommand, but at least one of toPosition ${toPosition} and toContainer ${toContainer} was not defined`);
        }
        
        this.figure = figure;
        this.fromPosition = figure.getPosition();
        this.fromContainer = figure.getContainer()
        this.toPosition = toPosition;
        this.toContainer = toContainer;
    }
    do(){
        this.figure.setPosition(this.toPosition);
        this.toContainer.appendFigure(this.figure);
    }
    undo(){
        this.figure.setPosition(this.fromPosition);
        this.fromContainer.appendFigure(this.figure);
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
    }

    /**
     * Undoes the most recent command and pushes it on redo list
     */
    undo(){
        if(this.canUndo() === false){return} //this fails silently… good or bad?
        const commandToUndo = this.#undoStack.shift();
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