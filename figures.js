import {Rect, Point} from './geom.js';
import { SubclassShouldImplementError } from './errors.js';
import { createAllResizeHandles } from './handles.js';

// as for now (2024-11-29) you can inherit from Figure BUT it leads to other code or autogrouping getting hickups. 
// so I might add some sort of flag or duck type to determine if a figure can be used as container. 
// maybe the GoF book has some hints at the composite pattern. 
// 
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
        this.setRect(newRect);
    }
    
    /**
    * @returns {Rect} 
    */
    getRect(){
       const rectCopy = this.#rect.copy(); 
       return rectCopy;
    }

    /**
    * @returns {Rect} 
    */
    changeRect(rect){ //not sure if this is a great name, I have changeRect and setRect. However, hotdraw had something similar, [methodname]basic or so for low level. 
        this.setRect(rect);
    }

    //#region Handles factory
    
    /**Returns a list of handles of the figure */ 
    getHandles(drawingView){
        /**
         * NOTE on Architecture: 
         * Why do we need to pass drawing view here?
         * figures do not need to know drawingView (so far)
         * thery just need to know how to draw themselves and where they
         * are in document coordinates. 
         * Handles, however do need to know how to draw themselves in relation 
         * to the drawingViews zoom! Handles are always the same size, no matter 
         * how far we zoomed in or out – this is relevant for drawing and hot testing
         * 
         * I could also have the figure return view-independend handle data 
         * and selection draws them and hit-tests.
         *  
         */
        return []; //standard implementation is empty array, thus providing a common type. 
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
     * @param {Figure} figure 
     * @returns {Boolean} true if figure entirely inside, otherwise false
     */
    enclosesFigure(figure){
        const  otherFigureRect = figure.getRect();
        const  doesThisEncloseFigure = this.enclosesRect(otherFigureRect);
        return doesThisEncloseFigure; 
    }

    /**
     * @param {Rect} rect 
     * @returns {Boolean} true if rect is entirely inside, otherwise false
     */
    enclosesRect(rect){ 
        const doesThisEncloseRect = this.#rect.enclosesRect(rect);
        return doesThisEncloseRect;
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
            new Error(`can't append a figure that would be outside of container. If you append after a change of a figure e.g. drag, change the figure first, then append, not vice versa`);
        }

        if(this.#isCircularRelation(figureToAppend)){
            new Error("can't append a figure that would create a circular graph, i.e. be contained in itself")
        }
        
        if(figureToAppend.getContainer()){
           const currentContainer = figureToAppend.getContainer();
           currentContainer.detachFigure(figureToAppend);
        }
   
        this.#addToCollection(figureToAppend);
       
        figureToAppend.setContainer(this);
    }

    /**
     * @param {Figure[]} figuresToAppend 
     */
    appendFigures(figuresToAppend){
        //first check circularity for all, preventing that a part is appended before the error
        const circularityChecks = figuresToAppend.map(figure=>this.#isCircularRelation(figure));
        const atLeastOneCircular = circularityChecks.includes(true);
        if(atLeastOneCircular){
            throw new Error("Can’t append: At least one proposed Child is its own ancestor, would create circular hierarchy.")
        }

        const containmentChecks = figuresToAppend.map(figure=>this.enclosesFigure(figure));
        const atLeastOneOutside = containmentChecks.includes(false);
        if(atLeastOneOutside){
            throw new Error("Can’t append: At least one proposed Child is outside the this figure")
        }

        //but if all checks pass: 
        figuresToAppend.forEach(figure=>this.appendFigure(figure));
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
        this.changeRect(newRect);
    }

    setPosition(point){ //TODO: go through changeRect
        const currentPosition = this.getPosition();
        const moveBy = currentPosition.offsetTo(point);
        this.movePositionBy(moveBy);
    }

    /**
     * For repositioning and resizing.
     * @param {Rect} rect 
     */
    changeRect(changedRect){
        const oldRect = this.getRect();
        const oldPosition = oldRect.getPosition();
        const newPosition = changedRect.getPosition();
        const moveBy = oldPosition.offsetTo(newPosition);
        this.setRect(changedRect);

        const containedFigures = this.getContainedFigures();
        containedFigures.forEach(figure=>figure.movePositionBy(moveBy));
    }

    /**
     * Helper
     * @returns {Array} with toJSONs of contained figures.
     */
    getJsonOfContainedFigures(){
        const jsonOfContainedFigures = this.#containedFigures.map(figure=>figure.toJSON());
        return jsonOfContainedFigures;
    }

    /**
     * Helper
     * @param {Array} containedFiguresJson 
     * @returns {Figure[]} 
     */
    createContainedFiguresFromJson(figureJson,figureStringClassMapper){
        figureJson.containedFigures.map((containedFigureJson)=>{
            const type = containedFigureJson.type;
            const requiredFigureClass = figureStringClassMapper(type) //figureJson.type goes in…
            const figure = new requiredFigureClass(containedFigureJson);
            return figure;
        })
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

        // TODO: needs a map that returns the "real" objects based on JSON
        // but how do I generate objects of an unknown class?
        // CODE draft:
        // const containedFigures = params.containedFigures.map(…
        // I assume I need some repository matching strings with classes
        // so I can retrieve them
        // 
    }
    drawFigure(ctx){
        const {width,height,x,y} = this.getRect();
        ctx.strokeRect(x,y,width,height);
    }

    toJSON(){
        const {x,y,width,height} = this.getRect()
        const rectFigureJson =  {
            "type":"RectFigure",
            "x":x,
            "y":y,
            "width":width,
            "height":height,
            "containedFigures":this.getJsonOfContainedFigures()
        }
        return rectFigureJson;
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
    /**
     * created a figure from a JSON
     * @param {JSON} JSON 
     */
    static fromJSON(JSON,figureStringClassMapper){
        const {x,y,width,height,containedFigures} = JSON;
        const containedFigureObjects = this.createContainedFiguresFromJson(containedFigures,figureStringClassMapper)
        const rectFigure = new RectFigure({
            "x":                x,
            "y":                y,
            "width":            width,
            "height":           height,
            "containedFigures": containedFigures
        });
        return rectFigure;
    }
}

class ButtonFigure extends CompositeFigure{
    #label
    constructor(params){
        super();
        const {x,y,width,height,label} = params;
        this.setRect(new Rect({
            "x":x,
            "y":y,
            "width":width,
            "height":height
        }));
        this.#label = label;
    }

    changeLabel(changedLabel){
        this.#label =changedLabel;
    }
    getLabel(){
        return this.#label;
    }

    drawFigure(ctx){
        const rect = this.getRect();
        const {width,height,x,y} = rect;
        const center = rect.getCenter();
        
        ctx.strokeRect(x,y,width,height);

        //use text width and height to place in center
        const metrics = ctx.measureText(this.#label);
        const labelY = center.y + ((metrics.hangingBaseline-metrics.ideographicBaseline)/2);
        const labelX = center.x - (metrics.width/2);
        //…but for now just slap text in upper left corner.
        ctx.fillText(this.#label, labelX, labelY);
    }

    toJSON(){
        const {x,y,width,height} = this.getRect();
        const label = this.#label;
        const buttonFigureJson =  {
            "type":this.constructor.name,
            "x":x,
            "y":y,
            "width":width,
            "height":height,
            "label":label,
            "containedFigures":this.getJsonOfContainedFigures()
        }
        return buttonFigureJson;
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
        const label = this.#label;
        const type = this.constructor.name;
        const buttonFigureString = `x:${x}, y:${y}, width:${width}, height:${height}, label:${label},number of contained figures:${containedFigures.length},type:${type}`;
        return buttonFigureString;
    }
    /**
     * created a figure from a JSON
     * @param {JSON} JSON 
     * @param {function} figureStringClassMapper gets a string, returns the class 
     */
    static fromJSON(JSON,figureStringClassMapper){
        const {x,y,width,height,label,containedFigures} = JSON;
        const buttonFigure = new ButtonFigure({
            "x":                x,
            "y":                y,
            "width":            width,
            "height":           height,
            "label":            label,
            "containedFigures": containedFigures
        })
        return buttonFigure;
    }
}



export {Figure, CompositeFigure, RectFigure, ButtonFigure, NoOpFigure}
