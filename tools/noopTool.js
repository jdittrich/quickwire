import { AbstractTool } from "./abstractTool.js"
import {LocalDragEvent, LocalMouseEvent} from '../mouseEvent.js'

/**
 * A tool that does nothing, but is a valid tool (NoOp = no operations) 
 */
class NoOpTool extends AbstractTool{
    constructor(){
        super()
    }
}

export {NoOpTool}