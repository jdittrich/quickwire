import {Rect, Point} from './geom.js';

class Figure extends EventTarget{
    constructor(){
        super();
    }
    draw(ctx){
        throw new Error("called Figure’s draw method, but it needs to be implemented in inheriting classes");
    }

    // basic attributes of any figure
    movePositionBy(){
        
    }
    //all resize/reposition functions should go through setRect
    setRect(){

    }
    getRect(){
        
    }

    // ==== handles ====

    /**Returns a list of handles of the figure */ 
    getHandles(){
        //direct creation or factory

    }
    // == being a child of another figure
    appendTo(container){

    }
    setContainer(){

    }
    getContainer(){

    }
    removeFromContainer(){

    }
    offsetFromParent(){

    }
    // == hit tests

    /**
     * @param {Point}
     * @returns {Boolean}
     */
    containsPoint(point){
        
    }

    /**
     * @param {Rect}
     * @returns {Boolean}
     */
    containsRectangle(rect){

    }

    /**
     * @param {Point} pointdid n
     * @returns {Figure[]} - figures below point, starting with the innermost/top figure
     */
    figuresUnderPoint(point){

    }
    //serialization/deserialization
    
    /**
     * JSON serialization for storage
     * @returns {JSON}
     */
    toJSON(){
        throw new Error("toJson called on Figure, but it should be overwritten by subclass")
    }

    /**
     * string serialization read by people, similar to python’s __str__
     */
    toString(){
        throw new Error("toString called on Figure, but it should be overwritten by subclass") 
    }
    
    
}


class CompositeFigure extends Figure{
    #containedFigures = [] 

    /**
     * 
     * @param {*} figure 
     */
    appendFigure(figure){
        //check circularity

        //check if figure is already child

        //check for current parent, remove if existing

        //add to collection

        //set this as parent

        //dispatch events
        this.dispatchEvent();
        this.dispatchEvent();

    }
    /**
     * 
     * @param {Figure} figure 
     */
    removeFigure(figure){

    }

    /**
     * @returns {Figure} 
     */
    getContainedFigures(){

    }
    /**
     * 
     * @param {Figure} figure
     * @returns {Boolean} 
     */
    doesItContain(figure){

    }
    
}

class RectFigure extends CompositeFigure{
    draw(ctx){

    }

    /**
     * created a figure from a JSON
     * @param {JSON} JSON 
     */
    static fromJSON(JSON){
        
    }
}

export {CompositeFigure, RectFigure}
