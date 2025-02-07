import { Figure } from "./figure.js";
import { createAllResizeHandles } from '../handles/resizeHandle.js';

class ButtonFigure extends Figure{
    figureType = "ButtonFigure";
    #buttonLabel = null;

    constructor(param){
        super(param);
        this.#buttonLabel = param.label;
    }

    changeLabel(changedLabel){
        this.#buttonLabel =changedLabel;
    }
    getLabel(){
        return this.#buttonLabel;
    }

    drawFigure(ctx){
        const rect = this.getRect();
        const {width,height,x,y} = rect;
        const center = rect.getCenter();
        
        ctx.strokeRect(x,y,width,height);

        //place label in center, use text width and height to find place of center
        const metrics = ctx.measureText(this.#buttonLabel);
        const labelY = center.y + ((metrics.hangingBaseline-metrics.ideographicBaseline)/2);
        const labelX = center.x - (metrics.width/2);
        ctx.fillText(this.#buttonLabel, labelX, labelY);
    }

    
    getHandles(drawingView){
        const resizeHandles = createAllResizeHandles(this, drawingView);
        return [...resizeHandles];
    }
    
    /**
     * @see {Figure.toString}
     * @returns {String}
    */
   toString(){
        const {x,y,width,height} = this.getRect();
        const containedFigures = this.getContainedFigures();
        const label = this.#buttonLabel;
        const type = this.constructor.name;
        const buttonFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, label:${label},number of contained figures:${containedFigures.length},type:${type}`;
        return buttonFigureString;
    }

    /**
     * Serializes figure to JSON
     * @returns {JSON}
     */
    toJSON(){
        const rectJson = this.getJsonOfRect();
        const containedFigureJson = this.getJsonOfContainedFigures();

        const buttonFigureJson =  {
            "type":this.figureType,
            "label": this.#buttonLabel,
            ...containedFigureJson,
            ...rectJson
        }
        return buttonFigureJson;
    }

    /**
    * created a figure from a JSON
    * @param {JSON} JSON 
    * @param {function} nameFigureClassMapper gets a string, returns the class 
    */
   static fromJSON(JSON,nameFigureClassMapper){
       const {x,y,width,height,label} = JSON;
       const containedFigureObjects = super.createContainedFiguresFromJson(JSON,nameFigureClassMapper);
       const buttonFigure = new ButtonFigure({
            "x":                x,
            "y":                y,
            "width":            width,
            "height":           height,
            "label":            label,
            "containedFigures": containedFigureObjects
        });
        return buttonFigure;
    }
}

export {ButtonFigure}