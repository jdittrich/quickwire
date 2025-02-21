import { LabelList } from "./labelList.js";
/**
 * e.g. for radio buttons and tabs
 */
class SingleSelectableLabelList extends LabelList{
    #selectedIndex = 0; 

    /**
     * 
     * @param {String[]} labelList 
     * @param {Number} selectedIndex 
     */
    constructor(labelList, selectedIndex){
        super(labelList);
        //guards
        if(!Number.isInteger(selectedIndex)){
            throw new TypeError("selected index must be an integer");
        }
        if(selectedIndex<0){
            throw new Error("Selected item index can't be smaller than 0")
        }
        if(selectedIndex > labelList.length-1){
            throw new Error("Selected item index can't exceed list length. Max index is "+labelList.length-1+" but was "+ selectedIndex);
        }

        //assignment
        this.#selectedIndex = selectedIndex;
    }
    /**
     * @returns {Number}
     */
    getSelectedIndex(){
        return this.#selectedIndex;
    }

    /**
     * @returns {String}
     */
    getSelectedLabel(){
        return this.getLabels()[this.#selectedIndex];
    }
    /**
     * returns a copy of the list. Pass parameters to overwrite parameters
     * @param {object} param 
     * @param {String[]} param.labels
     * @param {Number} param.index
     * @returns 
     */
    copy(overwrites){
        const selectedIndex = overwrites.selectedIndex ?? this.getSelectedIndex();
        const labels = overwrites.labels ?? this.getLabels();
        const singleSelectLabelList = new SingleSelectableLabelList(labels,selectedIndex);
        return singleSelectLabelList;
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