import { Drawing } from "./drawing.js"
import { DrawingView } from "./drawingView.js"
import { Point } from "./geom.js"
import { RectFigure } from "./figures.js"
import { LocalMouseEvent } from "./events.js"
//import { SelectionTool, NoOpTool, CreateElementTool } from "./tools.js"
import { SelectionTool } from "./tools/selectionTool.js";
import { NoOpTool } from "./tools/noopTool.js";
import { CreateElementTool } from "./tools/createElementTool.js";

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

        
        //setup drawing view
        this.#drawing = new Drawing();
        this.#drawingView = new DrawingView(
            this.#canvas.getContext("2d"),
            this.#drawing,
            new Point({
                x:this.#canvas.width,
                y:this.#canvas.height
            })
        );

        this.#drawingView.changeTool(new SelectionTool())

        this.toolbar = new Toolbar(this.#drawingView);
        this.#domContainer.append(this.toolbar.domElement);
        this.toolbar.addTool("selection", new SelectionTool());
        this.toolbar.addTool("noop", new NoOpTool());
        const rectFigureTemplate = new RectFigure({"x":0,"y":0,"width":10,"height":10});
        this.toolbar.addTool("newRect", new CreateElementTool(rectFigureTemplate));
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
        const button = new ToolbarButton(label, tool,this.drawingView)
        this.domElement.append(button.domElement);
    }
}

class ToolbarButton{
    domElement = null;
    constructor(label, tool, view){
        const changeTool = function(){
            view.changeTool(tool)
        }
        const htmlButton = document.createElement("button");
        htmlButton.innerText = label;
        htmlButton.className = "qwToolbarButton"
        htmlButton.addEventListener("click",changeTool,false)
        this.domElement = htmlButton;
    }
}

export {App};