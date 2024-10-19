/**
 * Tool manager allows to change tools and passes events to the event handlers of the currently active tool.
 * It uses the state design pattern.
 * 
 * Any tool gets a mouseEvent passed. This is not the browser based mouse event, but a custom event, 
 * usually created and passed from the document’s controller.
 */

//for types
import { DrawingView } from './drawingView.js';
import {LocalMouseEvent} from './mouseEvent.js'


/**
 * Abstract class that tools can extend
 *  
 * - provides every tool with a setView method, which a drawingView.changeTool calls when changing tools
 * - provides empty methods to handle events. Overwrite in extending class to enable your tool to react to these events.
 */
class AbstractTool{
    constructor(){}
    /**
     * Internal use only. Counterpart to toolManager’s change tool; this way, 
     * Every tool "knows" the view, so it can use it to change to another tool
     * @param {DrawingView} drawingView
     * @see: DrawingView
     */
    setDrawingView(drawingView){ 
        this.drawingView = drawingView;
    } 
    onKeydown(){}
    
    onKeyup(){}
    
    /**
     * @param {LocalMouseEvent} mouseEvent 
     */
    onMousedown(mouseEvent){}
    
    /**
     * @param {LocalMouseEvent} mouseEvent 
     */
    onMousemove(mouseEvent){}

    /**
     * @param {LocalMouseEvent} mouseEvent 
     */
    onMouseup(mouseEvent){}

    /**
     * @param {LocalMouseEvent} mouseEvent 
     * @param {Point} downpoint 
     */
    onDrag(mouseEvent,downpoint){ }
    
    /**
     * @param {LocalMouseEvent} mouseEvent 
     * @param {Point} downpoint 
     */
    onDragstart(mouseEvent,downpoint){}
    
    /**
     * @param {LocalMouseEvent} mouseEvent 
     * @param {Point} downpoint 
     */
    onDragend(mouseEvent,downpoint){}
    
    onWheel(mouseEvent,wheelDelta){}
}

/**
 * Simple logging tool for down and up events
 */
class LoggingTool extends AbstractTool{
    constructor(){
        super();
    }
    onMousedown(mouseEvent){
        console.log("mousedown", mouseEvent)
    }
    
    onMouseup(mouseEvent){
        console.log("mouseup", mouseEvent)
    }

    onDragstart(mouseEvent, mouseDownPoint){
        console.log("dragstart", mouseEvent)
    }
    
    onDragend(mouseEvent, mouseDownPoint){
        console.log("dragend", mouseEvent)
    }

    onWheel(mouseEvent, wheelDelta){
        console.log("wheelDelta",wheelDelta);
    }
}

/**
 * A tool that does nothing, but is a valid tool (NoOp = no operations) 
 */
class NoOpTool extends AbstractTool{
    constructor(){
        super()
    }
}

class SelectionTool extends AbstractTool{
    #childTool = null
    constructor(){
        super();
    }
    onMousedown(event){
        this.#childTool = new PanTracker();
        this.#childTool.onMousedown(event);
    }
    onDrag(event){
        this.#childTool.onDrag(event);
    }
    onMouseup(event){
        this.#childTool = null; 
    }
    onWheel(event,wheelDelta){
        const changeFactor = (wheelDelta>0) ? 0.8:1.2; 
        const screenPosition = event.getScreenPosition()
        this.drawingView.scaleBy(changeFactor,screenPosition);
    }
}

//Adds an element to the drawing
class AddElementTool{
    #elementToCreate = null;
    /**
     * @param {AbstractFigure} figure - that is to be created in the drawing
     */
    constructor(figure){
        console.log("addElementToolCreated")
    }
    onDragStart(event){
        //create the element
    }
    onDrag(event){
        
    }
    onMouseup(event){
        
    }
}

// #region: Trackers
// Trackers are child tools for other tools. They are not initialized with "changeTool" on view
// they thus do not have this.drawingView (but they can use the view from the event)

class PanTracker extends AbstractTool{
    /**
     * 
     * @param {LocalMouseEvent} event 
     */
    onDrag(event){
        const dragMovement = event.getScreenMovement();
        event.drawingView.panBy(dragMovement);
    }
}

class DragTracker extends AbstractTool{
  
}

class HandleTracker extends AbstractTool{
    #handle 
    constructor(handle){
        super();
        this.#handle = handle
    }
}

export {LoggingTool, NoOpTool, SelectionTool}
