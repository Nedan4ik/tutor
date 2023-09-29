const fs = require('fs');
const filePath = process.argv[2];
const obfFile = process.argv[3];
const myScript = fs.readFileSync(filePath, 'utf8');
const JavaScriptObfuscator = require('javascript-obfuscator')

const obfuscatedScript = JavaScriptObfuscator.obfuscate(myScript).getObfuscatedCode();

fs.writeFileSync(obfFile, obfuscatedScript)

console.log("code obfuscated!")