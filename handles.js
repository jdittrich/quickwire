
//box handle kit i.e. pass figure with a getRect and get the handles back
//should probably just be some functions: 
// createResizeCornerHandles
// createResizeSideHandles
// createAllResizeHandles

// uses relative locators: RelativeLocator.west(), to be passed to a LocatorHandle superclass

// 

import { SubclassShouldImplementError } from "./errors.js";
import { Rect, Point } from "./geom.js";
import { ResizeFigureCommand, ChangeFigureRectCommand } from "./commands/commands.js";

//for types
import { LocalDragEvent } from "./events.js";

class Handle{
    #figure
    #drawingView

    constructor(figure, drawingView){
        this.#figure = figure;
        this.#drawingView = drawingView;
    }

    // == Handle methods

    /**
     * returns point in document space
     * @returns {Point}
     */
    getLocation(){
        throw new SubclassShouldImplementError("getLocation", "Handle");
    }

    getDrawingView(){
        return this.#drawingView;
    }
    /**
     * Get the figure to which the handle belongs
     * @returns {Figure}
     */
    getFigure(){
        return this.#figure;
    }
    
    getScreenRect(){
        const size = this.getSize();
        const documentLocation = this.getLocation();
        const screenLocation = this.#drawingView.documentToScreenPosition(documentLocation);
        const {x,y} = screenLocation;
        const screenRect = new Rect({
            x: x - (size/2),
            y: y - (size/2),
            height:size,
            width:size
        }) 
        return screenRect;
    }
    /**
     * super simple color thing, maybe replace with Color type at some point
     * @returns {String}
     */
    getColor(){
        return "#40AA30";
    }

    getSize(){
        return 15;
    }
    // == figure-like methods
        
    /**
     * Draws the handle on the rendering context
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){
 
        const screenRect = this.getScreenRect();
        const {x,y,width,height} = screenRect;

        ctx.save()
        ctx.fillStyle = this.getColor();
        ctx.fillRect(
            x,
            y,
            width,
            height
        )
        ctx.restore();
    }

    /**
     * 
     * @param {Point} point (document space)
     * @returns {Boolean} - whether the point is in the handle or not 
     */
    enclosesPoint(point){
        const pointScreenPosition = this.#drawingView.documentToScreenPosition(point);
        const screenRect = this.getScreenRect();
        const isPointInsideRect = screenRect.enclosesPoint(pointScreenPosition)
        return isPointInsideRect;
    } 
    //== tool-like methods
    onDragstart(dragEvent){
        throw new SubclassShouldImplementError("onDragstart", "Handle");
    }
    onDrag(dragEvent){
        throw new SubclassShouldImplementError("onDrag", "Handle");
    }
    onDragend(dragEvent){
        throw new SubclassShouldImplementError("onDragend", "Handle");
    }
}

class ResizeHandle extends Handle{
    constructor(figure,drawingView){
        super(figure,drawingView);
    }
    createChangedRect(){
        throw new SubclassShouldImplementError("createChangedRect", "ResizeHandle");
    }
    onDragstart(dragEvent){
        dragEvent.drawingView.startPreviewOf(this.getFigure()); 
    }
    onDrag(dragEvent){
        const dragMovement = dragEvent.getDocumentDragMovement();
        const previewFigure = dragEvent.drawingView.getPreviewedFigure();
        const newRect = this.createChangedRect(dragMovement)
        previewFigure.setRect(newRect);
    }
    onDragend(dragEvent){
        dragEvent.drawingView.endPreview();

        const dragMovement = dragEvent.getDocumentDragMovement();
        const newRect = this.createChangedRect(dragMovement);

        //create command
        const resizeCommand = new ChangeFigureRectCommand({
            "figure":this.getFigure(),
            "changedRect": newRect
        },dragEvent.getDrawingView());

        dragEvent.getDrawingView().do(resizeCommand);
    }
}

class ResizeTopRightHandle extends ResizeHandle{
    constructor(figure,drawingView){
        super(figure,drawingView);
    }
    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {topRight:location} = rect.getCorners();
        return location
    }
    createChangedRect(dragDocumentMovement){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {bottomLeft,topRight} = rect.getCorners();
        const changedTopRight = topRight.add(dragDocumentMovement);
        const changedRect = Rect.createFromCornerPoints(bottomLeft,changedTopRight); 
        return changedRect;
    }
}

class ResizeBottomRightHandle extends ResizeHandle{
    constructor(figure,drawingView){
        super(figure,drawingView);
    }
    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {bottomRight:location} = rect.getCorners();
        return location;
    }
    createChangedRect(dragDocumentMovement){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {bottomRight,topLeft} = rect.getCorners();
        const changedBottomRight = bottomRight.add(dragDocumentMovement);
        const changedRect = Rect.createFromCornerPoints(topLeft,changedBottomRight); 
        return changedRect;
    }
}

class ResizeBottomLeftHandle extends ResizeHandle{
    constructor(figure,drawingView){
        super(figure,drawingView);
    }
    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {bottomLeft:location} = rect.getCorners();
        return location;
    }
    createChangedRect(dragDocumentMovement){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {topRight,bottomLeft} = rect.getCorners();
        const changedBottomLeft = bottomLeft.add(dragDocumentMovement);
        const changedRect = Rect.createFromCornerPoints(topRight,changedBottomLeft); 
        return changedRect;
    }
}

class ResizeTopLeftHandle extends ResizeHandle{
    constructor(figure,drawingView){
        super(figure,drawingView);
    }
    getLocation(){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {topLeft:location} = rect.getCorners();
        return location;
    }
    createChangedRect(dragDocumentMovement){
        const figure = this.getFigure();
        const rect = figure.getRect();
        const {topLeft,bottomRight} = rect.getCorners();
        const changedTopLeft = topLeft.add(dragDocumentMovement);
        const changedRect = Rect.createFromCornerPoints(bottomRight,changedTopLeft); 
        return changedRect;
    }
}

//to try…
function createAllResizeHandles(figure,drawingView){
    const trHandle = new ResizeTopRightHandle(figure,drawingView);
    const brHandle = new ResizeBottomRightHandle(figure,drawingView);
    const blHandle = new ResizeBottomLeftHandle(figure,drawingView);
    const tlHandle = new ResizeTopLeftHandle(figure,drawingView);
    return [brHandle,trHandle,blHandle,tlHandle];
}

export {createAllResizeHandles}