During the drag, handles and selection need to move along. How can I do this? The preview needs to look like actually dragging. 

- If I copy things to a preview layer… I could also display stuff at that preview layer! 
- OR I solve this via the view of the object and attach the controls etc. to it? 

…so if there are two collections of models: Document and previewModels, then
- all selected models become preview models (basically the models in selection are all copied/created/destroyed correspondingly)
- the other layers (selection overlay, handles) are still independent. They are positioned based on the previews, not based on the document. The document is updated whenever an action ends. 

------
NAMING: Should "children" be "enclosedFigures" or the like?  Children is not that descriptive and sounds strange: destroy children etc. 

------
Some classes are only instanciated once. Maybe I should just @type them and have them as object literals? 

Particularly the tools are a problem: Tools only need access to specific parts of the application: 

* The selection tool to the selection and the document (to test what is hit)
* the drag tool to selection (too see what to drag), the document (to change it) and the previews (to drag previews). 
* …

However, when they are not singletons (at the moment). I would usually just use javascript object literals BUT the mutual link to the toolManager is handled in the abstract class. But tools and instanciated in tools sometimes, and then any tool needs to know things  to setup _another_ tool. So that is bad, too. So currently I just cram all potentially needed things into the event object, since I can setup its factory centrally in the controller. Still, the best solution would be kind of a object literal that inherits without instanciation. I mean I could manually setup the prototype chain, but hmm. 

----
08.07 TODO: Implement the preview manager. Add it to app.js. Check if the preview view is still needed on mouseevent. 
09.07 NOTE: Implemented the preview manager. A problem of not coupling preview and selection together is that now, the preview's model is not updated when an element is dragged; it is only redrawn on reselection. Now, there might be several solutions to this: 
- Reintegrate the preview manager into the selection manager. Use the selected element as model for the preview view. Have a "temporary overwrite" to move the previewview somehow.
- Keep the preview manager separate. Use the selected model to as model to generate a previewview. Have a have a "temporary overwrite" to switch to use of the for the preview model via the preview manager.

----
The whole preview stuff is pretty complicated. I wonder, if I should rather go with a command/snapshot like variant: 
1) Action starts, a reset command is created
2) Action continues, the view is updated
3.a) Action ends correctly: A command is dispatched and added to the undo stack
3.b) Action ends incorrectly: The rest command is dispatched, not added to the undo stack. 

However, elements need to be lifted to top, too, so that might counter this. 

----
What if I mash everything together? Preview + Selection?
    - I only have preview when there is selection. I also only have handles if there is selection. The problem was that the preview/selection is not updated properly when I committed a change, but maybe I can just have a .reset() that I call whenever I commit? (or just listen to an event indicating a new command)
    - Maybe selection/preview handles everything but the document view layer?
What if I integrate showing the selection and the preview into the figure-view, somehow allowing to decorate it?

Add a function that checks on append if a figure is actually contained.

-----
Maybe child views are not correctly deleted recursively? Add a test for that…
I did not add a test for it because I had a hard time finding a good way to test
but I know the following: There are views added and older views not deleted
This means there keep being several views that have the same model
The differences in position probably come from the fact that the model tree and the view tree are out of snyc (?)

-----
as soon as there are top/left negative values in a view something has gone wrong
Added checks for positioning elements outside of their parents.

Found out stack management is wired. Seems the lazy hit test walk starts with low indices,
whereas my assumption would be that elements appended later are on front.
So I would need some backwards flatmap?

-----
Solved the stack management. 
17.7.: Check if Views on remove/un-append (not deletion!) of models are acutally un-drawn.  
17.7.: Seems to yield not results.
But I have found out how to trigger the problem: drag the same element twice!

----
I can reproduce it by appending/unappending/appending and then drawing. So I have a testcase. 

It seems to be connected to Event management. 
Somehow, on creation a view is created (l14) that listenes to a model (l13).
When the model is un-appended , the view (l14) should be removed. Its removal runs
When the model is re-appended, a new view is created (l20). 
When the model is un-appended again, the view l20 should be removed. However, l14 is removed *again*

That was nasty. Had a view around that was not properly disposed. It did not listenTo anything BUT it was called by a parent. That was a very confusing bug, since instead at the events of the thing itself, the problem was at the parent of the element

Stuff to consider:
* Default parameters `funct(param = 1) `
* Default values when destructuring: `const { photographer = 'Anonymous', title} = landscape;`
* "split" objects `const { aProperty, ...theRestOfIt} = myBigObject; 
* partials (and other func stuff) by returning ()=> functions

Try next: 
* Resize handles (make a time-line-diagramm for this to check mode switches; needs resize-tool)
* Different object types and view/model (non-)separation

Try later:
* Memento (safe state, restore)/Transaction (copy, try, commit)/Two-Phase-Commit

----

## HANDLES
TODO 23.07.24: find out where I would 1) draw the handle rects 2) keep them for collision checking
I think 1) On the selection layer and 2) register something of the selection layer as a collision checker. The checking algorithm would have a list of things to check, when it gets a "false" it goes to the next one. (Collidable?)

### pyHotDraw Handles

https://github.com/franciscodominguezmateos/pyHotDraw/blob/c1d38876783f943f7526665d7bae62f515f8809c/pyHotDraw/src/pyHotDraw/Tools/pyHSelectionTool.py#L29

* first try if a handle is hit, then try if a figure is hit. 
* `findHandle` and `findFigure` are part of the view object
* you can get a figures handles (figure.getHandles), though I would probably do selection.getHandles(figure)?
* there is an own handle class 
* handle class defines eventHandler methods
* …it seems each handler implements the tool methods aka is a tool, too? (well, it does not inherit, but implements the same interface) 

Class structure

AbstractHandle → ……Handle
Abstract methods: setView(self,view), getHandleSize(self)


### JHotdraw5
* " Handles know their owning figure and they provide methods to  locate the handle on the figure and to track changes.". Handle and tool are different Things BUT it seems that Events are handed to either tool or handle. (like: if(handleIsHit){callEventsOnThis = handle} else {callEventsOnThis = someTool}…
* uses intermediate trackers to handle drags of figures and handles. Trackers inherit from tool. I have no idea why they do this, since either tracker inherits from tool, not from a common tracker object. 
* Figures seem to be factories for handles: their handles method returns an array of handles

#### RUNNING HOTDRAW 5: 
* One needs to add the classpath (I dunno how, Intellij does this automatically)
* there are some parts of the code that use a variable called `enum`. This is a reserved work now, so it needs to be renamed like "myEnum" or so. 
* add `import CH.ifa.draw.framework.Painter;` to StandardDrawingView to resolve the conflict between two Painter objects (from CH.ifa and Swing, respectively. Explicit import wins, it seems.)
* I can run the "nothing app" 

#### Basic architecture
* DrawApplication  
  * implements DrawingEditor interface. DrawingEditor provide the view, the drawing, the current tool and can inform when a tool is done and when the selection changed.
  * DrawApplication connects view and drawing by using setDrawing(drawing) on view. 
* DrawingView is an instance of Swing’s JPanel and implements the DrawingView Interface. 
  * Its knows its editor (and thus its tool), 
  * allows to set a Drawing
  * provides an interface to the drawing to add and remove figures
  * Manages the selection
  * Manages events
  * Manage repainting
* Drawing 
  * itself is a composite figure
  * add and remove figures
  * Events about changes
  * Manage the drawing lock
* Figures
  * Have a drawBackground/DrawFrame class. I think this is due to the underlying graphic framework; HTML5 canvas does the same.
#### Drawing
* Background, Drawing, Handels via StandardDrawingView.drawAll()
* drawDrawing
* draw of composite Figure (since the drawing is one)
* AttributeFigure.draw (sets colors, it seems?)
* myFigureClass.draw()

* checkDamage


#### Drag
* standardDrawingView.mousePressed (store point, constraint point, checkDamage)
* SelectionTool.mouseDown
  * freezes View
  * if it is on a figure, but not on a handle, creates DragTracker
* tracker.mouseDown() stores downPoint handles changes selection (multiple when shift, switches selection when not selected before)
* 
#### Change and Invalidation
* Figure has willChange (which invalidates and sends a changeEvent with the size of the box+handles)
* Damages are accumulated via this sequence:
    * Figure is changed: before the change it calls `figure.willChange`, after the change it calls `figure.changed` so both rectangles get changed are marked for a change. The change creates an event that contains a rectangle that marks the invalidated area which gets passed to all the following calls.
    * both `figure.willChange` and `figure.changed` call `figure.invalidate`
    * …which calls `drawing.figureInvalidated`
    * …which will call `drawingView.drawingInvalidated`, which will add the changes to a damage property of the `drawingView`
    * the damage sits there until `drawingView.checkDamage` is called by a tool, usually because its work is done.
    * `drawingView.checkDamage` goes through all the accumulated damaged in the list in the damage property and calls repairDamage for each of the stored damages via their stored rectangles.

Soooo it seems that the trick to damage repaints is the following: 
* The manipulating event methods of DrawingView, mouse-down, -dragged and -released usually have the following sequence:
  1. Tool does stuff
  2. checkDamage (which leads to repaints)
Which means in the tool action, changes get tracked, but the redraw only happens at the end of the action. 

the invalidate method will be called (among other methods) by "willChange" and "Changed" . This is to invalidate the old position and the newPosition of the rectangle. 

The drawing lock is called by mousedown/mouseup, but it seems to be related to Java Threading

#### Initalization
* Most happens in DrawApplication. It implements DrawingEditor. It seems to hold everything that is not happening in the view window.
* An instance of DrawApplication, gets both view and drawing and sets the drawing at the view.
* In NothingApp (and probably other apps as well), the toolbar is created as:
    * A CreationTool gets a view and the object it creates (prototype pattern!)
    * A button is added to the toolbar via palette.add( this.createToolButton(icon, toolName, toolItself))
    * 


#### Load Files
DrawApplication loadDrawing!
`loadDrawing(StorageFormat restoreFormat, String file)` 
Storage format interface has a store and a restore method; the `StandardStorageFormat` implements this interface
The writing to disk is done by a class called "StorableOutput" and the reading "StorableInput"


### Commonalities

* Selection Tool: 
    * First try to find a handle, otherwise drag
    * There is a common variable that both handler or figure get assigned to. This valuable is later used to trigger the actions via a common interface.
* Handlers consist of three things:
    * Display-part 
        * draws the handle 
        * can tell if a point is in the handle
    * Tool-interface part
        * knows its figure (not selection!)
        * the even methods of down/drag…


### Differences between tools
* PyHotDraw assigns the handle or the figure directly to the variable used in other event handlers; jHotDraw uses an intermediate Drag-/Handle-Tracker that gets passed the view and the figure (for drag) or handle (for handle) (so instead of a tool-interface, it has an intermediate tracker-interface) 

# NOTE PATTERNS: 
* According to GoF book "composite" it can make sense to implement empty add/remove methods in the root class so that all tree parsing methods have the same interface. It seems less to be about extending the interface for composite but on providing a common interface for both leaf and tree objects and to define the _logic_ for composition on the composite object.  
* Chain of responsibility: All things need the "handleSomething" method. In the handle something method, you may do something and/or hand off to the next element (the container, the next in line etc.). I wonder if passing some sort of accumulator-parameter is common.

See https://ivtools.sourceforge.net/ivtools/doc/man3.1/Component.html, which can `Create` a component view  instance that is appropriate for the component subject given a view category; Views can also be `attach`ed and `detach`ed. Component views have a `update` `getParent`/ `setParent` and `getSubject` (a subject is the component)

Note to self: Dare to pass classes around instead of injecting instances (You can even pass a Null-Class without implementations for testing, which also works as a check that you don't rely on any specific classes behavior.)

## attributes
Seems the inheritance structure is usually:
`myFigure extends AttributeFigure extends AbstractFigure`
So I think I need to have a "figureUpdated" function. Might just be an attribute updated function?

Maybe I should have an attribute manager? 
I could use it via set("attribute", value), get("attribute")
as well as setPosition(…)

UPDATE: So in hotdraw, the AttributeFigure seems not to be about any attribute a figure can have. It is about the attributes that every figure has or can have like stroke, background color etc. 
Figure-specific attributes like the arc (see setArc) for RoundRectangleFigure are NOT AttributeFigure attributes

## Tools, Handles and Trackers

* Trackers are tools (they inherit from AbstractTool, not from AbstractTracker)
* Trackers seem only to be used by the SelectionTool
* Handlers only use by the selection tool. The event flow is View→SelectionTool → Tracker → Handle
* HandleTrackers know their handle and view (set in the SelectionTool  mouseDown)

Specific types of handlers:
* ResizeHandlers have several classes, 8, i.e. one for every direction, with their own resizing.

## TODOS 29.08.

So, probably the next todos are these:

1) Create a figure that: 
1.1) Has the view directly integrated
1.2) Has attributes
1.3) Has a toJSON

2) Programm "in order of execution" that is
2.1.) Create an "interactive View" and mock its properties 
2.2.) Slowly fill the properties 
2.3.) Pass interactive view to eventHandlers

## What happens in jHotDraw 7 when you: 
1) Create a figure
    1) Before that happens the tool is set up in DrawApplication Model: The creation tool is passed a new someFigure(), which then can be used as prototype for to be copy-ed.
    2) Mousedown
        1) Empties the selection
        2) It creates  and then fires a composite undoable event the first time (second time closes the event):
        3) It creates the figure from a prototype (in createFigure() )
        4) Sets position of the new figure
        5) adds it to the drawing
    3) When you drag, the figure is resizes
    4) Mouseup:
        1) If the figure has width/size 0 it is removed again
        2) Otherwise final size adjustment
        3) Figure added to selection
        4) createdFigure of tool is set to 0 again
        5) The undoable edit from mousedown is fired again
        6) ToolDone is fired. 
2) Resize a figure
3) Move a figure
    1) Select figure
        1) Via DelegateSelectionTool (inherits from Selection tool to handle doubleClicks etc., delegates to SelectionTool via super())
        2) SelectionTool MousePressed. If it cant find  a handle but a figure, it will create a new dragTracker.(There are different flavors of trackers). At the end, activate the tracker and call its mousePressed. The DragTracker then selects the figure (via view.addToSelection)
    2) Move the figure (in DragTracker mouseDragged)
        1) starts also via DelegationSelectionTool.mouseDragged and continues with SelectionTool.mouseDragged with a selection tracker (which was set on mouse down, see previous section)
        2) Get the View
        3) Create difference between the current position and the most recent position
        4) Create an affine transform from that difference
        5) apply the transform to selected figures (view.getSelectedFigures): a) register a willChange (increase changing depth, invalidate to fire an invalidateArea event for the curent figure area). The transform is done via a basic transform, so no change event is fired
        6) Who is interested in the event? 
        – figureChanged of all Handles of the figure
        - figureChanged of the DefaultDrawing, which invalidatesStortOrder and then fires an AreaInvalidated

4) move a handle (like the one for round corners)
5) Edit a text
6) Changes to a figure in general?
    1) WillChange() → "Informs that a figure is about to change something that affects the contents of its display box.", invalidate() and increases "changingDepth"
    2) AbstractFigure.invalidate() fires an AreaInvalidated with the bounds of the figure
    3) AbstractFigure.changed() either decreases changingDepth (when changing depth >1) OR validate()s the figure (aka redraws), fires a figureChanged and sets changingdepth to 0.

Every FigureEvent seems to carry an invalidated Area attribute as well as the attribute and its old and new value.  

## Redrawing and Changing the Size: 
* The selection management seems to work fine BUT the redrawing does not draw the handles upon ending the handle dragging, since handles are not redrawn while the ondrag marker is still true, and it is only false when any drag handling has ended so calling from within does not work. 
* 

## Versioning
I need some mechanism to match strings to a class
Ward mentioning: Version of classes for upgrades, so that class creation and the storage format is at least somewhat separate.

## Creating a new Object which might have subobjects (i.e. a composite)

Where would that happen?

* recreating a whole document from scratch starting with loading an array of top-level figures
    * Code: command, load and then maybe some function on `drawing` (like "load drawing", its opposite being drawing.toJSON)
* copy an existing figure for preview: figure.copy() on `drawingView`
* copy an existing figure for mere duplication, using a command (which knows the selected figure, drawingView and drawing) 
* after being called once, it figures will be copied by other figures. 

verdict: DONE before 10.12.24

## Disposing handles on unselection
Bug: Create a figure, select it, press undo. The handles still exist. Draw a handle. (bad state happens)

I assume this is based in not clearing selection and thus keeping to return a reference to the figure and its handles.
When would we need to clear selections?
- Delete object (don't worry about keeping the selection around, inkscape e.g. does not)
- We click somewhere else

## Next up: A mini editor and clicking a checkbox
### Mini editor
* Will happen on app layer (i.e. not canvas rendered but on the HTML)
* is an input field with a checkmark and a cancel next to it on it
* can be on-canvas placed
* triggered by double click on a text (should that be a handle? See "clicking the checkbox")

### clicking the checkbox
*  If you click on the checkbox it will be toggled without any additional UI. (This is inspired by whimsical, although other software might do the same)
* needs a checkbox figure (or a checkbox list?) 
* Needs some additional model of hit checking for on-figure controls (similar to handles, but not for dragging? Or maybe it is a handle but it does not do any dragging)

## Not exactly handles
What I need for being able to click the checkbox is: 
* graphical representation of a checkbox
* check if a click is "in" the representation
* influence the property of the figure i.e. switch the checkbox value from true to false
* it makes sense to bind graphical represenatation+ position checking together so I need to calculate the rectangle only once.
* like handles, they should be drawable, unlike handles, they resize with the document. 
* sooooo....
drawable(){ //OR I pass attributes like rect etc. and a separate toggle thingy?
  #figure
  #attribute
  constructur(outerRect, innerRectConstraints){

  }
  getRect()
  getConstraints()
  enclosesPoint()
  draw()
  eventHandlers()
}

### innerRectConstraints…
Use the following defintion to calculate an rect with absolute coordinates based on an outer rect and the constraints. 
vertical: top, width, bottom → define two, the one not specififed will be calculated
horizontal: left, height, right → define two, the one not specififed will be calculated

what this does not do is flipping the coordinates for RTL languages thought!

### Creating a checkboxlist
Attributes: Lable (for the whole list), array with lables for the points, selected option
Knows: figure-attributes, its own index. 


## sharing code, having interfaces
QUESTION: Since the subfigure shares a lot with figure, what could the object hierarchies be? What are the needed interfaces?`
Interfaces:
* Draggable → for handle, figure 
* Clickable → for a checkbox (might: composite)
* Drawable  → for handle, figure, subfigure (see: composite)
* Attributes → for figure 
* maybe Hoverable? → for all interactive things?
* Composable → for figure, maybe also subfigure. NOTE: composite handling for draw()
* Rect-able (has a rect, can be collision-checked)
* So we get: 
* mainFigure with draggable, composable, drawable, hoverable, attributable 
* subfigure with  clickable, composable, drawable, hoverable
* handle with draggable, drawable, hoverable
* so mainFigure and subfigure share: getRect(), draw(), composable, 
* All share: getRect(), draw()

MF  | SF
Y   | Y   getRect (absolute)
Y   | Y   getRelation (t,r,b,l,width, height) to outerFigure. Or maybe call this offsets?
Y   | Y   draw
Y   | Y   contains subfigures
Y   | ?   handles. Probably not [1] 
Y   | N   contains mainfigures
?   | ?   draw hover state? [2]
Y   | Y   React to doubleclick
Y   | N   Mutable Attributes 
N   | Y   "Knows" its own data it reflects (nth item in list)
Y   | Y   Constraints to main figure for resizes (ResizeContraint?)

[1] Knowing handles implies knowign drawingView and firing commands.
    So, no? Can I bind handle to a rect, though? (scrollbar.indicator.getRect()?)
[2] Probably not, we can let something else draw the hover state on top of things. 
    It would be better anyway, since I do not need to define it over and over again.

Parent figure of a main figure: always a mainFigure
Parent figure of a subfigure: always a Figure
 
## Attributes, again
Attributes manages data about the figure:  position, checked checkboxes, visibility…
Every attribute has a string-based key. 
this.attributes.get("key")
For now, I could also use "fake array keys": "checkbox-1", "checkbox-2"
 
 → checkbox: label, isChecked
 → radiobutton-list: label, buttons

 What does it mean if the list is a string:
 + I am selected
 I am unselected
 I am unselected

hasAttributeString<boolean>
getAttributeString<string>
setAttributeString(string)

Probably, the solution to my problem is creating a subFigureList-Class: It can toJSON and fromJSON, gets a JSON Array
It is a type of composite, in that it has a draw(), a enclosesPoint() etc. 

Remember that attributes need to be changed via a command that specifies which attribute to change

## How to change attributes

I think it is best to change attributes via handles that react to drag or click. This way all changes remain at "tool likes" (tools or handles) and not at the level of figures. The problem however might be that handles are only active when the figure is selected, making attribute changes need a double click if clicking.  

## Attribute Structure
* I guess it is the easiest to have flat attributes, like `entryLables:["foo","bar", "baz"]`, `selectedEntry:2` (would select "bar")
* Subfigures themselves might know their key and index?
* needed methods as taken from attributeFigure: getAttributes → array, set, get→value, hasAttribute→bool, 

## Reduce repetitive code between figuretpyes

* I guess a lot of JSON creation/reading can be delegated to an attributes-object
* Drawing can be delegated to subfigures

## TODO 
Refactor:
* CompositeFigure should be main figure class
* Maybe have figure as class for both mainfigure and subfigure?

New stuff
* Introduce a doubleclick-delegation → mouse event handling section in drawingView, basically like mouseDown, I guess (?). 
* create a subfigure object
* But first…
  * Create an Attributes-class (managing attributes internally)
  * Create a stable delegation of MainFigure to Attributes-class
  * Create a command to change attributes of figures: `new ChangeAttributeCommand(figure, drawingView, "attribute", "value")`
    * Maybe this is enough, maybe I need a "add entry", "delete entry" etc. 
    * btw. Backbone seems to work via ids that models know. Models do NOT know their position in a list (makes sense!)
  * Maybe this needs either primitive values OR their cast to JSON in case Rect or Point are used? (string, number as well as object literals do not have a native toJSON, so I could check)
  * Maybe I need an "lableList" and "selectableLableList" as Data Objects? They might be static, so they can be reconstructed from their JSON and manipulated? Might also be good for undo/redo not to nest changeable entities. 

Bugs
* Prevent drawing being dragged out of bounds
* prevent figures being dropped out of drawing

drawing.draw()
drawing.attributes()
drawing.subfigures

## How to move inner figures when I switch to a model that allows to set constraints?

Instead of setting moveBy from the containing figure I would need to "updateDependendRect".