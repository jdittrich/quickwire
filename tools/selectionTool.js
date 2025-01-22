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
        
        //TODO:  if we want double-clickable text, we need some mechanism to trigger that.
        // maybe it is something like a sub-element that is drawable (but not another figure)
        // and knows its own rectangle, as derived from the figure it is in?

        //get handles from an already selected figure.
        const handles = this.drawingView.getHandles();
        const handleUnderPoint = handles.find(handle=> handle.enclosesPoint(currentPositionDocument))
        
        if(handleUnderPoint){
            //if we are over a handle,  keep selection, change handle
            this.#childTool = new HandleTracker(handleUnderPoint);
        } else if (figuresEnclosingPoint.length === 0){//no figures under mouse
            //if we are not over a figure, unselect and go to pan mode
            this.drawingView.clearSelection();
            this.#childTool = new PanTracker();
        } else if(figuresEnclosingPoint.length > 0){ //at least one figure under mouse
            //if we are over a figure, select and go do drag mode
            const innermostFigure = figuresEnclosingPoint[0];
            this.drawingView.select(innermostFigure);
            this.#childTool = new DragTracker(innermostFigure);
        } else {
            throw new Error("one of the above conditions should always be the case");
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
    #handleToDrag = null
    constructor(handle){
        super();
        this.#handleToDrag = handle;
    }
    // I thought of this to have clickable handles (but it won't be "to drag", it it is just clickable)
    // onMousedown(event){
    //     this.#handleToDrag.onMousedown(event);
    //     event.drawingView.updateDrawing();
    // }
    onDragstart(dragEvent){
        this.#handleToDrag.onDragstart(dragEvent)
        dragEvent.drawingView.updateDrawing();
    }
    onDrag(dragEvent){
        this.#handleToDrag.onDrag(dragEvent);
        dragEvent.drawingView.updateDrawing();
    }
    onDragend(dragEvent){
        this.#handleToDrag.onDragend(dragEvent);
        dragEvent.drawingView.updateDrawing();
    }
}

export {SelectionTool}