
class Point{
    /**
     * Points can be used positions or vectors
     * 
     * @param {object} createPointParams
     * @param {number} createPointParams.y
     * @param {number} createPointParams.x 
     */
    constructor(createPointParams){
        const {x,y} = createPointParams;
        if(Number.isNaN(x) || Number.isNaN(y)){ //test NaN, since 0 casts to false. 
            throw new Error(`Points need to be created by passing an object with the properties 'x' (was:${x} ) and 'top' (was: ${y} ) of type number`)
        }
        this.y = createPointParams.y; 
        this.x = createPointParams.x;
    }

    /**
     * Returns a point that is a copy
     * @returns {Point}
     */
    copy(){
        const pointcopy = new Point({
            x:this.x,
            y:this.y
        })
        return pointcopy;
    }
    
    /**
     * Subtract two points. Use this to get their offset to each other. 
     * @param {Point} point to subtract 
     * @returns {Point}
     */
    sub(point){
        return new Point({
            x: this.x - point.x,
            y: this.y - point.y
        });
    };
    
    /**
     * Adds two points. 
     * @param {Point} point 
     * @returns {Point}
     */
    add(point){
        return new Point({
            x: this.x + point.x,
            y: this.y + point.y
        });
    };
    
    /**
     * Get the offset you need to add to the passed point to get to this.
     * Alias for sub. 
     * 
     * @param {Point} point 
     * @returns {Point} offset fom passed point to this.
     */
    offsetFrom(point){
        return this.sub(point);
    }

    /**
     * get the offset you need to add to this to go to the passed point.
     * @param {Point} point 
     * @returns {Point} offset from this to passed point.
     */
    offsetTo(point){
        return point.sub(this)
    }
}


class Rect{
    /**
     * A rectangle, positioned on a coordinate system
     * @param {object} createRectParams
     * @param {number} createRectParams.width
     * @param {number} createRectParams.height
     * @param {number} createRectParams.y
     * @param {number} createRectParams.x 
     */
    constructor(createRectParams){
        const {x,y,width,height} = createRectParams;
        if(isNaN(x)||isNaN(y)||isNaN(width)||isNaN(height)){
            throw new Error(`Rects need to be created by passing an object with x (was:${x} ),y (was: ${y} ),\n width (was: ${width} ), height (was ${height} ) of type number`)
        }
        this.width = createRectParams.width;
        this.height = createRectParams.height;
        this.y = createRectParams.y;
        this.x = createRectParams.x;
    }

    /**
     * Returns a new rect with the same dimensions
     */
    copy(){
        return new Rect({
            width:  this.width,
            height: this.height,
            x:      this.x,
            y:      this.y 
        })
    }
    
    /** Get points */

    /**
     * upper left corner point
     * @returns {Point}
     */
    getPosition(){
        return new Point({
            y:this.y,
            x:this.x
        })
    }

    /**
     * get center point
     * @returns{Point}     
     */
    getCenter(){ 
        return new Point({
            y: this.y + (this.height/2),
            x: this.x + (this.width/2)
        })
    }

    /**
     * Returns a rectangle with same width, height and the position translated by the coordinates in moveBy
     * @param {Point} moveBy
     * @return {Rect}
     */
    movedCopy(moveBy){
        const newPos = this.getPosition().add(moveBy);
        
        return new Rect({
            x:newPos.x,
            y:newPos.y,
            width: this.width,
            height: this.height
        });
    }


    /** Rectangle Testing */
    /**
     * Does this contain the point?
     * @param {Point} point
     * @returns {boolean} 
     */
    enclosesPoint(point){
        const isBeyondStartHorizontal = point.x >=  this.x;
        const isNotBeyondEndHorizontal = point.x <= this.x + this.width;
        const isInHorizontalRange = isBeyondStartHorizontal && isNotBeyondEndHorizontal;

        const isBeyondStartVertical = point.y  >= this.y;
        const isNotBeyondEndVertical = point.y  <= this.y  + this.height
        const isInVerticalRange   = isBeyondStartVertical && isNotBeyondEndVertical; 

        return isInHorizontalRange && isInVerticalRange
    }

    /**
     * Does this fully contain the passed rect?
     * Contains means inside not "on", otherwise a rect could contain itself
     * @param {Rect} rect 
     * @returns {boolean}
     */
    enclosesRect(rect){
        const topIsHigher = this.y < rect.y;
        const bottomIsLower = (this.y + this.height) > (rect.y + rect.height);
        const leftIsMoreLeft = this.x < rect.x;
        const rightIsMoreRight = (this.x+this.width)> (rect.x+rect.width);

        return topIsHigher && bottomIsLower && leftIsMoreLeft && rightIsMoreRight;
    }

    /**
     * is there a partial or full overlap between this and the passed rect?
     * @param {Rect} rect
     * @returns {boolean} 
     */
    overlapsRect(rect){
        //from: https://stackoverflow.com/a/306332/263398
        const isNotFullyLeftToMe  =  this.x < (rect.x + rect.width); //my left side further left than your right side
        const isNotFullyRightToMe = (this.x + this.width) > rect.x;   //my right side further right than your right side
        const isNotFullyOverMe    =  this.y < (rect.y + rect.height);   // my top side higher than your bottom side
        const isNotFullyBelowMe   = (this.y + this.height) > rect.y;    //my bottom side lower than your top side

        const overlaps = isNotFullyLeftToMe && isNotFullyRightToMe && isNotFullyOverMe && isNotFullyBelowMe;
        return overlaps
    }

    toJSON(){
        return{
            "x": this.x,
            "y": this.y,
            "height":this.height,
            "width": this.width
        }
    }

    /**
     * Creates a rectangle from two points with the absolute positions of two 
     * opposed corners of the rectangle
     */
    static createFromCornerPoints(point1, point2){
        //these can be any two points in any order 
        //And neither might be the top-right corner, i.e. they could be ⠑ but also ⠊
          
        const leftmostPosition   = Math.min(point1.x, point2.x);
        const rightmostPosition  = Math.max(point1.x, point2.x);
        const topmostPosition    = Math.min(point1.y, point2.y);
        const bottommostPosition = Math.max(point1.y, point2.y);

        const upperLeftCorner   = new Point({"x":leftmostPosition, "y":topmostPosition});
        const bottomRightCorner = new Point({"x":rightmostPosition,"y":bottommostPosition});
        const dimensions = upperLeftCorner.offsetTo(bottomRightCorner);

        const rectFromCornerPoints = new Rect({
            x:upperLeftCorner.x,
            y:upperLeftCorner.y,
            width: dimensions.x,
            height:dimensions.y
        });

        return rectFromCornerPoints;
    }
}

export {Rect, Point}