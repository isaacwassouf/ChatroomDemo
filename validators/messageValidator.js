
function validate(message){
    return !isWhitepaces(message);
}


function isWhitepaces(message){
    return new RegExp("^[\\n\\t\\s]*$").test(message);
}

module.exports = validate;