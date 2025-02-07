/**
 * Returns the name of value’s constructor
 * 
 * @param {*} value 
 * @returns {String}
 */
function getConstructorName(value){
    const constructorName = value.constructor.name; 
    return constructorName; 
}

export {getConstructorName}