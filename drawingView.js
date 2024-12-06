import {ViewTransform} from './transform.js'
import { NoOpTool } from './tools/noopTool.js'
import {LocalMouseEvent, LocalDragEvent } from './events.js'
import {NoOpFigure} from './figures.js'
import { CommandStack } from './commands/commands.js'
import {Selection} from './selection.js';

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
    #ctx          = null; 
    #transform    = null; 
    #ctxSize      = null;
    #commandStack = null;
    #selection    = null; 
    #nameFigureClassMapper = null; 

    /**
     * 
     * @param {RenderingContext2D } ctx 
     * @param {Drawing} drawing 
     * @param {Point} size
     */

    /**
     * 
     * @param {Object} param
     * @param {RenderingContext2D}    param.ctx
     * @param {Drawing}               param.drawing
     * @param {point}                 param.ctxSize 
     * @param {NameFigureClassMapper} param.nameFigureClassMapper
     */
    constructor(param){
        const {ctx,drawing,ctxSize,nameFigureClassMapper} = param
        
        //drawing
        this.#transform = new ViewTransform();
        this.setCtxSize(ctxSize);//needed to know which area to clear on redraws
        this.#ctx = ctx;
        this.drawing = drawing;
        
        this.#nameFigureClassMapper = nameFigureClassMapper;
        this.#commandStack = new CommandStack();
        this.#selection = new Selection();
        this.changeTool(new NoOpTool())
        

        //first draw
        this.#drawAll()
    }
    setCtxSize(ctxSize){
        this.#ctxSize = ctxSize;
    }
    //#region: drawing
    updateDrawing(){
        this.#drawAll()
    }
    #drawAll(){
        this.#ctx.clearRect(0,0,this.#ctxSize.x,this.#ctxSize.y)
        this.#drawDrawing();
        this.#drawHandles();
        this.#drawPreviews();
    }
    #drawDrawing(){
        this.#ctx.setTransform(...this.#transform.toArray()); //zoom and pan
        this.drawing.draw(this.#ctx)
        this.#ctx.resetTransform(); //so the next one can deal with an untransformed canvas.
    }
    #drawHandles(){
        if(this.#dragging){return}
        const handles = this.getHandles(this);
        handles.forEach(handle=> handle.draw(this.#ctx));
    }

    //#region: previews
    #previewElement = new NoOpFigure();
    #previewedElement = null; 

    #drawPreviews(){ 
        // that probably can be sped up by entering a preview mode, triggered by the tool
        // saving the canvas state and just redrawing whats new
        this.#ctx.setTransform(...this.#transform.toArray());
        this.#previewElement.draw(this.#ctx);
        this.#ctx.resetTransform();
    }

    /**
     * @see {startPreviewOf}
     * @returns {Figure}
     */
    getPreviewedFigure(){
        return this.#previewElement;
    }
    /**
     * Use to start a preview of a figure which then can be accessed via getPreviewedFigure
     * Makes the previewed Figure invisible so it looks as if you interact with the original figure
     * @see {getPreviewedFigure}
     * @param {Figure} figureToPreview 
     */
    startPreviewOf(figureToPreview){ //puts figure in preview
        this.#previewedElement = figureToPreview;
        this.#previewElement = figureToPreview.copy(this.#nameFigureClassMapper); //like: copy(this.stringClassMapper)
        figureToPreview.setIsVisible(false);
    }

    /**
     * End the preview of a figure and make the formerly previewed Figure visible again. 
     * 
     */
    endPreview(){ //replaces preview with NOOP
        this.#previewElement = new NoOpFigure();
        this.#previewedElement.setIsVisible(true);
        this.#previewedElement = null; 
    }

    //#region: Transformations
    /**
     * @param {Point} vector 
     */
    panBy(vector){
        this.#transform.setTranslateBy(vector);
        this.#drawAll();
    }
    
    /**
     * Set zoom and point to zoom to, then update view. 
     * @param {Number} zoom factor. 1=100% zoom
     * @param {Point} point in drawingView coordinates to center the zoom on
     */
    scaleBy(factor,point){
        this.#transform.scaleByToPoint(factor, point);
        this.#drawAll();
    }

    /**
     * 
     * @returns {Number}
     */
    getScale(){
        return this.#transform.getScale()
    }

    /**
     * @returns {Point}
     */
    getPan(){
        return this.#transform.getTranslate();
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

    //#region: tool management
    #tool = null; 

    /**
     * @param {AbstractTool} any tool to change to.
    */
    changeTool(tool){
        tool.setDrawingView(this)  
        this.#tool = tool;
    }

    /**
     * returns the currently active tool.
     * @returns {AbstractTool}
     */
    getTool(){
        return this.#tool;
    }
    
    //#region: events
    #mouseDownPoint = null;
    #dragging = false; 
    #previousMousePosition = new Point({x:0,y:0});//to calculate the first difference we need *any* valid point here. 

    /**
     * @param {Point} mousePosition 
     */
    onMousedown(mousePosition){
        this.#mouseDownPoint = mousePosition;
        const localMouseEvent = new LocalMouseEvent({
            "screenPosition": mousePosition.copy(),
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
            "screenPosition": mousePosition,
            "previousPosition": this.#previousMousePosition,
            "view":this
        });

        this.#tool.onMousemove(localMouseEvent);
        
        //if a #mousedownpoint exists but it is not yet dragging…
        if(this.#mouseDownPoint){
            const localDragEvent = new LocalDragEvent({
                "screenPosition":mousePosition,
                "previousPosition":this.#previousMousePosition,
                "downPoint": this.#mouseDownPoint,
                "view":this
            });
            if(!this.#dragging){
                this.#onDragstart(localDragEvent);
                this.#onDrag(localDragEvent);
                this.#dragging = true;
            } else  {
                this.#onDrag(localDragEvent);
            }
        }
        
        this.#previousMousePosition = mousePosition.copy();
    }

    /**
     * @param {Point} mousePosition 
     */  
    onMouseup(mousePosition){
        const localMouseEvent = new LocalMouseEvent({
            "screenPosition":mousePosition.copy(),
            "previousPosition":this.#previousMousePosition.copy(),
            "view":this
        })

        //check if drag ends, and call this first.
        if(this.#mouseDownPoint && this.#dragging){
            this.#dragging = false //end drag 
            const localDragEvent = new LocalDragEvent({
                "screenPosition":mousePosition,
                "previousPosition":this.#previousMousePosition,
                "downPoint": this.#mouseDownPoint,
                "view":this
            });
            this.#onDragend(localDragEvent);
        }
        this.#tool.onMouseup(localMouseEvent)
        
        
        //resets
        this.#mouseDownPoint = null;
        this.#previousMousePosition = mousePosition.copy();
    }

    /**
     * @param {Point} mousePosition 
     * @param {Number} wheelDelta 
     */
    onWheel(mousePosition, wheelDelta){
        const localMouseEvent = new LocalMouseEvent({
            "screenPosition": mousePosition.copy(),
            "previousPosition": this.#previousMousePosition.copy(),
            "view": this
        })
        this.#tool.onWheel(localMouseEvent,wheelDelta);
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

    // #region add/remove element
    /**
     * add figures directly via code, useful for testing
     * @param {Figure} figure to be added
     */
    addFigure(figure){
        this.drawing.appendFigure(figure);
    }

    /**
     * @param {Figure} figure 
     */
    removeFigure(figure){
       figure.remove();
    }


    // createFigureFromJson(figureJson){
    //     const figureClassName = figureJson.type; 
    //     const FigureClass = this.#figureNameClassMapper(figureClassName);
    //     const figure = new FigureClass(figureJson);
    //     return figure; 
    // }

    /**
     * execute a new command and put it on stack for undoable actions
     * @param {Command} command 
     */
    do(command){
        this.#commandStack.do(command)
    }

    /**
     * @returns {Boolean}
     */
    canUndo(){
        const canUndo = this.#commandStack.canUndo();
        return canUndo;
    }

    /**
     * @returns {Boolean}
     */
    canRedo(){
        const canRedo = this.#commandStack.canRedo();
        return canRedo;
    }

    undo(){
        this.#commandStack.undo();
        this.updateDrawing();
    }
    redo(){
        this.#commandStack.redo();
        this.updateDrawing();
    }

    //#region: selection
    select(figure){
        this.#selection.select(figure);
        this.updateDrawing();
    }
    clearSelection(){
        this.#selection.clear();
        this.updateDrawing();
    }
    hasSelection(){
        const hasSelection = this.#selection.hasSelection();
        return hasSelection; 
    }
    getSelection(){
        const selection = this.#selection.getSelection();
        return selection;
    }
    
    /**
     * @returns {Handle[]} array with 0 or more handles
     */
    getHandles(){
        let handles = [];
        const selectedFigure = this.#selection.getSelection();
        if(selectedFigure){
            handles = selectedFigure.getHandles(this);
        }   
        return handles;
    }

}

export {DrawingView}