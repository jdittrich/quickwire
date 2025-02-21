import {Figure} from "./figures/figure.js"

class Selection{
    #selectedFigure = null; 
    constructor(){}

    /**
     * gets selected figure (if existing)
     * @returns {Figure}
     */
    getSelection(){
        return this.#selectedFigure;
    }

    /**
     * @param {Figure} figure 
     */
    select(figure){
        this.#selectedFigure = figure;
    }

    clear(){
        this.#selectedFigure = null; 
    }

    /**
     * 
     * @returns {Boolean} true if a figure is selected
     */
    hasSelection(){
        const hasSelection = !!this.#selectedFigure;
        return hasSelection;
    }

    /**
     * @param {figure} figure 
     * @returns {Boolean} true if the figure is selected
     */
    isSelected(figure){
        const isSelected = (figure === this.#selectedFigure);
        return isSelected;
    }

    // getSelectionRect(){
    //     if(!this.hasSelection){throw new Error("getSelectionRect called, but no selection present")}
    //     const figureRect = this.#selectedFigure.getRect();
    //     return figureRect;
    // }
    // getHandles(drawingView){
    //     let handles = [];
    //     if(this.#selectedFigure){
    //        handles = this.#selectedFigure.getHandles(drawingView); 
    //     }
    //     return handles; 
    // }
}

export {Selection};
