import {ViewTransform} from './transform.js'
import {ToolManager, LoggingTool} from './tools.js'
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

    #ctx
    #transform
    #selection
    #toolManager

    /**
     * 
     * @param {RenderingContext2D } ctx 
     * @param {Drawing} drawing 
     */
    constructor(ctx,drawing){
        this.#transform = new ViewTransform();
        this.#toolManager = new ToolManager();

        //drawing
        this.#ctx = ctx;
        this.drawing = drawing;
        this.#drawAll()

        //tools
        this.#toolManager.changeTool(new LoggingTool())
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
    //
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

    //#region: event handling
    onMousedown(domMouseEvent){
        const event = new LocalMouseEvent(point,this);
        this.#toolManager.onMousedown(event);
    }

    onMousemove(point){
        const event = new LocalMouseEvent(point,this);
        this.#toolManager.onMousemove(event);
    }

    onMouseup(point){
        const event = new LocalMouseEvent(point,this);
        this.#toolManager.onMouseup(event);
    }

    onWheel(point,wheelDelta){
        const event = new LocalMouseEvent(point,this);
        this.#toolManager.onWheel(event, wheelDelta);
    }

    //#tools


}

export {DrawingView}