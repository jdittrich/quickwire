import { NameFigureClassMapper } from "../NameFigureClassMapper.js";
import { RectFigure } from "../figures.js";
import { nameFigureClassMap } from "../nameFigureClassMap.js";

const figureAbstractClass = QUnit.module('Abstract Figure Class', function(){
    const createFigure = function(){
        return new RectFigure({
            x: 10,
            y: 20,
            width:300,
            height:400
        });
    }

    // get position
    // set position
    // movePositionBy
    //visibility
    //container offsets
})

// composite figure methods

const rectFigureSerialization = QUnit.module('rectFigureSerialization', function(){
    const nameFigureClassMapper = new NameFigureClassMapper()
    nameFigureClassMapper.registerFromObject(nameFigureClassMap);
    
    QUnit.test("JSON roundtrip", (assert)=>{
        const rectFigureJSON = {
            type:"RectFigure",
            x: 10,
            y: 20,
            width: 40,
            height: 50,
            containedFigures:[
                {
                    type:"RectFigure",
                    x: 12,
                    y: 22,
                    width: 10,
                    height: 10,
                    containedFigures:[]
                },
                {
                    type:"RectFigure",
                    x: 24,
                    y: 34,
                    width: 10,
                    height: 10,
                    containedFigures:[]
                }
            ]
        };
        const FigureClass = nameFigureClassMapper.getClass(rectFigureJSON.type);
        const rectFigure = FigureClass.fromJSON(rectFigureJSON,nameFigureClassMapper);
        const generatedJson = rectFigure.toJSON();
        assert.propEqual(rectFigureJSON,generatedJson);
    });

    
});

export {rectFigureSerialization}