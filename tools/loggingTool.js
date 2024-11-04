import { AbstractTool } from "./abstractTool.js";
import {LocalDragEvent, LocalMouseEvent} from '../events.js'

/**
 * Simple logging tool for down and up events
 */
class LoggingTool extends AbstractTool{
    constructor(){
        super();
    }
    onMousedown(mouseEvent){
        console.log("mousedown", mouseEvent)
    }
    
    onMouseup(mouseEvent){
        console.log("mouseup", mouseEvent)
    }

    onDragstart(mouseEvent, mouseDownPoint){
        console.log("dragstart", mouseEvent)
    }
    
    onDragend(mouseEvent, mouseDownPoint){
        console.log("dragend", mouseEvent)
    }

    onWheel(mouseEvent, wheelDelta){
        console.log("wheelDelta",wheelDelta);
    }
}

export {LoggingTool}