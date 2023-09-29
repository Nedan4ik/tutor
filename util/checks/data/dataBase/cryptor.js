function encrypt(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        const unreadableChar = String.fromCharCode(char.charCodeAt(0) + 1);
        result += unreadableChar;
    }
    return result;
}

function decrypt(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const unreadableChar = text.charAt(i);
        const char = String.fromCharCode(unreadableChar.charCodeAt(0) - 1);
        result += char;
    }
    return result;
}

module.exports = {
    encrypt,
    decrypt
}

