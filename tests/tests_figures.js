import { NameFigureClassMapper } from "../NameFigureClassMapper.js";
import { nameFigureClassMap } from "../nameFigureClassMap.js";

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