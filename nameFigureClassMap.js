import { RectFigure } from "./figures/rectFigure.js";
import { ButtonFigure } from "./figures/buttonFigure.js";
import { RadioButtonListFigure } from "./figures/radioButtonListFigure.js"

const nameFigureClassMap = {
    "RectFigure"  :RectFigure,
    "ButtonFigure": ButtonFigure,
    "RadioButtonListFigure":RadioButtonListFigure,
}

export {nameFigureClassMap};