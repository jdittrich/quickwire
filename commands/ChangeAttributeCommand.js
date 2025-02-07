import { Command } from "./commands.js"

class ChangeAttributeCommand extends Command{
    #newAttributeValue 
    #oldAttributeValue
    #AttributeKey
    #figure
    /**
     * @param {Object} param
     * @param {Figure} param.figure
     * @param {String} params.attribute
     * @param {*}      params.value
     * 
     * @param {DrawingView} drawingView 
     */
    constructor(params,drawingView){
        super();
        const {figure,attribute,value} = params;
        this.#newAttributeValue = value;
        this.#oldAttributeValue = figure.getAttribute(attribute);
        this.#AttributeKey = attribute;
        this.#figure = figure;
    }
    do(){
        this.#figure.setAttribute(this.#AttributeKey, this.#newAttributeValue);
    }
    undo(){
        this.#figure.setAttribute(this.#AttributeKey,this.#oldAttributeValue);
    }
    redo(){
        this.do();
    }
}

export{ChangeAttributeCommand}