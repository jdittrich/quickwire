import { createAllResizeHandles } from '../handles/resizeHandle.js';

import {Figure} from './figure.js'

/**
 * Creates figure representing a simple rectangle
 * 
 * @param {object} param
 * @param {number} param.y
 * @param {number} param.x 
 * @param {number} param.width
 * @param {number} param.height
 */
class RectFigure extends Figure{
    figureType = "RectFigure";

    constructor(param){
        super(param);
    }

    drawFigure(ctx){
        const {width,height,x,y} = this.getRect();
        ctx.strokeRect(x,y,width,height);
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
       const type = this.constructor.name;
       const rectFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, number of contained figures:${containedFigures.length},type:${type}`;
       return rectFigureString;
    }
    
    toJSON(){
        const rectJson = this.getJsonOfRect()
        const containedFiguresJson = this.getJsonOfContainedFigures();
        const rectFigureJson =  {
            "type":this.figureType,
            ...rectJson,
            ...containedFiguresJson
        }
        /**
         * "type":this.figureType,
         * "rect":this.getRect().toJson();
         * "containedFigures":...
         * 
         */
        return rectFigureJson;
    }

    /**
     * created a figure from a JSON
     * @param {JSON} JSON 
     */
    static fromJSON(JSON,nameFigureClassMapper){
        const {x,y,width,height} = JSON;
        const containedFigureObjects = super.createContainedFiguresFromJson(JSON,nameFigureClassMapper);
        const rectFigure = new RectFigure({
            "x":                x,
            "y":                y,
            "width":            width,
            "height":           height,
            "containedFigures": containedFigureObjects
         });
         return rectFigure;
    }
}

export {RectFigure}