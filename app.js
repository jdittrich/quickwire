import { Drawing } from "./drawing.js"
import { DrawingView } from "./drawingView.js"
import { Point } from "./geom.js"
import { RectFigure, ButtonFigure, ExperimentFigure } from "./figures.js"
import { SelectionTool } from "./tools/selectionTool.js";
import { NoOpTool } from "./tools/noopTool.js";
import { CreateFigureTool } from "./tools/createFigureTool.js";
import {NameFigureClassMapper} from "./NameFigureClassMapper.js";
import {nameFigureClassMap} from "./nameFigureClassMap.js";
import { Toolbar, ToolbarToolButton, ToolbarActionButton, ToolbarLoadFileAsJsonButton } from "./app_toolbar.js";

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
        
        const buttonFigureTemplate = new ButtonFigure({"x":0,"y":0,"width":10,"height":10,"label":"OK"});
        this.toolbar.addTool("new Button", new CreateFigureTool(buttonFigureTemplate));

        const experimentFigureFigureTemplate = new ExperimentFigure({"x":0,"y":0,"width":10,"height":10});
        this.toolbar.addTool("new exFig", new CreateFigureTool(experimentFigureFigureTemplate), "experimental Figure for… experiments");
        
        this.toolbar.addAction("undo",function(drawingView){drawingView.undo()});
        this.toolbar.addAction("redo",function(drawingView){drawingView.redo()});
        this.toolbar.addAction("save",function(drawingView){
            //getJSON and convert to string
            const drawingJson = drawingView.toJSON();
            const drawingJsonAsString = JSON.stringify(drawingJson);

            // create text file blob
            const drawingFileBlob = new Blob([drawingJsonAsString], {type: "application/json"});

            //create a link to the file blob
            const fileUrl = URL.createObjectURL(drawingFileBlob);

            //create link
            const link = document.createElement("a");
            link.href = fileUrl;
            link.download = "quickWireDrawing.json";
            
            // "click" link to trigger "download"
            link.click();

            //free memory again
            URL.revokeObjectURL(fileUrl);
        });
        this.toolbar.addLoadFile("load",function(drawingView, drawingJson){
            drawingView.fromJSON(drawingJson);
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

// a little in-line text editor to change lables
class AppTextEditor{
    domElement = null; 

    #domInputField = null; 
    #domOkButton = null; 
    #domCancelButton = null; 

    #figure = null;

    constructor(){

    }
    removeEditor(){

    }
    commitChange(){

    }
    cancelChange(){

    }
}

export {App};