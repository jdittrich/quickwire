import { SubclassShouldImplementError } from '../errors.js';
import { Rect } from '../data/rect.js';
import {FigureAttributes} from './figureAttributes.js';

class Figure {
    #rect = null;
    //#attributes = new Map(); //store and retrive attributes
    #attributeKeys = new Set(); //which attribute keys are possible on the figure. Default: Empty

    #attributes = new FigureAttributes();

    #containedBy = null;

    constructor(param){
        const {x,y,width,height} = param;

        this.setRect(new Rect({
            "x":x,
            "y":y,
            "width":width,
            "height":height
        }));

        this.appendFigures(param.containedFigures||[]);
    }
    
    //#region: drawing 
    /** Method called from other object. Interface to all needed drawing operations */
    
    /**
     * Called from other objects, interface to drawing operations.
     * Usually not overwritten by subclasses.
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){ // NOTE: Maybe add the save()/restore() here, so that changes to fill/stroke do not carry over?
        if(this.getIsVisible()){
            ctx.save()
            this.drawFigure(ctx);
            ctx.restore();
            this.drawContainedFigures(ctx);
        }
    }
    
    /**
     * To be overwritten by subclasses.
     * Called only internally by draw.
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawFigure(ctx){
        throw new SubclassShouldImplementError("drawFigure","CompositeFigure");
    }

    /**
     * Not to be overwritten by subclasses.
     * Called only internally by draw.
     * @param {CanvasRenderingContext2D} ctx 
     */
    drawContainedFigures(ctx){
        this.#containedFigures.forEach(figure => figure.draw(ctx));
    }

    //#region: Attributes
    /**
     * Get the attribute by key
     * @param {String} key 
     */
    getAttribute(key){
        const value  = this.#attributes.get(key);
        return value; 
    }

    /**
     * Set an attribute value on key.
     * @param {String} key 
     * @param {*} value 
     */
    setAttribute(key,value){
        this.#attributes.set(key,value);
    }
    /**
     * Registers additional allowed keys.
     * Usually called in constructor.
     * @param {object}   {"Keyname":"ConstructorName"}
     */
    registerAttributes(keyConstructorObject){
        this.#attributes.register(keyConstructorObject)
    };

    //#region: child management
    
    
    /**
     * @param {Figure} figure 
     */
    setContainer(container){
        this.#containedBy = container;
    }

    /**
     * Returns the figure containing this
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

    /**
     * Get all figures that contain this.
     * @returns {Figure[]}
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

    /**
     * Returns the difference between the two upper left corners of this figure and the container.
     * @returns {Point}
     */
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

    #containedFigures = [] 

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
     * Checks, if appending to this would create a circular relation i.e. it would be contained in itself.
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
     * @see {@link Figure.appendFigure} as the inverse
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

    //#region position and dimensions via rect
    /** 
     * @param {Point} point as vector to move the figure 
    */
    movePositionBy(point){
        const oldRect =  this.getRect();
        const newRect = oldRect.movedCopy(point);
        this.changeRect(newRect);
    }
    /**
     * @returns {Point}
     */
    getPosition(){
        const position = this.#rect.getPosition();
        return position;
    }

    /**
     * @param {Point} point 
     */
    // setPosition(point){
    //     const oldRect = this.getRect()
    //     const newRect = new Rect({
    //         width: oldRect.width,
    //         height:oldRect.height,
    //         x:point.x,
    //         y:point.y
    //     });
    //     this.setRect(newRect);
    // }
    
    /**
     * Only to be called internally
     * @param {Rect} rect 
     */
    setRect(rect){
        this.#rect = rect.copy(); 
    }

    /**
     * Called when creating a figure, from mousedown point to mouseup point. 
     * NOTE: Maybe it should be refactored into changeRect?
     * 
     * @see Rect.createFromCornerPoints
     * @param {Point} point1 
     * @param {Point} point2 
     */
    setRectByPoints(point1,point2){
        const newRect = Rect.createFromCornerPoints(point1, point2);
        this.changeRect(newRect);
    }

    /**
     * For repositioning and resizing.
     * @param {Rect} rect 
     */
    changeRect(changedRect){
        const oldRect = this.getRect();
        if(!oldRect){
            this.setRect(changedRect);
            return;
        }
        const oldPosition = oldRect.getPosition();
        const newPosition = changedRect.getPosition();
        const moveBy = oldPosition.offsetTo(newPosition);
        this.setRect(changedRect);

        const containedFigures = this.getContainedFigures();
        containedFigures.forEach(figure=>figure.movePositionBy(moveBy));
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
    getHandles(drawingView){
        /**
         * NOTE on Architecture: 
         * Why do we need to pass drawingView here?
         * figures do not need to know drawingView (so far)
         * they just need to know how to draw themselves and where they
         * are in document coordinates. 
         * Handles, however do need to know how to draw themselves in relation 
         * to the drawingViews zoom! Handles are always the same size, no matter 
         * how far we zoomed in or out – this is relevant for drawing and hot testing
         * 
         * I could also have the figure return view-independent handle data 
         * and selection draws them and hit-tests.
         *  
         */
        return []; //standard implementation is empty array, thus providing a common type. 
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
     * @param {NameFigureClassMapper} nameFigureClassMapper 
     */
    copy(nameFigureClassMapper){
        const figureJSON = this.toJSON();
        const newFigure = this.constructor.fromJSON(figureJSON,nameFigureClassMapper);
        return newFigure;
    }

    /**
     * Helper
     * @returns {Array} with toJSONs of contained figures.
     */
    getJsonOfContainedFigures(){
        const jsonOfContainedFigures = this.#containedFigures.map(figure=>figure.toJSON());
        return {
            "containedFigures": jsonOfContainedFigures
        }
    }

    //#region serialization/deserialization
    /**
     * string serialization read by people, similar to python’s __str__
     */
    toString(){
        throw new SubclassShouldImplementError("toString","Figure");
    }

    /**
     * JSON serialization for storage
     * @returns {JSON}
     */
    toJSON(){
        throw new SubclassShouldImplementError("toJSON","Figure");
    }

    /**
     * Returns a JSON of the rectangle of the figure.
     * @returns {JSON}
     */
    getJsonOfRect(){
        const {x,y,width,height} = this.getRect();
        return {
            "x":x,
            "y":y,
            "width":width,
            "height":height
        }
    }

    /**
     * Helper
     * @param {Array} containedFiguresJson 
     * @returns {Figure[]} 
     */
    static createContainedFiguresFromJson(figureJson,nameFigureClassMapper){
        if(!figureJson.containedFigures){return}
        if(nameFigureClassMapper === undefined){
            throw new TypeError("nameFigureClassMapper is undefined")
        }
        if(Array.isArray(figureJson)){
            throw new TypeError("figureJson is an Array. If you just passed the containedFigures property, please pass the full figure object instead")
        }

        const containedFiguresInstances = figureJson.containedFigures.map((containedFigureJson)=>{
            const type = containedFigureJson.type;
            const RequiredFigureClass = nameFigureClassMapper.getClass(type) //figureJson.type goes in…
            const figure = RequiredFigureClass.fromJSON(containedFigureJson,nameFigureClassMapper);
            return figure;
        })
        return containedFiguresInstances;
    }

    /**
     * 
     * @param {JSON} JSON 
     * @param {NameFigureClassMapper} nameFigureClassMapper 
     */
    static fromJSON(JSON,nameFigureClassMapper){
        throw new SubclassShouldImplementError("MainFigure","fromJSON");
    }
}

export {Figure}