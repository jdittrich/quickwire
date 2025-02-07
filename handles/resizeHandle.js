import { Rect } from "../data/rect.js";
import { Handle } from "./handle.js";
import { ChangeFigureRectCommand } from "../commands/commands.js";


class ResizeHandle extends Handle{
    constructor(figure,drawingView){
        super(figure,drawingView);
    }
    getScreenRect(){
        const size = this.getSize();
        const documentLocation = this.getLocation();
        const drawingView = this.getDrawingView();
        const screenLocation = drawingView.documentToScreenPosition(documentLocation);
        const {x,y} = screenLocation;
        const screenRect = new Rect({
            x: x - (size/2),
            y: y - (size/2),
            height:size,
            width:size
        }) 
        return screenRect;
    }
    getLocation(){
        throw new SubclassShouldImplementError("getLocation","ResizeHandle");
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

//Helper functions to create collections of handles
/**
 * Generates standard set of resize handles 
 * @param {Figure} figure 
 * @param {DrawingView} drawingView 
 * @returns {ResizeHandle[]}
 */
function createAllResizeHandles(figure,drawingView){
    const trHandle = new ResizeTopRightHandle(figure,drawingView);
    const brHandle = new ResizeBottomRightHandle(figure,drawingView);
    const blHandle = new ResizeBottomLeftHandle(figure,drawingView);
    const tlHandle = new ResizeTopLeftHandle(figure,drawingView);
    return [brHandle,trHandle,blHandle,tlHandle];
}

export {ResizeHandle, createAllResizeHandles}