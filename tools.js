// /**
//  * Tool manager allows to change tools and passes events to the event handlers of the currently active tool.
//  * It uses the state design pattern.
//  * 
//  * Any tool gets a mouseEvent passed. This is not the browser based mouse event, but a custom event, 
//  * usually created and passed from the document’s controller.
//  */




// /**
//  * A tool that does nothing, but is a valid tool (NoOp = no operations) 
//  */
// class NoOpTool extends AbstractTool{
//     constructor(){
//         super()
//     }
// }



// //Adds an element to the drawing
// //TODO: 
// // - Add the element via command. 
// class CreateElementTool extends AbstractTool{
//     #figureToCreate = null;
//     #previewFigure = null;
//     /**
//      * @param {AbstractFigure} figure - that is to be created in the drawing
//      */
//     constructor(figureToCreate){
//         super();
//         this.#figureToCreate = figureToCreate;
//     }
//     /**
//      * 
//      * @param {LocalMouseEvent} event 
//      * @param {Point} mouseDownPoint 
//      */
//     onDragstart(event,mouseDownPoint){
//         //WIP
//         //create the element, size is 
//         //this.#previewFigure = this.#figureToCreate.copy();
//         this.drawingView.startPreviewOf(this.#figureToCreate);
//     }
//     /**
//      * @param {LocalDragEvent} event 
//      */
//     onDrag(event){ 
//         const currentMousePoint = event.getDocumentPosition(); 
//         const documentMouseDownPoint = event.getMousedownDocumentPosition();
//         this.#previewFigure.setRectByPoints(documentMouseDownPoint,currentMousePoint);
//         this.drawingView.updateDrawing();
//     }
//     /**
//      * 
//      * @param {LocalMouseEvent} event 
//      * @param {Point} mouseDownPoint 
//      */
//     onDragend(event){
//         //or I only append to view() and it automatically appends to the right things?
//         const newFigure = this.#figureToCreate.copy();
//         const currentMousePoint = event.getDocumentPosition(); 
//         const documentMouseDownPoint = event.getMousedownDocumentPosition();
//         newFigure.setRectByPoints(currentMousePoint, documentMouseDownPoint); 
        
//         //call this when you want to append a figure anywhere, it figures out where to drop it?
//         this.drawingView.addFigure(newFigure);
        
//         //cleanup
//         this.#previewFigure = null;
//         this.drawingView.endPreview();
//     }
// }


// export {LoggingTool, NoOpTool, SelectionTool, CreateElementTool}
