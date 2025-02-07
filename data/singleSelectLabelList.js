import { LabelList } from "./labelList.js";
/**
 * e.g. for radio buttons and tabs
 */
class SingleSelectableLabelList extends LabelList{
    #selectedIndex = null; 
    constructor(labelList, selectedIndex){
        super(labelList);
        //guards
        if(typeof selectedIndex !== "number"){
            throw new TypeError("selected index must be of type number, but was of type "+ typeof selectedIndex);
        }
        if(selectedIndex<0){
            throw new Error("Selected item index can't be smaller than 0")
        }
        if(selectedIndex > labelList.length-1){
            throw new Error("Selected item index can't exceed list lenght. Max index is "+labelList.length-1+" but was "+ selectedIndex);
        }

        //assignment
        this.#selectedIndex = selectedIndex;
    }
    getSelectedIndex(){
        return this.#selectedIndex;
    }
    getSelectedLabel(){
        return this.getLabels()[this.#selectedIndex];
    }
    toJSON(){
        return {
            "type":"LabelList",
            "labels":this.getLabels(),
            "selectedIndex":this.getSelectedIndex()
        }
    }
    static fromJSON(SingleSelectableLabelListJson){
        //const arrayOfLabels = LabelList.arrayOfStringsToLabels(SingleSelectableLabelListJson.labels)
        const {labels, selectedIndex} = SingleSelectableLabelListJson;
        const singleSelectableLabelList = new SingleSelectableLabelList(labels,selectedIndex);
        return singleSelectableLabelList;
    }
}

export {SingleSelectableLabelList}