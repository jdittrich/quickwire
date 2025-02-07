import { Point } from "./point.js";

class Rect{
    /**
     * A rectangle, positioned on a coordinate system
     * @param {object} createRectParam
     * @param {number} createRectParam.width
     * @param {number} createRectParam.height
     * @param {number} createRectParam.y
     * @param {number} createRectParam.x 
     */
    constructor(createRectParam){
        const {x,y,width,height} = createRectParam;
        if(isNaN(x)||isNaN(y)||isNaN(width)||isNaN(height)){
            throw new Error(`Rects need to be created by passing an object with x (was:${x} ),y (was: ${y} ),\n width (was: ${width} ), height (was ${height} ) of type number`)
        }
        this.width = createRectParam.width;
        this.height = createRectParam.height;
        this.y = createRectParam.y;
        this.x = createRectParam.x;
    }

    get right(){
        return this.x + this.width;
    }
    get bottom(){
        return this.y + this.height;
    }
    get top(){
        return this.y;
    }
    get left(){
        return this.x;
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
     * Returns the corner points
     * @returns {Object} corners 
     * @returns {Point} corners.topright
     * @returns {Point} corners.bottomright
     * @returns {Point} corners.bottomleft
     * @returns {Point} corners.topleft
     */
    getCorners(){
        const corners = {
            "topRight":new Point({
                "x":this.x + this.width,
                "y":this.y
            }),
            "bottomRight": new Point({
                "x":this.x + this.width,
                "y":this.y + this.height
            }),
            "bottomLeft": new Point({
                "x":this.x,
                "y":this.y + this.height
            }),
            "topLeft": new Point({
                "x":this.x,
                "y":this.y
            })
        };

        return corners;
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
     * 
     * @param {Point} point1 
     * @param {Point} point2 
     * @returns {Rect}
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

export {Rect}