//不是的部分

function isNotValidString (value){
    return typeof value !== "string" || value.trim().length === 0 || value === ""
}
function isNotValidInteger (value){
    return typeof value !== "number" || value < 0 || value %1 !==0
}

function isValidPassword (value){
    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
    return passwordPattern.test(value);
}

//是的部分

function isValidImage (value){
    const validFormat = [".png", ".jpg"];
    const imageFormat = value.split(".").pop().toLowerCase;
    return validFormat.includes(".${imageFormat}")
}

function isValidWebsite (value){
    return value.startsWith("http");
}

function isValidTimestamp(value){
    const validDate = new Date(value);
    return !isNaN(validDate.getTime());
}

function isUndefined (value) {
    return value === undefined
}

module.exports = {
    isNotValidInteger, 
    isNotValidString,
    isValidPassword,
    isValidImage,
    isValidWebsite,
    isValidTimestamp,
    isUndefined
} 