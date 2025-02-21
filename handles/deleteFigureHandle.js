import {Handle} from "./handle.js";
import { RemoveFigureAndContainedCommand } from "../commands/removeFigureCommand.js";
import { Rect } from "../data/rect.js";

class DeleteFigureHandle extends Handle{
    #figureToDelete = null;
    #size = 16;

    /**
     * 
     * @param {Figure} figure 
     * @param {DrawingView} drawingView 
     */
    constructor(figure, drawingView){
        super(figure,drawingView)    
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){
        const {x,y,width,height} = this.getScreenRect();
        ctx.fillStyle = "red";
        ctx.fillRect(x,y,width,height);
        
        const img = new Image();
        img.src = "../static/delete_16.png";
        img.onload=function(){
            ctx.drawImage(img,x,y);
        }
        
    }
    getScreenRect(){
        const drawingView = this.getDrawingView();
        const figure = this.getFigure();
        const documentRect = figure.getRect();
        const {topRight:documentTopRight} = documentRect.getCorners();
        const screenTopRight = drawingView.documentToScreenPosition(documentTopRight);
        
        const screenRect = new Rect({
            x: screenTopRight.x + (2*this.#size),
            y: screenTopRight.y - this.#size,
            width: this.#size,
            height: this.#size
        });

        return screenRect;
    }
    onMousedown(localMouseEvent){
        const drawingView = this.getDrawingView();
        const figure = this.getFigure();
        const deleteFigureAndContainedCommand = new RemoveFigureAndContainedCommand(
            {figureToDelete:figure}
            ,drawingView
        );
        drawingView.do(deleteFigureAndContainedCommand);
    }
}

export {DeleteFigureHandle}

