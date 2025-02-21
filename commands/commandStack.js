
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

export {CommandStack}