import { Drawing } from "./drawing.js"
import { DrawingView } from "./drawingView.js"
import { Point } from "./geom.js"
import { LocalMouseEvent } from "./mouseEvent.js"
import { SelectionTool } from "./tools.js"

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

export {App};