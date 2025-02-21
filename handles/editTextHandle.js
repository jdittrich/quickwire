// WIP: A handle to edit text on click
// handle is created with a reference to the attribute name of the text 
// click requests a text editor at a cerntain position on document from drawing view (calculates screen position), 
// which requests from app. 
// on finishing the editing, it hands over the new text to drawingView which hands to handle
// handle triggers a changeParameter command 

import {ChangeAttributeCommand} from "../commands/changeAttributeCommand.js";
import {Handle} from "./handle.js";
import {Rect} from "../data/rect.js";
import {Point} from "../data/point.js";


class EditTextHandle extends Handle {
    #attributeName
    #textRect
    #size = 16;
    
    /**
     * 
     * @param {object} param
     * @param {String} params.attributeName
     * @param {Rect}   param.textRect
     * @param {Figure} figure 
     * @param {drawingView} drawingView 
     */
    constructor(figure, drawingView,param){
        super(figure, drawingView);
        this.#attributeName = param.attributeName;
        this.#textRect = param.textRect;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){ 
        const {x,y,width,height} = this.getScreenRect();
        ctx.fillStyle = "#DDD";
        ctx.fillRect(x,y,width,height);
        
        const img = new Image();
        img.src = "../static/text_16.png";
        img.onload=function(){
            ctx.drawImage(img,x,y);
        }
    }

    /**
     * @returns {Rect} the coordinates of the handle on screen
     */
    getScreenRect(){
        const textRect = this.#textRect;
        const drawingView = this.getDrawingView();
        const {topRight} = textRect.getCorners();
        const drawAnchor = topRight.add(new Point({x:2, y:0}));        
        const drawAnchorScreen = drawingView.documentToScreenPosition(drawAnchor);
        const screenRect = Rect.createFromCornerPoints(
            drawAnchorScreen,
            new Point({
                x: drawAnchorScreen.x + this.#size,
                y: drawAnchorScreen.y - this.#size
            })
        );
        return screenRect;
    }

    /**
     * 
     * @param {LocalMouseEvent} mouseEvent 
     */
    onMousedown(mouseEvent){
        const drawingView = this.getDrawingView();
        const figure      = this.getFigure();
        const currentText = figure.getAttribute(this.#attributeName);
        let newText = ""
        try{
            newText = drawingView.requestEditorText("Edit label",currentText);
        } catch {
            return;
        }
        const changeTextCommand = new ChangeAttributeCommand(
            {   
                figure:figure,
                attribute: this.#attributeName,
                value: newText
            },
            drawingView
        )
        drawingView.do(changeTextCommand);
    }
}

export {EditTextHandle}