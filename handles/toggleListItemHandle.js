import { ChangeAttributeCommand } from "../commands/changeAttributeCommand.js";
import { Handle } from "./handle.js";



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
        const drawingView = this.getDrawingView();
        const screenRect = drawingView.documentToScreenRect(this.#listItemRect);
        return screenRect;  
    }
    onMousedown(mouseEvent){
        const figure = this.getFigure()
        const oldSingleSelectList = figure.getAttribute("radioButtons");
        const newSelectedIndex = this.#listItemIndex;
        const newSingleSelectList = oldSingleSelectList.copy({"selectedIndex":newSelectedIndex});
        
        const changeSelectedIndexCommand = new ChangeAttributeCommand(
            {
                figure:this.getFigure(),
                attribute:"radioButtons", 
                value:newSingleSelectList 
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