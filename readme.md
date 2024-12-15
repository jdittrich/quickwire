## QuickWire

### Purpose 

QuickWire is a prototype for a small wireframing app to facilitate conversations about UI design. If figma or penpot are tools to create blueprints, QuickWire is for felt-pen sketches on a mid-sized sticky note. 

### Architecture
Old fashioned Object oriented programming.

 Very much influenced by HotDraw, particularly [jHotdraw 5](https://gist.github.com/jdittrich/c31185cd3667e4d48864b902a983e3d0). Other influences: The case study of the GoF Design Pattern book, [Draw2D.js](https://freegroup.github.io/draw2d/index.html).

Currently (Dec. 2024) I do not use the [observer pattern](https://refactoring.guru/design-patterns/observer) since so far there are e.g. no multiple views or the like. Most other patterns existing in HotDraw 5 are used.

### Technology

Modern (ES6+) JavaScript. 

### Libraries

* [glMatrix](https://glmatrix.net/)




