
class Point{
    #x = null;
    #y = null;

    /**
     * Points can be used positions or vectors
     * 
     * @param {object} createPointParam
     * @param {number} createPointParam.y
     * @param {number} createPointParam.x 
     */
    constructor(createPointParam){
        const {x,y} = createPointParam;
        if(Number.isNaN(x) || Number.isNaN(y)){ //test NaN, since 0 casts to false. 
            throw new Error(`Points need to be created by passing an object with the properties 'x' (was:${x} ) and 'top' (was: ${y} ) of type number`)
        }
        this.#y = createPointParam.y; 
        this.#x = createPointParam.x;
    }

    get x(){
        return this.#x;
    }

    get y(){
        return this.#y;
    }

    /**
     * Returns a point that is a copy
     * @returns {Point}
     */
    copy(){
        const pointCopy = new Point({
            x:this.x,
            y:this.y
        })
        return pointCopy;
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
     * Creates inverse, i.e. adding this to a vector should create a point at 0,0;
     * @returns {Point}
     */
    inverse(){
        return new Point({
            x: -1 * this.x,
            y: -1 * this.y
        });
    }
    
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
    toJSON(){
        const pointJson = {
            "x":this.x,
            "y":this.y
        } 
        return pointJson;
    }
    static fromJSON(pointJson){
        const point = new Point({
            "x": pointJson.x,
            "y": pointJson.y
        }) 
        return point;
    }
}

export {Point}