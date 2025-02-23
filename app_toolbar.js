class Toolbar{
    domElement = null; 

    constructor(drawingView){
        this.domElement = document.createElement("div");
        this.domElement.className = "qwToolbar";      
        this.drawingView = drawingView;
    }
    addTool(label, tool, tooltip){
        const button = new ToolbarToolButton(label, this.drawingView, tool, tooltip);
        this.domElement.append(button.domElement);
    }
    addAction(label,callback, tooltip){
        const button = new ToolbarActionButton(label, this.drawingView, callback, tooltip);
        this.domElement.append(button.domElement);
    }
    addLoadFile(label,callback, tooltip){
        const button = new ToolbarLoadFileAsJsonButton(label, this.drawingView, callback, tooltip);
        this.domElement.append(button.domElement);
    }
}

class ToolbarButton{
    domElement = null;
    constructor(label, tooltip=""){
        
        const htmlButton = document.createElement("input");
        htmlButton.setAttribute("type","button");
        htmlButton.setAttribute("value",label);
        htmlButton.setAttribute("title",tooltip);
        htmlButton.className = "qwToolbarButton";
        htmlButton.style = "margin-right:2px; height:1.8rem";
        this.domElement = htmlButton;
    }
}   

class ToolbarToolButton extends ToolbarButton{
    constructor(label, drawingView, tool, tooltip){
        super(label,tooltip);
        
        const changeTool = function(){
            drawingView.changeTool(tool);
        }
        this.domElement.addEventListener("click", changeTool,false);
    }

}

class ToolbarActionButton extends ToolbarButton{
    constructor(label, drawingView, callback, tooltip){
        super(label, tooltip);
        const callAction = function(){
            callback(drawingView)
        }
        this.domElement.addEventListener("click", callAction,false);
    }
}

class ToolbarLoadFileAsJsonButton extends ToolbarButton{
    constructor(label, drawingView, callback, tooltip){
        super(label, tooltip);
        this.domElement.setAttribute("type","file");
        const callAction = function(event){
            //guards
            if(event.target.files === undefined) {return};
            if(!event.target.files[0].type.match('application/json')){
                console.log("not a json file");
                return;
            }
            //read text file as JSON
            var reader = new FileReader();
            reader.readAsText(event.target.files[0]);
            reader.onload = function (event) {
               const resultString = reader.result;
               const resultJSON = JSON.parse(resultString)
               
               //finally, call the callback
               callback(drawingView,resultJSON);
            }
        }
        this.domElement.addEventListener("change", callAction,false);
    }
}

export {Toolbar, ToolbarActionButton, ToolbarToolButton, ToolbarLoadFileAsJsonButton}