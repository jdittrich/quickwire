import {AbstractTool} from './abstractTool.js';
import {LocalDragEvent, LocalMouseEvent} from '../events.js';
import {MoveFigureCommand} from '../commands/ChangeRectCommand.js';



class SelectionTool extends AbstractTool{
    #childTool = null
    constructor(){
        super();
    }

    /**
     * 
     * @param {LocalMouseEvent} event 
     */
    onMousedown(event){
        //are we over a figure?
        const currentPositionDocument = event.getDocumentPosition();
        const figuresEnclosingPoint = event.drawingView.drawing.findFiguresEnclosingPoint(currentPositionDocument);
        
        //get handles from an already selected figure.
        const handles = event.drawingView.getHandles();
        const handleUnderPoint = handles.find(handle=> handle.enclosesPoint(currentPositionDocument))
        
        if(handleUnderPoint){
            //if we are over a handle,  keep selection, change handle
            this.#childTool = new HandleTracker(handleUnderPoint);
        } else if (figuresEnclosingPoint.length === 0){//no figures under mouse
            //if we are not over a figure, unselect and go to pan mode
            event.drawingView.clearSelection();
            this.#childTool = new PanTracker();
        } else if(figuresEnclosingPoint.length > 0){ //at least one figure under mouse
            //if we are over a figure, select and go do drag mode
            const innermostFigure = figuresEnclosingPoint[0];
            event.drawingView.select(innermostFigure);
            this.#childTool = new DragTracker(innermostFigure);
        } else {
            throw new Error("one of the above conditions should always be the case");
        }

        this.#childTool.onMousedown(event);
    }
    onMousemove(event){
        // check if you are dragging. If yes, do nothing.
        // Check what you are over
        // elementYouAreOver.getRect()
        // drawRectOnTop();
        
        // use https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#pre-render_similar_primitives_or_repeating_objects_on_an_offscreen_canvas
        
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
        event.drawingView.scaleBy(changeFactor,screenPosition);
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
    onMousedown(event){
        this.#handleToDrag.onMousedown(event);
        event.drawingView.updateDrawing();
    }
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