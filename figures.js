import {Rect, Point} from './geom.js';
import { SubclassShouldImplementError } from './errors.js';

class Figure extends EventTarget{
    constructor(){
        super();
    }
    
    /** Method called from other object. Interface to all needed drawing operations */
    draw(ctx){
        if(this.getIsVisible()){
            this.drawFigure(ctx)
        }
    }
    /**Called by draw(), draws the figure itself*/
    drawFigure(ctx){throw new SubclassShouldImplementError("drawFigure","Figure")}
    
    //#region position and dimensions via rect
    #rect = null; 
    /** 
     * @param {Point} point as vector to move the figure 
    */
    movePositionBy(point){
        const oldRect = this.getRect();
        const newRect = oldRect.movedCopy(point);
        this.setRect(newRect);
    }
    /**
     * @returns {Point}
     */
    getPosition(){
        const position = this.#rect.getPosition();
        return position;
    }

    /**
     * 
     * @param {Point} point 
     */
    setPosition(point){
        const oldRect = this.getRect()
        const newRect = new Rect({
            width: oldRect.width,
            height:oldRect.height,
            x:point.x,
            y:point.y
        });
        this.setRect(newRect);
    }
    //all resize/reposition functions should go through setRect
    setRect(rect){
        this.#rect = rect.copy(); 
    }

    /**
     * @see Rect.createFromCornerPoints
     * @param {Point} point1 
     * @param {Point} point2 
     */
    setRectByPoints(point1,point2){
        const newRect = Rect.createFromCornerPoints(point1, point2);
        this.#rect = newRect;
    }
    
    /**
    * @returns {Rect} 
    */
    getRect(){
       const rectCopy = this.#rect.copy(); 
       return rectCopy;
    }
    
    //#region Handles factory
    
    /**Returns a list of handles of the figure */ 
    getHandles(){
        throw new Error("getHandles called, but I did not implement it yet");//TODO
        //direct creation or factory
    }

    //#region append to compositeFigure
    #containedBy = null;
    /**
     * @protected should only be set by CompositeFigure
     * @see CompositeFigure
     * @param {Figure} figure 
     */
    setContainer(container){
        this.#containedBy = container;
    }

    /**
     * Returns the figure containing this.
     * @returns {Figure}
     */
    getContainer(){
        return this.#containedBy;
    }
    /**
     * True if it is currently contained in any other figure, false if not (and thus not part of the drawing)
     * @returns {Boolean}
     */
    isContained(){
        return !!this.#containedBy;
    }

    getContainedFigures(){ //here as a placeholder to ensure a common interface between composite and non-composite
        return [];
    }

    /**
     * Get all figures that contain this
     */
    getContainers(){
        let containers = [];

        let currentFigure = this; 

        while(currentFigure.getContainer()){
            let container = currentFigure.getContainer();
            containers.push(container);
            currentFigure = container;
        }
        
        return containers;
    }

    offsetFromContainer(){
        if(!this.getContainer()){
            throw new Error("Requested offset from Container, but figure is not currently assigned to a container")
        }
        const container = this.getContainer();
        const containerPosition = container.getPosition();
        const ownPosition = this.getPosition();
        const offset = ownPosition.offsetFrom(containerPosition);

        return offset;
    }


    //#region hit tests.

    /**
     * @param {Point}
     * @returns {Boolean}
     */
    enclosesPoint(point){
        const doesContainPoint = this.#rect.enclosesPoint(point);
        return doesContainPoint;
    }

    /**
     * @param {Figure}
     * @returns {Boolean} true if figure entirely inside, otherwise false
     */
    enclosesFigure(figure){
        const  otherFigureRect = figure.getRect();
        const  doesThisContainFigure = this.#rect.enclosesRect(otherFigureRect);
        return doesThisContainFigure; 
    }
    //# region visibility
    #isVisible = true
    
    /**
     * @returns {Boolean}
     */
    getIsVisible(){
        return this.#isVisible;
    }

    /**
     * @param {Boolean} isVisible 
     */
    setIsVisible(isVisible){
        if(typeof isVisible !== "boolean"){throw TypeError("setIsVisible parameter needs to be boolean")}
        this.#isVisible = isVisible;
    }

    //#region: copy

    /**
     * Should return a copy of the figure with all its subfigures? Or maybe I implement , deep = false or copyDeep /copyShallow
     * @returns {Figure}
     */
    copy(){
        const figureJSON = this.toJSON();
        return new this.constructor(figureJSON);
    }

    //#region serialization/deserialization
    /**
     * JSON serialization for storage
     * @returns {JSON}
     */
    toJSON(){
        throw new SubclassShouldImplementError("toJSON","Figure");
    }

    /**
     * string serialization read by people, similar to python’s __str__
     */
    toString(){
        throw new SubclassShouldImplementError("toString","Figure");
    }
}

/**If you need something that is technically a figure, but does nothing */
class NoOpFigure extends Figure{
    draw(ctx){
        return;
    }
}

class CompositeFigure extends Figure{
    constructor(){
        super();
    }
    draw(ctx){
        if(this.getIsVisible()){
            this.drawFigure(ctx);
            this.drawContainedFigures(ctx);
        }
    }
    drawFigure(){ 
        throw new SubclassShouldImplementError("drawFigure","CompositeFigure");
    }
    drawContainedFigures(ctx){
        this.#containedFigures.forEach(figure => figure.draw(ctx));
    }

    #containedFigures = [] 
    //#region: child management
    /**
     * @see {@link detachFigure} as the inverse operation
     * @param {Figure} figure
     */
    appendFigure(figureToAppend){
        if(!this.enclosesFigure(figureToAppend)){
            new Error("can't append a figure that would be outside of container")
        }

        if(this.#isCircularRelation(figureToAppend)){
            new Error("can't append a figure that would create a circular graph, i.e. be contained in itself")
        }
        
        if(figureToAppend.getContainer()){
           const currentContainer = figureToAppend.getContainer();
           currentContainer.removeFigure(figureToAppend);
        }
   
        this.#addToCollection(figureToAppend);
       
        figureToAppend.setContainer(this);
    }

    /**
     * checks if appending to this would create a circular relation i.e. it would be contained in itself.
     * @param {Figure} figureToAppend 
     * @returns {Boolean} 
     */
    #isCircularRelation(figureToAppend){
        //we have a circularRelation if the figureToAppend is in the list of figures that contain this.
        const isCircular = this.getContainers().includes(figureToAppend);
        return isCircular;
    }

    /**
     * encapsulate removal from collection of contained figures
     * @see {@link CompositeFigure.#addToCollection} as inverse
     * @param {Figure} figureToRemove 
     */
    #removeFromCollection(figureToRemove){
        if(!this.#isInCollection(figureToRemove)){
            throw new Error("figure to be removed is not contained in this figure.")
        }
        const updatedContainedFigures = this.#containedFigures.filter(containedFigure => containedFigure !== figureToRemove);
        this.#containedFigures = updatedContainedFigures;
    }

    /**
     * @see {@link CompositeFigure.#removeFromCollection} as inverse
     * @param {Figure} figureToAdd 
     */
    #addToCollection(figureToAdd){
        if(this.#isInCollection(figureToAdd)){
            throw new Error("Figure to be added is already contained in this figure")
        };
        this.#containedFigures.push(figureToAdd);
    }

    /**
     * @param {Figure} figure 
     * @returns {Boolean}
     */
    #isInCollection(figure){
        const includesFigure = this.#containedFigures.includes(figure);
        return includesFigure;
    }

    /**
     * remove figure from container. 
     * Might be called directly or when by appendFigure to move to a new container
     * @see {@link CompositeFigure.appendFigure} as the inverse
     * @param {Figure} figure 
     */
    detachFigure(figureToRemove){
        this.#removeFromCollection(figureToRemove)
        figureToRemove.setContainer(null);
    }
    
    /**
     * Returns array with contained figures BUT not their contained figures, too
     * @returns {Figure[]} 
     */
    getContainedFigures(){
        return [...this.#containedFigures];
    }

    movePositionBy(point){
        const oldRect =  this.getRect();
        const newRect = oldRect.movedCopy(point);
        this.setRect(newRect);
        
        //move contained Figures
        const containedFigures = this.getContainedFigures();
        containedFigures.forEach(figure=>figure.movePositionBy(point));
    }
    /**
     * Helper
     * @returns {Array} with toJSONs of contained figures.
     */
    getJsonOfContainedFigures(){
        const jsonOfContainedFigures = this.#containedFigures.map(figure=>figure.toJSON());
        return jsonOfContainedFigures;
    }
}

class RectFigure extends CompositeFigure{
    constructor(params){
        super();
        const {x,y,width,height} = params;
        this.setRect(new Rect({
            "x":x,
            "y":y,
            "width":width,
            "height":height
        }));
    }
    drawFigure(ctx){
        //pre draw: TODO check visibility
        const {width,height,x,y} = this.getRect();
        ctx.strokeRect(x,y,width,height);
        //post draw
        //this.drawContainedFigures(ctx);
    }

    toJSON(){
        const {x,y,width,height} = this.getRect()
        const rectFigureJson =  {
            "figureType":this.constructor.name,
            "x":x,
            "y":y,
            "width":width,
            "height":height,
            "containedFigures":this.getJsonOfContainedFigures()
        }
        return rectFigureJson;
    }

    /**
     * @see {Figure.toString}
     * @returns {String}
     */
    toString(){
        const {x,y,width,height} = this.getRect();
        const containedFigures = this.getContainedFigures();
        const type = this.constructor.name;
        const rectFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, number of contained figures:${containedFigures.lenght},type:${type}`;
        return rectFigureString;
    }
    /**
     * created a figure from a JSON
     * @param {JSON} JSON 
     */
    static fromJSON(JSON){
        const {x,y,width,height,containedFigures} = JSON;
        const rectFigure = new RectFigure({
            "x":                x,
            "y":                y,
            "width":            width,
            "height":           height,
            "containedFigures": containedFigures
        })
        return rectFigure;
    }
}

export {CompositeFigure, RectFigure, NoOpFigure}
