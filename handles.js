
//box handle kit i.e. pass figure with a getRect and get the handles back


class Handle{
    #figure
    
    constructor(figure){

    }


    // == Handle methods

    /**
     * returns point in document space
     * @returns {Point}
     */
    getLocation(){

    }

    /**
     * Get the figure to which the handle belongs
     * @returns {Figure}
     */
    getFigure(){

    }
    // == figure-like methods
    
    /**
     * Draws the handle on the rendering context
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx){

    }

    /**
     * 
     * @param {Point} point (document space)
     * @returns {Boolean} - whether the point is in the handle or not 
     */
    containsPoint(point){

    }

    //== tool-like methods
    invokeStart(){

    }
    invokeStep(){

    }
    invokeEnd(){}

}