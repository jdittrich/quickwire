
// import for types
import { DrawingView } from "./drawingView.js";
import { Point } from "./geom.js";

/**
 * Our own mouse event. 
 * It does not depend on the DOM mouse events (except for calculating the initial mouse position)
 * It knows the drawingView, so it can provide positions and movement in document coordinates. 
 */
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
        if(!params.screenPosition || !params.previousPosition || !params.view){
            throw new Error("At least one needed parameter is not defined");
        }
        this.#screenPosition = params.screenPosition
        this.#previousPosition = params.previousPosition
        this.drawingView = params.view; 
    }

    /**
     * @returns {Point}
     */
    getScreenPosition(){
        return this.#screenPosition.copy();
    }

    /**
     * Vector between current mouse position and the previous one in screen coordinates
     * @returns {Point}
     */
    getScreenMovement(){
        return this.#screenPosition.offsetFrom(this.#previousPosition);
    }

    /**
     * @returns {Point}
     */
    getDocumentPosition(){
        const transformedPosition = this.drawingView.screenToDocumentPosition(this.#screenPosition);
        return transformedPosition;
    }

    /**
     * Vector between current mouse position and the previous one in document coordinates
     * @returns {Point}
     */
    getDocumentMovement(){
        const screenMovement = this.getScreenMovement()
        const documentMovement = this.drawingView.screenToDocumentPosition(screenMovement);
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

/**
 * A drag event, in addition to mouseEvent it has 
 */
class LocalDragEvent extends LocalMouseEvent{
    #downPoint = null;

    /**
     * @param {Object}      params
     * @param {Point}       params.screenPosition - where the event on the view happened in screen coordinates (in contrast to document coordinates)
     * @param {Point}       params.previousPosition
     * @param {DrawingView} params.view - needs access to point transformation methods of view.
     * @param {Point}       params.downpoint
     */
    constructor(params){
        super(params);
        if(!params.downPoint){
            throw new Error("Downpoint not passed");
        }
        this.#downPoint = params.downPoint
    }
    getMousedownScreenPosition(){
       return this.#downPoint;
    }
    getMousedownDocumentPosition(){
        const transformedPosition = this.drawingView.screenToDocumentPosition(this.#downPoint);
        return transformedPosition;
    }

    /**
     * Vector from start of drag to current mouse position, in screen coordinates
     * @returns {Point}
     */
    getScreenDragMovement(){
        const  currentScreenPosition = this.getScreenPosition()
        const  dragDistance = this.#downPoint.offsetTo(currentScreenPosition);
        return dragDistance
    }

    /**
     * Vector from start of drag to current mouse position, in document coordinates
     * @returns {Point}
     */
    getDocumentDragMovement(){
        const screenMovement = this.getScreenMovement();
        const drawingView = this.getDrawingView();
        const documentDragMovement = drawingView.screenToDocumentPosition(screenMovement);
        return documentDragMovement
    }
}

export {LocalMouseEvent, LocalDragEvent}

/**
 * NOTES:
 * - Not called "MouseEvent", since browser’s mouse Events are called that way already (https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
 */