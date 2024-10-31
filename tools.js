/**
 * Tool manager allows to change tools and passes events to the event handlers of the currently active tool.
 * It uses the state design pattern.
 * 
 * Any tool gets a mouseEvent passed. This is not the browser based mouse event, but a custom event, 
 * usually created and passed from the document’s controller.
 */

//for types
import { DrawingView } from './drawingView.js';
import {LocalDragEvent, LocalMouseEvent} from './mouseEvent.js'


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
//TODO: 
// - First create an element that only previews
// - Add the element directly
// - Add the element via command. 
class CreateElementTool extends AbstractTool{
    #figureToCreate = null;
    #previewFigure = null;
    /**
     * @param {AbstractFigure} figure - that is to be created in the drawing
     */
    constructor(figureToCreate){
        super();
        this.#figureToCreate = figureToCreate;
    }
    /**
     * 
     * @param {LocalMouseEvent} event 
     * @param {Point} mouseDownPoint 
     */
    onDragstart(event,mouseDownPoint){
        //WIP
        //create the element, size is 
        this.#previewFigure = this.#figureToCreate.copy();
        this.drawingView.startPreviewOf(this.#previewFigure);
    }
    /**
     * @param {LocalDragEvent} event 
     */
    onDrag(event){ 
        const currentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        this.#previewFigure.setRectByPoints(documentMouseDownPoint,currentMousePoint);
        this.drawingView.updateDrawing();
    }
    /**
     * 
     * @param {LocalMouseEvent} event 
     * @param {Point} mouseDownPoint 
     */
    onDragend(event){
        //or I only append to view() and it automatically appends to the right things?
        const newFigure = this.#figureToCreate.copy();
        const currentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        newFigure.setRectByPoints(currentMousePoint, documentMouseDownPoint); 
        
        //call this when you want to append a figure anywhere, it figures out where to drop it?
        this.drawingView.addFigure(newFigure);
        
        //cleanup
        this.#previewFigure = null;
        this.drawingView.endPreview();
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
    onDragend(event,downpoint){
        // const moveCommand = new moveFigureCommand(FigureToMove,newPosition);
        // this.drawingView.execute(newMoveCommand);
    }
}

class HandleTracker extends AbstractTool{
    #handle 
    constructor(handle){
        super();
        this.#handle = handle
    }

    //figure.rectByPoints(… …)
}

export {LoggingTool, NoOpTool, SelectionTool, CreateElementTool}
