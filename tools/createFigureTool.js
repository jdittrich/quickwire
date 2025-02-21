import { AbstractTool } from "./abstractTool.js";
import { CreateFigureCommand } from "../commands/CreateFigureCommand.js";
import { SelectionTool } from "./selectionTool.js";

//Adds an element to the drawing
class CreateFigureTool extends AbstractTool{
    #figureToCreate = null;

    /**
     * @param {AbstractFigure} figure - that is to be created in the drawing
     */
    constructor(figureToCreate){
        super();
        const frozenFigure = Object.freeze(figureToCreate); //so we don't accidentally mess with the figure. 
        this.#figureToCreate = frozenFigure;
    }
    /**
     * 
     * @param {LocalMouseEvent} event
     * @param {Point} mouseDownPoint 
     */
    onDragstart(event,mouseDownPoint){
        event.drawingView.startPreviewOf(this.#figureToCreate);
    }
    /**
     * @param {LocalDragEvent} event 
     */
    onDrag(event){ 
        const currentMousePoint = event.getDocumentPosition(); 
        const documentMouseDownPoint = event.getMousedownDocumentPosition();
        const previewedFigure = event.drawingView.getPreviewedFigure();
        previewedFigure.setRectByPoints(documentMouseDownPoint,currentMousePoint);
        event.drawingView.updateDrawing();
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
            event.drawingView
        );
        //do the thing
        event.drawingView.do(createFigureCommand);
        
        //cleanup
        event.drawingView.endPreview();
        event.drawingView.changeTool(new SelectionTool());
    }
}

export {CreateFigureTool}