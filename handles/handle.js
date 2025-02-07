class Handle{
    #figure
    #drawingView

    constructor(figure, drawingView){
        this.#figure = figure;
        this.#drawingView = drawingView;
    }

    // == Handle methods

    /**
     * returns point in document space
     * @returns {Point}
     */
    getLocation(){
        throw new SubclassShouldImplementError("getLocation", "Handle");
    }

    getDrawingView(){
        return this.#drawingView;
    }
    /**
     * Get the figure to which the handle belongs
     * @returns {Figure}
     */
    getFigure(){
        return this.#figure;
    }
    
    getScreenRect(){ //TODO: Move to resizeHandle
        throw new SubclassShouldImplementError("getScreenRect", "Handle");
    }
    /**
     * super simple color thing, maybe replace with Color type at some point
     * @returns {String}
     */
    getColor(){
        return "#40AA30";
    }

    getSize(){ //moveToResizeHandle
        return 15;
    }
    // == figure-like methods
        
    /**
     * Draws the handle on the rendering context
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){ //TODO: I think this can stay!
        const screenRect = this.getScreenRect();
        const {x,y,width,height} = screenRect;

        ctx.save()
        ctx.fillStyle = this.getColor();
        ctx.fillRect(
            x,
            y,
            width,
            height
        )
        ctx.restore();
    }

    /**
     * 
     * @param {Point} point (document space)
     * @returns {Boolean} - whether the point is in the handle or not 
     */
    enclosesPoint(point){ //can stay
        const pointScreenPosition = this.#drawingView.documentToScreenPosition(point);
        const screenRect = this.getScreenRect();
        const isPointInsideRect = screenRect.enclosesPoint(pointScreenPosition)
        return isPointInsideRect;
    } 
    //== tool-like methods
    onDragstart(dragEvent){ }
    onDrag(dragEvent){ }
    onDragend(dragEvent){ }
    onMousedown(mouseEvent){ }
    onMouseUp(mouseEvent){ }
}

export {Handle}