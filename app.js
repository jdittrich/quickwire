import { Drawing } from "./drawing.js";
import { DrawingView } from "./drawingView.js";
import { Point } from "./data/point.js";
import { Rect } from "./data/rect.js";

import { RectFigure } from "./figures/rectFigure.js";
import { ButtonFigure } from "./figures/buttonFigure.js";
import { RadioButtonListFigure } from "./figures/radioButtonListFigure.js";

import { SelectionTool } from "./tools/selectionTool.js";
import { NoOpTool } from "./tools/noopTool.js";
import { CreateFigureTool } from "./tools/createFigureTool.js";
import {NameFigureClassMapper} from "./NameFigureClassMapper.js";
import {nameFigureClassMap} from "./nameFigureClassMap.js";
import { Toolbar, ToolbarToolButton, ToolbarActionButton, ToolbarLoadFileAsJsonButton } from "./app_toolbar.js";

class App{
    #canvas
    #canvasCtx
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
        this.#canvasCtx =  this.#canvas.getContext("2d"),
        
        this.#canvas.addEventListener("mousedown", this.#onMousedown.bind(this));
        this.#canvas.addEventListener("mouseup"  , this.#onMouseup.bind(this));
        this.#canvas.addEventListener("mousemove", this.#onMousemove.bind(this));
        
        this.#canvas.addEventListener("wheel", this.#onWheel.bind(this));

        this.#canvas.addEventListener("keydown", this.#keydown.bind(this));
        this.#canvas.addEventListener("keyup", this.#keyup.bind(this));
        
        this.#domContainer.append(this.#canvas);

        //setup canvas scaling for high dpi screens
        //see: https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm
        //needs also a mouse position shift by *devicePixelRatio, see .getLocalEventPosition()
        const canvasRect = this.#canvas.getBoundingClientRect();
        this.#canvas.width = canvasRect.width * devicePixelRatio;
        this.#canvas.height = canvasRect.height * devicePixelRatio;
        //this.#canvasCtx.scale(devicePixelRatio, devicePixelRatio);
        this.#canvas.style.width = canvasRect.width+"px";
        this.#canvas.style.height = canvasRect.height+"px";
        this.#canvas.style.background = "lightgray";
        
        
        //setup figureName to Class mapping
        
        const nameFigureClassMapper = new NameFigureClassMapper();
        nameFigureClassMapper.registerFromObject(nameFigureClassMap);

        //setup drawing view
        this.#drawing = new Drawing();
        this.#drawingView = new DrawingView(
            {
                "ctx": this.#canvasCtx,
                "ctxSize": new Point({
                    x: this.#canvas.width,
                    y: this.#canvas.height
                }),
                "drawing": this.#drawing,
                "nameFigureClassMapper": nameFigureClassMapper,
                "requestEditorText":function(message,prefillText){
                    const editedText = window.prompt(message,prefillText);

                    if(editedText===null){
                        throw new Error("Editing cancelled");
                    };
                    
                    return editedText;
                } 
            }
        );

        //tool definitions

        this.#drawingView.changeTool(new SelectionTool());

        this.toolbar = new Toolbar(this.#drawingView);
        this.#domContainer.append(this.toolbar.domElement);
        
        this.toolbar.addTool("selection", new SelectionTool(), "select, drag or change handles");
        //this.toolbar.addTool("noop", new NoOpTool(), "this tool does nothing");
        
        const rectFigureTemplate =  RectFigure.createWithDefaultParameters();
        this.toolbar.addTool("newRect", new CreateFigureTool(rectFigureTemplate),"simple rectangle");
        
        const buttonFigureTemplate = ButtonFigure.createWithDefaultParameters();
        this.toolbar.addTool("new Button", new CreateFigureTool(buttonFigureTemplate), "a button");

        const experimentFigureFigureTemplate = RadioButtonListFigure.createWithDefaultParameters();
        this.toolbar.addTool("new Radio", new CreateFigureTool(experimentFigureFigureTemplate), "RadioButtonList");
        
        this.toolbar.addAction("undo",function(drawingView){drawingView.undo()}, "undo last action");
        this.toolbar.addAction("redo",function(drawingView){drawingView.redo()}, "redo undone action");
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
        }, "download current wireframe as json");
        this.toolbar.addLoadFile("load",function(drawingView, drawingJson){
            drawingView.fromJSON(drawingJson);
        }, "create a wireframe from a json file");
        
        //for debugging
        window.drawingView = this.#drawingView;
        window.drawing = this.#drawing;
    }

    //#region: event handler
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

    //#region: Event offsets
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
            "x":mouseEvent.clientX*devicePixelRatio, //see constructor for device pixel ratio adjustments
            "y":mouseEvent.clientY*devicePixelRatio
        });

        const localPosition = canvasOffset.offsetTo(eventPosition);
        return localPosition;
    }
};

export {App};