import {Rect, Point} from "./geom.js";

/**
 * A predicate function that gets a Figure any other parameter and returns a boolean. E.g. check if figure contains a point
 * @typedef {function} FigurePredicate
 * @param {Figure} figure 
 * @param {*} predicateParameter - another parameter, e.g. a point or rect to check for collision
 * @returns {boolean} 
*/

/**
 * Walk a tree structure. Which branches are taken are based on the return value of a predicate function; 
 * if it returns *false*, the branch is not parsed further, the matching is thus "Lazy"; 
 * if it returns *true*,  the figure is pushed on an array and the array parsed further.
 * 
 * @param {Figure} rootFigure a figure (has .children array which can contain more figures)
 * @param {*} predicateParameter gets passed to figurePredicate
 * @param {FigurePredicate} figurePredicate funct(figure,predicateParameter) 
 * @returns {array} array of matched figures, starting with the outermost ancestor and ending with the innermost descendant  
 */
function figureWalkTreeLazy(rootFigure,predicateParameter,figurePredicate){
    if(!figurePredicate(rootFigure,predicateParameter)){ 
        // base condition;
        // !negation because we often check if something is NOT the case; 
        // the predicate function is often something like (figure,point) => figure.containsPoint(point)
        // return empty array so we can flatMap (see recursion condition)
        return [];
    } else { 
        //recursion condition
        //16.07.24: Array.toReversed here, so that late-in-stack (new figures are on top and appended at the end of the array) are matched earlier
        const submatches = rootFigure.getContainedFigures().toReversed().flatMap( //flatMap is why base condition returns []; the empty arrays disappear, so I don't need to filter out empty entries.
            childnode => figureWalkTreeLazy(childnode,predicateParameter,figurePredicate)
        );
        return [...submatches, rootFigure];
    }
}

//ready-to-use functions

/**
 * @param {DocumentView} the main view
 * @param {Point} a point in document coordinates
 * @params {Boolean} includeRoot
 * @returns {array} of figures under the point (or an empty array) starting with innermost matches
 * 
 */
function findFiguresBelowPoint(rootFigure,point, includeRoot){
    const matches = figureWalkTreeLazy(rootFigure,point,(figure,point)=>{
        const figureEnclosesPoint = figure.enclosesPoint(point)
        return figureEnclosesPoint;
    });
    if(!includeRoot){
        matches.pop(); //removes last element –  the root figure/document
    }
    
    return matches;
}

/**
 * @param {Figure} rootFigure - can be any figure, often the root of the whole document. 
 * @param {Figure} testRect - the figure that is enclosed
 * @returns {array} of figures enclosing the rect, starting with the innermost enclosing rect.
 */
function findEnclosingFigures(rootFigure,testRect){
    const enclosingFigures = figureWalkTreeLazy(rootFigure,testRect,(figure,testRect)=>{
        const isFigureEnclosingRect = figure.enclosesRect(testRect);
        return isFigureEnclosingRect;
    });

    return enclosingFigures;
}

/**
 * 
 * @param {Figure} rootFigure 
 * @param {Rect} enclosingRect for test
 * @returns a list of figures that the enclosingFigure encloses.
 * 
 * Example: 
 * figure 1 is the innermost figure enclosing testFigure, so the function checks
 * for figures contained in 1. 
 * Of the figures contained in 1, testFigure encloses 3,2 but not 4 
 * 
 * +-1-------------------------------------+
 * |                                       |
 * |      +-testFigure-ttttttttttttt+      |
 * |      t        +2-------+       t      |
 * |      t        |        |       t      |
 * |      t        |        |       t      |
 * |      t        +--------+    +4----+   |
 * |      t                      |  t  |   |
 * |      t   +3-------+         +-----+   |
 * |      t   |        |            t      |
 * |      t   +--------+            t      |
 * |      +ttttttttttttttttttttttttt+      |
 * |                                       |
 * +---------------------------------------+
 * 
 */
function findEnclosedFigures(rootFigure, enclosingRect){
    //find all figures that enclose the enclosingRect
    const enclosingFigures = findEnclosingFigures(rootFigure,enclosingRect,true);

    if(enclosingFigures.length === 0){
        return [] //no matches
    }
    
    //now, pick the innermost figure that encloses the enclosing Figure
    const innermostEnclosing = enclosingFigures[0];

    //check if any of the children of the innermost enclosing figure are fully inside the enclosingFigure
    const innerMatches = innermostEnclosing.getContainedFigures().filter((figure)=>{
        const rect = figure.getRect();
        const isMatch = enclosingRect.enclosesRect(rect);
        return isMatch; 
    });

    return innerMatches;
}

function findFiguresEnclosingAndEnclosed(rootFigure,testRect){
    const enclosingFigures = findEnclosingFigures(rootFigure,testRect);//all figures that fully enclose the testRect
    const innermostEnclosing = enclosingFigures[0]; //innermost enclosing figure

    //collects all figures that are contained in the innermostEnclosing figure and also enclosed by the testRect → should be added
    const innerMatches = innermostEnclosing.getContainedFigures().filter((figure)=>{ 
        const rect = figure.getRect();
        const isMatch = testRect.enclosesRect(rect);
        return isMatch;
    });

    return {
        "rectEnclosesFigures":innerMatches,
        "rectEnclosedByFigure":innermostEnclosing
    }
}


/**
 * @param {RectFigure} rootFigure 
 * @param {Rect} enclosedFigure 
 * @returns {array} of figures the rect encloses, starting with the innermost enclosing rect.
 * 
 * The algorithms is
 * 1) Check if the rectangle is *fully* with a figure and choose the innermost match
 * 2) Then within that match see if children are matching.
 * 
 * This means that:
 * –  If several figures are matched, they all belong to the same parent figure.
 * –  If a figure is only partially matched, it is not further parsed for child matches, 
 *    so there might be children of the partially matched figure that would be fully enclosed
 *    but not in the set of enclosed figures.
 * 
 * These limitations exist since otherwise we would need to regroup many elements and might accidentally do so. 
 * 
 */ 
// function findEnclosedFigures(rootFigure, enclosedFigure){
//     //find all figures enclosing 
//     const enclosingFigures = figureWalkTreeLazy(rootFigure,enclosedFigure,(figure,enclosedFigure)=>{
//         const figureContainsRect = figure.enclosesFigure(enclosedFigure)
//         return figureContainsRect;
//     })
    
//     if(enclosingFigures.length === 0){
//         return [] //no matches
//     }

//     const innermostEnclosing = enclosingFigures[0];
//     const innerMatches = innermostEnclosing.getChildren().filter(child=>enclosedFigure.containsRectangle(child.getRect()));

//     return innerMatches;
// }

export {figureWalkTreeLazy, findFiguresBelowPoint, findEnclosingFigures, findEnclosedFigures,findFiguresEnclosingAndEnclosed};