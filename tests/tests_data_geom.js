import {Rect} from '../data/rect.js';
import {Point} from '../data/point.js';

//Note: I use .equal instead of propEqual here, since propEqual fails to work with native getters, it seems.

export const test_point = QUnit.module('point', function() {
    QUnit.test('create a point', function(assert) {
        const testPoint = new Point({x:10,y:11})
        assert.equal(testPoint.x, 10);
        assert.equal(testPoint.y, 11);
    });

    QUnit.test('add two  points', function(assert) {
        const testPoint1 = new Point({x:10,y:20});
        const testPoint2 = new Point({x:5, y:5});
        const addedPoint = testPoint1.add(testPoint2);
        assert.equal(addedPoint.x, 15);
        assert.equal(addedPoint.y, 25);
    });

    QUnit.test('substracts two  points', function(assert) {
        const testPoint1 = new Point({x:10,y:20});
        const testPoint2 = new Point({x:5, y:5});
        const subPoint = testPoint1.sub(testPoint2);
        assert.equal(subPoint.x,5)
        assert.equal(subPoint.y,15)
    });

    QUnit.test('getInverse', function(assert) {
        const testPoint1 = new Point({x:10,y:-20});
        const inversePoint = testPoint1.inverse();
        assert.equal(inversePoint.x,-10)
        assert.equal(inversePoint.y,20)
    });

    QUnit.test('offset From (alias sub)', function(assert) {
        const testPoint1 = new Point({x:10,y:20});
        const testPoint2 = new Point({x:5, y:5});
        const offsetToPoint = testPoint1.offsetFrom(testPoint2);
        assert.equal(offsetToPoint.x,5)
        assert.equal(offsetToPoint.y,15)
    });

    QUnit.test("offset functions: offset to", function(assert){
        const testPoint1 = new Point({x:10,y:20});
        const testPoint2 = new Point({x:5, y:5});
        const offsetFromPoint = testPoint1.offsetTo(testPoint2);
        assert.equal(offsetFromPoint.x,-5)
        assert.equal(offsetFromPoint.y,-15)
    })

    QUnit.test("serialization/deserialization to/from JSON", function(assert){
        const testPoint1 = new Point({x:10,y:20});
        const testJSON = testPoint1.toJSON();
        assert.propEqual(testJSON, {x:10,y:20});
        const testPoint2 = Point.fromJSON(testJSON);
        assert.equal(testPoint2.x,10)
        assert.equal(testPoint2.y,20)
    });
});

export const test_rect = QUnit.module('rect', function() {
    //creation
    QUnit.test('create a rect', function(assert) {
        const testRect = new Rect({x:10,y:11, width:12, height:13})
        assert.propEqual(testRect, {x:10,y:11, width:12, height:13});
    });

    //copy 
    QUnit.test('copy the rect', function(assert){
        const testRect = new Rect({x:10,y:11, width:12, height:13})
        const rectCopy = testRect.copy();
        assert.propEqual(testRect,rectCopy);
    })

    // get points
    QUnit.test('get position', function(assert) {
        const testRect = new Rect({x:10,y:11, width:12, height:13})
        const position = testRect.getPosition();
        assert.equal(position.x, 10);
        assert.equal(position.y, 11);
    });

    QUnit.test('get center', function(assert) {
        const testRect = new Rect({x:10,y:20, width:40, height:20})
        const center = testRect.getCenter();
        assert.equal(center.x, 30);
        assert.equal(center.y, 30);
    });

    QUnit.test('get corners', function(assert) {
        const testRect = new Rect({x:10,y:20, width:40, height:20})
        const corners = testRect.getCorners();

        assert.equal(corners.topRight.x, 50);
        assert.equal(corners.topRight.y, 20);

        assert.equal(corners.bottomRight.x, 50);
        assert.equal(corners.bottomRight.y, 40);

        assert.equal(corners.bottomLeft.x, 10);
        assert.equal(corners.bottomLeft.y, 40);

        assert.equal(corners.topLeft.x, 10);
        assert.equal(corners.topLeft.y, 20);
    });

    //manipulation
    QUnit.test('can be translated by a distance', function(assert) {
        const testRect = new Rect({x:10,y:20, width:40, height:20})
        const movedRect = testRect.movedCopy(new Point({x:4,y:8}));
        assert.propContains(movedRect, {x:14,y:28});
    });

    // Hit Testing
    QUnit.test('does it contain a point?', function(assert) {
        const rect = new Rect({x:10,y:20, width:40, height:20});

        const pointInRect     = new Point({x:11,  y:21});
        const pointOutOfRect1 = new Point({x:999, y:999});
        const pointOutOfRect2 = new Point({x:1,   y:1});

        assert.true( rect.enclosesPoint(pointInRect)    , "inside rect");
        assert.false(rect.enclosesPoint(pointOutOfRect1), "outside right-bottom");
        assert.false(rect.enclosesPoint(pointOutOfRect2), "outside left-top");
    });

    QUnit.test('overlapping recognition', function(assert) {
        const rect1 = new Rect({x:20,y:20, width:20, height:20});
        
        const rect2_inner   = new Rect({x:22,  y:22,  width:10, height:10});//1 surrounds 2
        const rect3_outer   = new Rect({x:10,  y:10,  width:40, height:40}); // 2 surrounds 1
        const rect4_partial = new Rect({x:25,  y:25,  width:20, height:20}); // 1,2 partial intersection
        const rect5_outside = new Rect({x:100, y:100, width:20, height:20}); // 2 totally outside 1

        assert.true(rect1.overlapsRect(rect2_inner));
        assert.true(rect1.overlapsRect(rect3_outer));
        assert.true(rect1.overlapsRect(rect4_partial));
        assert.false(rect1.overlapsRect(rect5_outside));
    });

    QUnit.test('containing recognition', function(assert) {
        const rect1 = new Rect({x:20,y:20, width:20, height:20});

        const rect2_inner = new Rect({x:22,y:22, width:10, height:10});//1 surrounds 2
        const rect3_outer = new Rect({x:10,y:10, width:40, height:40}); // 2 surrounds 1
        const rect4_partial = new Rect({x:25,y:25, width:20, height:20}); // 1,2 partial intersection
        const rect5_outside = new Rect({x:100, y:100, width:20, height:20}); // 2 totally outside 1

        assert.true( rect1.enclosesRect(rect2_inner), "rect 1 encloses 2");
        assert.false(rect1.enclosesRect(rect3_outer), "rect 1 does not  enclose 3 (but 3 does 1)");
        assert.false(rect1.enclosesRect(rect4_partial), "rect 1 does not enclose 4 (but intersects)");
        assert.false(rect1.enclosesRect(rect5_outside), "rect 1 does not enclode 4 (no intersection)");
    });

    QUnit.test('serialization deserialization', function(assert){
        const rect = new Rect({x:10,y:20, width:40, height:50});
        const rectJsonString = JSON.stringify(rect);
        const rectJson = JSON.parse(rectJsonString);
        assert.propEqual(rectJson, {x:10,y:20, width:40, height:50},"Json was stringified and correctly parsed");
        const revivedRect = Rect.fromJSON(rectJson);
        assert.equal(revivedRect.x,10);
        assert.equal(revivedRect.y,20);
        assert.equal(revivedRect.width,40);
        assert.equal(revivedRect.height,50);
    })
});