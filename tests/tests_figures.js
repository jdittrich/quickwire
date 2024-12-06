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
            width: 30,
            height: 40,
            containedFigures:[]
        };
        const FigureClass = nameFigureClassMapper.getClass(rectFigureJSON.type);
        const rectFigure = FigureClass.fromJSON(rectFigureJSON);
        const generatedJson = rectFigure.toJSON();
        assert.propEqual(rectFigureJSON,generatedJson);
    });

    
});

export {rectFigureSerialization}