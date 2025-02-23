import { Drawing } from "./drawing.js";
import { DrawingView } from "./drawingView.js";
import { Point } from "./data/point.js";

import { RectFigure } from "./figures/rectFigure.js";
import { ButtonFigure } from "./figures/buttonFigure.js";
import { RadioButtonListFigure } from "./figures/radioButtonListFigure.js";

import { SelectionTool } from "./tools/selectionTool.js";
import { CreateFigureTool } from "./tools/createFigureTool.js";
import {NameFigureClassMapper} from "./NameFigureClassMapper.js";
import {nameFigureClassMap} from "./nameFigureClassMap.js";
import { Toolbar} from "./app_toolbar.js";

/**
 * App is responsible for bridging between 
 * DOM events elements and native application events and drawing.
 * 
 * App communicates with drawingView, which gets the translated native interactions.
 * 
 * @see {DrawingView}   
 */
class App{
    #canvas
    #canvasCtx
    #domContainer
    #canvasContainer
    #appContainer
    #horizontalBarContainer 
    #drawing
    #drawingView

    /**
     * @param {HTMLElement} container 
     * @see  this.getLocalEventPosition
     */
    constructor(domContainer){
        //setup DOM
        this.#domContainer    = domContainer;
        
        //create app container
        this.#appContainer = document.createElement("div");
        this.#appContainer.style.margin  = "0";
        this.#appContainer.style.padding  = "0";
        this.#appContainer.style.display = "grid";
        this.#appContainer.style.width   = "100%";
        this.#appContainer.style.height  = "100%";
        this.#appContainer.style.boxSizing ="border-box"
        this.#appContainer.style.gridTemplateColumns = "32px auto";
        this.#appContainer.style.gridTemplateRows    = "auto 32px";
        this.#appContainer.style.gridTemplateAreas = '"verticalbar document" "horizontalbar horizontalbar"'
        this.#domContainer.append(this.#appContainer);
        
        this.#canvasContainer = document.createElement("div");
        this.#canvasContainer.style.margin = 0;
        this.#canvasContainer.style.padding = 0;
        this.#canvasContainer.style.boxSizing ="border-box";
        this.#canvasContainer.style.gridArea = "document";
        this.#appContainer.append(this.#canvasContainer);
        
        this.#horizontalBarContainer = document.createElement("div");
        this.#horizontalBarContainer.style.margin = 0;
        this.#horizontalBarContainer.style.padding = 0;
        this.#horizontalBarContainer.style.gridArea = "horizontalbar";
        this.#horizontalBarContainer.style.boxSizing = "border-box";
        this.#appContainer.append(this.#horizontalBarContainer);
        
        //create canvas
        this.#canvas               = document.createElement("canvas");
        this.#canvasCtx            = this.#canvas.getContext("2d");
        this.#canvas.style.padding = 0;
        this.#canvas.style.margin  = 0;
        this.#canvas.width = 800;
        this.#canvas.height = 600;
        this.#canvasContainer.append(this.#canvas);
        
        this.#canvas.addEventListener("mousedown", this.#onMousedown.bind(this));
        this.#canvas.addEventListener("mouseup"  , this.#onMouseup.bind(this));
        this.#canvas.addEventListener("mousemove", this.#onMousemove.bind(this));
        this.#canvas.addEventListener("wheel",     this.#onWheel.bind(this));
        this.#canvas.addEventListener("keydown",   this.#keydown.bind(this));
        this.#canvas.addEventListener("keyup",     this.#keyup.bind(this));
        

        //setup canvas scaling for high dpi screens

        // const canvasRect              = this.#canvasContainer.getBoundingClientRect(); // const canvasRect              = this.#canvasContainer.getBoundingClientRect(); 
        // this.#canvas.width            = canvasRect.width  * devicePixelRatio;
        // this.#canvas.height           = canvasRect.height * devicePixelRatio;
        // this.#canvas.style.width      = canvasRect.width+"px";
        // this.#canvas.style.height     = canvasRect.height+"px";
        this.#canvas.style.background = "lightgray";
        
        window.addEventListener("resize",this.#setCanvasSize.bind(this));

        this.#setCanvasSize();
        
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
        this.#horizontalBarContainer.append(this.toolbar.domElement);
        
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

    /**
     * sets canvas size in relation to its outer container and the devicePixelRatio
     * see: https://www.kirupa.com/canvas/canvas_high_dpi_retina.htm
     * needs also a mouse position shift by devicePixelRatio, see .getLocalEventPosition()
     */
    #setCanvasSize(){
        const canvas = this.#canvas;
        const canvasContainer = this.#canvasContainer;
        const canvasRect              = canvasContainer.getBoundingClientRect();
        canvas.width            = canvasRect.width  * devicePixelRatio;
        canvas.height           = canvasRect.height * devicePixelRatio;
        canvas.style.width      = canvasRect.width+"px";
        canvas.style.height     = canvasRect.height+"px";
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

    /**
     * @param {MouseEvent} mouseEvent 
     * @returns {Point}
     */
    getLocalEventPosition(mouseEvent){
        const canvasOffset = this.getCanvasOffset();
        const clientEventPos = new Point({
            "x":mouseEvent.clientX,
            "y":mouseEvent.clientY
        });
        const eventRelativeToCanvas = canvasOffset.offsetTo(clientEventPos);

        const dpiCorrectedEventPosition = new Point({
            "x": eventRelativeToCanvas.x * devicePixelRatio,
            "y": eventRelativeToCanvas.y * devicePixelRatio
        });
        
        return dpiCorrectedEventPosition;
    }
};

export {App};