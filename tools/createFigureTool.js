import { AbstractTool } from "./abstractTool.js";
import { CreateFigureCommand } from "../commands/commands.js";

//Adds an element to the drawing
//TODO: 
// - Add the element via command. 
class CreateFigureTool extends AbstractTool{
    #figureToCreate = null;
    #previewFigure = null;
    /**
     * @param {AbstractFigure} figure - that is to be created in the drawing
     */
    constructor(figureToCreate){
        super();
        const frozenFigure = Object.freeze(figureToCreate);
        this.#figureToCreate = frozenFigure;
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
        const documentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        
        const createFigureCommand = new CreateFigureCommand(
            {
                "newFigurePrototype": this.#figureToCreate,
                "cornerPoint1":       documentMousePoint,
                "cornerPoint2":       documentMouseDownPoint,
            },
            this.drawingView
        );
        //do the thing
        this.drawingView.do(createFigureCommand);
        
        //cleanup
        this.#previewFigure = null;
        this.drawingView.endPreview();
    }
}

export {CreateFigureTool}