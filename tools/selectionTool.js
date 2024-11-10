import {AbstractTool} from './abstractTool.js';
import {LocalDragEvent, LocalMouseEvent} from '../events.js';
import {MoveFigureCommand} from '../commands/commands.js';

class SelectionTool extends AbstractTool{
    #childTool = null
    constructor(){
        super();
    }
    onMousedown(event){
        //are we over a figure?
        const currentPositionDocument = event.getDocumentPosition();
        const figuresEnclosingPoint = this.drawingView.drawing.findFiguresEnclosingPoint(currentPositionDocument);
        //if we are not over a figure, go to pan mode
        if(figuresEnclosingPoint.length === 0){//no figures under mouse
            this.#childTool = new PanTracker();
        } else { //if we are over a figure, go do drag mode
            const immermostFigure = figuresEnclosingPoint[0];
            this.#childTool = new DragTracker(immermostFigure);
        }
        this.#childTool.onMousedown(event);
    }
    onMousemove(event){
        //this.#childTool.onMousemove(event);
    }
    onDragstart(event){
        this.#childTool.onDragstart(event);
    }
    onDrag(event){
        this.#childTool.onDrag(event);
    }
    onDragend(event){
        this.#childTool.onDragend(event);
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

// #region: Trackers
// Trackers are child tools for other tools. They are not initialized with "changeTool" on view
// they thus do not have this.drawingView (but they can use the view from the event)

class PanTracker extends AbstractTool{
    /**
     * @param {LocalMouseEvent} event 
     */
    onDrag(event){
        const dragMovement = event.getScreenMovement();
        event.drawingView.panBy(dragMovement);
    }
}

class DragTracker extends AbstractTool{
    #figureToDrag = null;
    constructor(figureToDrag){
        super();
        this.#figureToDrag = figureToDrag;
    }
    onDragstart(event){
        event.drawingView.startPreviewOf(this.#figureToDrag); 
    }
    /**
     * @param {LocalDragEvent} event 
     */
    onDrag(event){
        const dragPreviewFigure = event.drawingView.getPreviewedFigure();
        const movement = event.getDocumentMovement();
        dragPreviewFigure.movePositionBy(movement);
        event.drawingView.updateDrawing();

    }
    onDragend(event){
        event.drawingView.endPreview()

        const drawingView = event.getDrawingView();
        const moveBy = event.getDocumentDragMovement();

        const moveCommand = new MoveFigureCommand({
            "moveBy": moveBy,
            "figure": this.#figureToDrag
        }, drawingView);
        drawingView.do(moveCommand);
        drawingView.updateDrawing();
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

export {SelectionTool}