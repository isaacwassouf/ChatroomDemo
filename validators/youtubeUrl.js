
const validate = function(url="https://www.youtube.com/watch?v=pa00z_Bp2j4"){
    const placeholder = "(?:(?:https?):\\/\\/)?(?:(?:www|m)\\.)?(?:youtu(?:\\.be\\/|be\\.com\\/watch\\?v=)([a-zA-Z0-9_-]+))(?:&[a-zA-Z0-9_-]+=[a-zA-Z0-9_-]+)*";
    const pattern = new RegExp(placeholder);
    try{
        return pattern.exec(url)[1];
    }catch(e){
        return null;
    }
}

module.exports = validate;