import { AbstractTool } from "./abstractTool.js";
import {LocalDragEvent, LocalMouseEvent} from '../events.js'

//Adds an element to the drawing
//TODO: 
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
        this.drawingView.startPreviewOf(this.#figureToCreate);
    }
    /**
     * @param {LocalDragEvent} event 
     */
    onDrag(event){ 
        const currentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        const previewedFigure = this.drawingView.getPreviewedFigure();
        previewedFigure.setRectByPoints(documentMouseDownPoint,currentMousePoint);
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

export {CreateElementTool}