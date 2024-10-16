import {ViewTransform} from './transform.js'
import {ToolManager, LoggingTool, NoOpTool} from './tools.js'
import { LocalMouseEvent } from './mouseEvent.js'


//used as types
import { Drawing } from './drawing.js'
import {Point} from './geom.js'

/**
 * Does: 
 * – manage repainting
 * 
 * Knows: 
 * – drawing (i.e. the document)
 * 
 * has: 
 *  selection
 *  tool
 * 
 *  transform 
 *  zoom
 *  pan 
 */
class DrawingView{
    //private properties used in constructor
    #ctx
    #transform

    /**
     * 
     * @param {RenderingContext2D } ctx 
     * @param {Drawing} drawing 
     */
    constructor(ctx,drawing){
        this.#transform = new ViewTransform();
        //this.#toolManager = new ToolManager();

        //drawing
        this.#ctx = ctx;
        this.drawing = drawing;
        this.#drawAll()

        //tools
        this.changeTool(new NoOpTool())
    }

    //#region: drawing
    updateDrawing(){
        this.#drawAll()
    }
    #drawAll(){
        this.#drawDrawing();
        this.#drawHandles();
    }
    #drawDrawing(){
        this.#ctx.setTransform(...this.#transform.toArray()); //zoom and pan
        this.drawing.draw(this.#ctx)
        this.#ctx.resetTransform(); //so the next one can deal with an untransformed canvas.
    }
    #drawHandles(){
        this.#ctx.fillText("drawingHandlesWorks", 10,10);
    }

    //#region: Transformations
    /**
     * @param {Point} vector 
     */
    pan(vector){
        this.#transform.setTranslateBy(vector)
        this.#drawAll()
    }
    
    /**
     * Set zoom and point to zoom to, then update view. 
     * @param {Number} zoom factor. 1=100% zoom
     * @param {Point} point in drawingView coordinates to center the zoom on
     */
    zoom(factor,point){
        this.#transform.setScaleToPoint(factor, point);
        this.drawAll();
    }
    
    /**
     * Answers the question: What coordinates does this point in the panned-and-zoomed view have in the drawing?
     * @param {Point} point a point in screen coordinates relative to the drawingView
     * @returns {Point} point in drawing coordinates
     */
    screenToDocumentPosition(point){
        const pointInDocument = this.#transform.untransformPoint(point);
        return pointInDocument;
    }

    /**
     * Answers the question: Where does this point in the drawing land on the panned-and-zoomed view?
     * @param {Point} point in drawing coordinates
     * @returns {Point} in screen coordinates relative to the drawingView 
     */
    documentToScreenPosition(point){
        const pointOnScreen = this.#transform.transformPoint(point);
        return pointOnScreen;
    }

    // region: tool management
    #tool = null; 
    /**
     * @param {AbstractTool} any tool to change to.
    */
    changeTool(tool){
       tool.setToolManager(this)  
       this.#tool = tool;
    }
    
    //#region: events
    #mouseDownPoint = null;
    #dragging = false; 
    #previousMousePosition = null;

    /**
     * @param {Point} mousePosition 
     */
    onMousedown(mousePosition){
        this.#mouseDownPoint = mousePosition;
        const localMouseEvent = new LocalMouseEvent({
            "position": mousePosition.copy(),
            "previousPosition": this.#previousMousePosition.copy(),
            "view": this
        })
        this.#tool.onMousedown(localMouseEvent);
        this.#previousMousePosition = mousePosition.copy();
    }
    
    /**
    * Calls mousemove, then tests if this is a dragstart or dragmove and calls none or one of them if needed.
    * @param {Point} mousePosition
    */
    onMousemove(mousePosition){ 
        const localMouseEvent = new LocalMouseEvent({
            "position":mousePosition.copy(),
            "previousPosition":this.#previousMousePosition.copy(),
            "view":this
        }) 

        this.#tool.onMousemove(localMouseEvent);

        //if a #mousedownpoint exists but it is not yet dragging…
        if(this.#mouseDownPoint && !this.#dragging){
            this.#onDragstart(localMouseEvent, this.#mouseDownPoint)
            this.#dragging = true;
        }
        //if a #mousedownpoint exists and we drag already
        if(this.#mouseDownPoint && this.#dragging){
            this.#onDrag(localMouseEvent, this.#mouseDownPoint);
        }

        this.#previousMousePosition = mousePosition.copy();
    }

    /**
     * @param {Point} mousePosition 
     */  
    onMouseup(mousePosition){
        const localMouseEvent = new LocalMouseEvent({
            "position":mousePosition.copy(),
            "previousPosition":this.#previousMousePosition.copy(),
            "view":this
        })

        //check if drag ends, and call this first.
        if(this.#mouseDownPoint && this.#dragging){ 
            this.#onDragend(localMouseEvent, this.#mouseDownPoint);
        }
        this.#tool.onMouseup(localMouseEvent)
        
        //resets
        this.#mouseDownPoint = null;
        this.#dragging = false
        this.#previousMousePosition = mousePosition.copy();
    }

    /**
     * @param {Point} mousePosition 
     * @param {Number} wheelDifference 
     */
    onWheel(mousePosition, wheelDifference){
        const localMouseEvent = new LocalMouseEvent({
            "position": mousePosition.copy(),
            "previousPosition": this.#previousMousePosition.copy(),
            "view": this
        })
        this.#tool.onWheel(mouseEvent,wheelDifference);
        this.#previousMousePosition = mousePosition.copy();
    }
    
    //the drag events are automatically called from mousemove and mouseup
    //thus, they are private and not to be called from outside directly. 

    /**
     * @param {LocalMouseEvent} mouseEvent 
     * @param {Point} mouseDownPoint 
     */
    #onDragstart(mouseEvent, mouseDownPoint){
        this.#tool.onDragstart(mouseEvent, mouseDownPoint)
    }
    
    /**
     * @param {LocalMouseEvent} mouseEvent 
     * @param {Point} mouseDownPoint 
     */
    #onDrag(mouseEvent, mouseDownPoint){
        this.#tool.onDrag(mouseEvent,mouseDownPoint)
    }

    /**
     * @param {LocalMouseEvent} mouseEvent 
     * @param {Point} mouseDownPoint 
     */
    #onDragend(mouseEvent, mouseDownPoint){
        this.#tool.onDragend(mouseEvent, mouseDownPoint)
    }
}

export {DrawingView}