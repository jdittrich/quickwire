import { Drawing } from "./drawing.js"
import { DrawingView } from "./drawingView.js"
import { Point } from "./geom.js"
import { LocalMouseEvent } from "./mouseEvent.js"
import { ToolManager } from "./tools.js"

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
            this.#drawing
        );
    }

    #onMousedown(e){
        let eventPosRelativeToCanvas = this.getCanvasOffset();
        let localEvent = LocalMouseEvent.domMouseEventAdapter(e,this.#drawingView,eventPosRelativeToCanvas);
        this.#drawingView.onMousedown(localEvent);
    }
    #onMouseup(e){
        let eventPosRelativeToCanvas = this.getCanvasOffset();
        let localEvent = LocalMouseEvent.domMouseEventAdapter(e,this.#drawingView,eventPosRelativeToCanvas);
        this.#drawingView.onMouseup(localEvent);
    }
    #onMousemove(e){
        let eventPosRelativeToCanvas = this.getCanvasOffset();
        let localEvent = LocalMouseEvent.domMouseEventAdapter(e,this.#drawingView,eventPosRelativeToCanvas);
        this.#drawingView.onMousemove(localEvent);
    }
    
    #onWheel(e){
       let eventPosRelativeToCanvas = this.getCanvasEventCoordinates(e)
       let wheelDelta = e.wheelDeltaY; 
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

}

export {App};