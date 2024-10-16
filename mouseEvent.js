
// import for types
import { DrawingView } from "./drawingView.js";
import { Point } from "./geom.js";


class LocalMouseEvent{ 
    #screenPosition
    #previousPosition

    /**
     * @param {Object}      params
     * @param {Point}       params.screenPosition - where the event on the view happened in screen coordinates (in contrast to document coordinates)
     * @param {Point}       params.previousPosition
     * @param {DrawingView} params.view - needs access to point transformation methods of view.
     */
    constructor(params){
        this.#screenPosition = params.screenPosition;
        this.#previousPosition = params.previousPosition;
        this.drawingView = params.view; 
    }

    /**
     * @returns {Point}
     */
    getScreenPosition(){
        return this.#screenPosition.copy();
    }

    /**
     * @returns {Point}
     */
    getScreenMovement(){
        return this.#screenPosition.offsetFrom(this.#previousPosition);
    }

    /**
     * @returns {Point}
     */
    getDocumentPosition(){
        const transformedPosition = this.drawingView.screenToDocumentPosition(this.screenPosition);
        return transformedPosition;
    }

    /**
     * @returns {Point}
     */
    getDocumentMovement(){
        const screenMovement = this.getScreenMovement()
        const documentMovement = this.DrawingView.screenToDocumentPosition(screenMovement);
        return documentMovement;
    }

    /**
     * @returns {DrawingView}
     */
    getDrawingView(){
        return this.drawingView;
    }
    
    /**
     * @returns {Point}
     */
    getPreviousScreenPosition(){ //dunno if I need this
        return this.#previousPosition.copy();
    }
}


export {LocalMouseEvent}

/**
 * NOTES:
 * - Not called "MouseEvent", since browser’s mouse Events are called that way already (https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
 */