import { ChangeAttributeCommand } from "../commands/ChangeAttributeCommand.js";
import { Rect }   from "../data/rect.js";
import { Handle } from "./handle.js";

/**
 * Helper to transform a rect, defined in document coordinates 
 * to untransformed screen coordinates.
 * 
 * @param   {Rect} documentRect 
 * @param   {DrawingView} drawingView
 * @returns {Rect} 
 */
function documentToScreenRect(documentRect,drawingView){
    const {topLeft,bottomRight} = documentRect.getCorners();
    const screenTopLeft     = drawingView.documentToScreenPosition(topLeft);
    const screenBottomRight = drawingView.documentToScreenPosition(bottomRight);
    const screenRect = Rect.createFromCornerPoints(screenTopLeft, screenBottomRight);
    return screenRect; 
}

class ToggleListItemHandle extends Handle{
    #listItemRect
    #listItemIndex

    constructor(figure,drawingView,listItemRect,listItemindex){
        //always needs a figure (to be changed) and the drawingView (to access the command structure)
        super(figure,drawingView);
        this.#listItemIndex = listItemindex;
        this.#listItemRect = listItemRect;
    }
    draw(ctx){         
        const {x,y,width,height} = this.getScreenRect();
        ctx.save();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "green";
        ctx.strokeRect(x,y,width,height);
        ctx.restore();
    }
    getScreenRect(){
        const screenRect = documentToScreenRect(this.#listItemRect,this.getDrawingView())
        return screenRect;  
    }
    onMousedown(mouseEvent){
        const changeSelectedIndexCommand = new ChangeAttributeCommand(
            {
                figure:this.getFigure(),
                attribute:"indexOfSelectedLabel",
                value:this.#listItemIndex
            },
            this.drawingView
        )

        this.getDrawingView().do(changeSelectedIndexCommand)
    }
}

/** 
 * @param   {ListFigure} listFigure
 * @param   {DrawingView} drawingView
 * @returns {ListEntryToggleHandle[]} 
 */
function createListItemToggleHandles(listFigure, drawingView){
    const listEntryRects = listFigure.getListEntryRects();
    const toggleHandles = listEntryRects.map((rect,index) => new ToggleListItemHandle(listFigure,drawingView,rect,index));
    return toggleHandles;
};

export {ToggleListItemHandle, createListItemToggleHandles}