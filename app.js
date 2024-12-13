import { Drawing } from "./drawing.js"
import { DrawingView } from "./drawingView.js"
import { Point } from "./geom.js"
import { RectFigure, ButtonFigure } from "./figures.js"
import { LocalMouseEvent } from "./events.js"
//import { SelectionTool, NoOpTool, CreateElementTool } from "./tools.js"
import { SelectionTool } from "./tools/selectionTool.js";
import { NoOpTool } from "./tools/noopTool.js";
import { CreateFigureTool } from "./tools/createFigureTool.js";
import {NameFigureClassMapper} from "./NameFigureClassMapper.js";
import {nameFigureClassMap} from "./nameFigureClassMap.js"

class App{
    #canvas
    #domContainer
    #drawing
    #drawingView
    /**
     * 
     * @param {HTMLElement} container 
     */
    constructor(domContainer){
        //setup DOM
        this.#domContainer = domContainer;
        this.#canvas = document.createElement("canvas");
        
        this.#canvas.addEventListener("mousedown", this.#onMousedown.bind(this));
        this.#canvas.addEventListener("mouseup"  , this.#onMouseup.bind(this));
        this.#canvas.addEventListener("mousemove", this.#onMousemove.bind(this));
        
        this.#canvas.addEventListener("wheel", this.#onWheel.bind(this));

        this.#canvas.addEventListener("keydown", this.#keydown.bind(this));
        this.#canvas.addEventListener("keyup", this.#keyup.bind(this));
        
        this.#domContainer.append(this.#canvas);
        
        //setup figureName to Class mapping
        
        const nameFigureClassMapper = new NameFigureClassMapper();
        nameFigureClassMapper.registerFromObject(nameFigureClassMap);

        //setup drawing view
        this.#drawing = new Drawing();
        this.#drawingView = new DrawingView(
            {
                "ctx":this.#canvas.getContext("2d"),
                "ctxSize": new Point({
                    x:this.#canvas.width,
                    y:this.#canvas.height
                }),
                "drawing":this.#drawing,
                "nameFigureClassMapper":nameFigureClassMapper
            }
        );

        this.#drawingView.changeTool(new SelectionTool())

        this.toolbar = new Toolbar(this.#drawingView);
        this.#domContainer.append(this.toolbar.domElement);
        
        this.toolbar.addTool("selection", new SelectionTool());
        this.toolbar.addTool("noop", new NoOpTool());
        
        const rectFigureTemplate = new RectFigure({"x":0,"y":0,"width":10,"height":10});
        this.toolbar.addTool("newRect", new CreateFigureTool(rectFigureTemplate));
        
        const buttonFigureTemplate = new ButtonFigure({"x":0,"y":0,"width":10,"height":10,"label":"OK"}) 
        this.toolbar.addTool("new Button", new CreateFigureTool(buttonFigureTemplate));
        
        this.toolbar.addAction("undo",function(drawingView){drawingView.undo()});
        this.toolbar.addAction("redo",function(drawingView){drawingView.redo()});
        this.toolbar.addAction("save",function(){alert("jan, program this save action!")});
        this.toolbar.addLoadFile("load",function(drawingView, event){
            //probably refactor this out to: getJSONFromEvent() or similar
            //guards
            if(event.target.files === undefined) {return};
            if(!event.target.files[0].type.match('text.*')){
                console.log("not a text file");
                return;
            }
            var reader = new FileReader();
            reader.readAsText(event.target.files[0]);
            reader.onload = function (event) {
                alert("jan, you need to program more here")
                console.log(event)
            }

        });
        
        //for debugging
        window.drawingView = this.#drawingView;
        window.drawing = this.#drawing;
    }

    #onMousedown(e){
        let eventPosRelativeToCanvas = this.getLocalEventPosition(e);
        this.#drawingView.onMousedown(eventPosRelativeToCanvas);
    }
    #onMouseup(e){
        let eventPosRelativeToCanvas = this.getLocalEventPosition(e);
        this.#drawingView.onMouseup(eventPosRelativeToCanvas);
    }
    #onMousemove(e){
        let eventPosRelativeToCanvas = this.getLocalEventPosition(e);
        this.#drawingView.onMousemove(eventPosRelativeToCanvas);
    }
    
    #onWheel(e){
       e.preventDefault();//otherwise everything browser-zooms in addition!

       let eventPosRelativeToCanvas = this.getLocalEventPosition(e);
        
       //Normalize to -1 (wheel moved to user), +1 (wheel moved from user) 
       let wheelDelta = e.wheelDeltaY > 0 ? 1:-1;   
       this.#drawingView.onWheel(eventPosRelativeToCanvas, wheelDelta)
    }

    #keydown(e){

    }
    #keyup(e){

    }

    /**
     * get the offset of canvas-position to the client’s origin coordinates
     * 
     * return {Point}
     */
    getCanvasOffset(){
        const canvasRelativeToClient = this.#canvas.getBoundingClientRect();

        const offset = new Point({
            x:canvasRelativeToClient.left,
            y:canvasRelativeToClient.top
        });

        return offset;
    }

    getLocalEventPosition(mouseEvent){
        const canvasOffset = this.getCanvasOffset();
        const eventPosition = new Point({
            "x":mouseEvent.clientX,
            "y":mouseEvent.clientY
        });

        const localPosition = canvasOffset.offsetTo(eventPosition);
        return localPosition;
    }
}


class Toolbar{
    domElement = null; 

    constructor(drawingView){
        console.log("toolbar initialized")
        this.domElement = document.createElement("div");
        this.domElement.className = "qwToolbar"
        this.drawingView = drawingView;
    }
    addTool(label, tool){
        const button = new ToolbarToolButton(label, this.drawingView, tool);
        this.domElement.append(button.domElement);
    }
    addAction(label,callback){
        const button = new ToolbarActionButton(label, this.drawingView, callback);
        this.domElement.append(button.domElement);
    }
    addLoadFile(label,callback){
        const button = new ToolbarLoadFileButton(label, this.drawingView, callback);
        this.domElement.append(button.domElement);
    }
}

class ToolbarButton{
    domElement = null;
    constructor(label){
        
        const htmlButton = document.createElement("input");
        htmlButton.setAttribute("type","button");
        htmlButton.setAttribute("value",label);
        htmlButton.className = "qwToolbarButton";
        htmlButton.style = "margin-right:2px; height:1.8rem";
        this.domElement = htmlButton;
    }
}   

class ToolbarToolButton extends ToolbarButton{
    constructor(label, drawingView, tool){
        super(label);
        
        const changeTool = function(){
            drawingView.changeTool(tool)
        }
        this.domElement.addEventListener("click", changeTool,false);
    }

}

class ToolbarActionButton extends ToolbarButton{
    constructor(label, drawingView, callback){
        super(label);
        const callAction = function(){
            callback(drawingView)
        }
        this.domElement.addEventListener("click", callAction,false);
    }
}

class ToolbarLoadFileButton extends ToolbarButton{
    constructor(label, drawingView, callback){
        super(label);
        this.domElement.setAttribute("type","file");
        const callAction = function(event){
            callback(drawingView, event)
        }
        this.domElement.addEventListener("change", callAction,false);
    }
}

export {App};