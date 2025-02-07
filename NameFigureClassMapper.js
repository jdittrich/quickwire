import {Figure} from './figures/figure.js';

/**
 * Every serialized object has its type as a string
 * but we need to get the class to generate an object from that string
 * This object stores a mapping of string ←→ class
 * The mapping is NOT build in. You need to created it, the most easiest by passing it an object
 * to registerFromObject
 * that looks like this:
 * {
 *  "myGreatFigure": MyGreatFigure
 *  "myNamedFigure": MyVeryComplicatedlyNamedFigure
 *  … etc… 
 * }
 */
class NameFigureClassMapper{
    #mappings

    constructor(){
        this.#mappings = new Map();
    }

    /**
     * @param {Object} nameClassMap with values being subclasses of Figure
     */
    registerFromObject(nameClassMap){
        for (const [name, figureClass] of Object.entries(nameClassMap)) {
            this.register(name,figureClass);
        }
    }
    /**
     * @param {String} name 
     * @param {Figure} FigureClass 
     * @returns 
     */
    register(name,FigureClass){
        //guards
        if(!(Figure.isPrototypeOf(FigureClass))){
            throw TypeError("the class needs to be a subclass of Figure")
        }
        if(typeof name !== "string"){
            throw TypeError("name needs to be of type String")
        }

        this.#mappings.set(name,FigureClass);
        return this //for convenient chaining
    }
    getClass(name){
        const figureClass = this.#mappings.get(name)
        if(!figureClass){
            throw Error(`there is no class with the name ${name} that was previously registered`)
        }
        return figureClass;
    }
    
}

export {NameFigureClassMapper}