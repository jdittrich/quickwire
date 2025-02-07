import { createAllResizeHandles} from "../handles/resizeHandle.js";
import { createListItemToggleHandles} from "../handles/toggleListItemHandle.js";
import {SingleSelectableLabelList} from "../data/singleSelectLabelList.js"

import {Figure} from './figure.js'
import { Rect  } from "../data/rect.js";
import { Point } from "../data/point.js";



/**
 * 
 * @param {object} param
 * @param {number} param.y
 * @param {number} param.x 
 * @param {number} param.width
 * @param {number} param.height
 */
class RadioButtonListFigure extends Figure{
    figureType = "RadioButtonListFigure";
    #listEntriesRects = [];  //document rects of single list entries

    constructor(param){
        super(param);
        this.registerAttribute(["labelList","indexOfSelectedLabel"]);
        this.setAttribute("labelList",["First","Second","Third"]);
        this.setAttribute("indexOfSelectedLabel",2);
    }

    //FIXME: number of parameters is ugly. Parameter object or split into functions.
    /**
     * 
     * @param {CanvasRenderingContext2D} ctx 
     * @param {Point}   startPos 
     * @param {Boolean} selected 
     * @param {String}  label 
     * @param {Number}  height 
     * @returns {Rect} 
     */
    #drawRadioButton(ctx, startPos, selected, label,height){
        //set constants
        const radioRadius = 5;
        const radioSelectionRadius = 3;

        //derive needed relative values (as if startPos is 0,0)
        const relativeRadioCenter = new Point({
            "x": radioRadius,
            "y": height/2
        });

        const absoluteRadioCenter = relativeRadioCenter.add(startPos);
        
        //define paths
        const radioCircle = new Path2D(); 
        radioCircle.arc(absoluteRadioCenter.x, absoluteRadioCenter.y, radioRadius, 0, 2 * Math.PI, false);
        
        const radioSelection = new Path2D(); 
        radioSelection.arc(absoluteRadioCenter.x, absoluteRadioCenter.y, radioSelectionRadius, 0, 2 * Math.PI, false);

        //draw things:
        ctx.stroke(radioCircle);
        if(selected){
            ctx.fill(radioSelection);
        }
        
        ctx.fillText(label, startPos.x + radioRadius*2 +10 , startPos.y + (height*0.70));

        const positionRect = Rect.createFromCornerPoints(
            startPos,
            new Point({
                x: startPos.x + radioRadius*2,
                y: startPos.y + height
            })
        );

        return positionRect; 
        /*
        this is currently somewhat ugly. 
        I could map over the function, but this would mean that I have a map with side effects. 
        I could also have the function write to its index of this.#listEntriesRects but it knowing its index is also ugly. 
        I could have a function that does calculate the values and returns them and another that draws them. Does not work if text pushes the next thing...
        
        Probably best to have an area for the list that has predetermined height and width? Oh well, that does not work with tabs, again.
        But probably best to have a list component or the like that considers list stuff? 
        */
    }
    drawFigure(ctx){
        const {width,height,x,y} = this.getRect();
        this.#listEntriesRects = [];
        let startPos = new Point({
            "x":x,
            "y":y
        });
        const listItemHeight = 20;
        const labelList = this.getAttribute("labelList");
        labelList.forEach((entry,index)=>{
            const selected = (index === this.getAttribute("indexOfSelectedLabel"));
            const currentRect = this.#drawRadioButton(ctx,startPos,selected,entry,listItemHeight)
            this.#listEntriesRects.push(currentRect);
            startPos = startPos.add(
                new Point({
                    "x":0,
                    "y":listItemHeight
                })
            );
        });
    }

    getHandles(drawingView){
        const resizeHandles = createAllResizeHandles(this, drawingView);
        const listItemToggleHandles = createListItemToggleHandles(this,drawingView);
        return [...resizeHandles,...listItemToggleHandles];
    }
    
    getListEntryRects(){
        return [...this.#listEntriesRects];
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
        return rectFigureJson;
    }

    /**
     * created a figure from a JSON
     * @param {JSON} JSON 
     */
    static fromJSON(JSON,nameFigureClassMapper){
        const {x,y,width,height} = JSON;
        const containedFigureObjects = super.createContainedFiguresFromJson(JSON,nameFigureClassMapper);
        const radioButtonListFigure = new RadioButtonListFigure({
            "x":                x,
            "y":                y,
            "width":            width,
            "height":           height,
            "containedFigures": containedFigureObjects
         });
         return radioButtonListFigure;
    }
}

export {RadioButtonListFigure}