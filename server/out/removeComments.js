"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSingleComments = exports.removeMultiComments = void 0;
//each token has {absLine, absPos, length, tokenType, tokenMods} so it can be put through semanticTokens.pushAndUpdate()
var semanticTokens = [];
function removeMultiComments(document, inComment) {
    var lines = document.split("\n");
    for (let row = 0; row < lines.length; row++) {
        if (inComment == false) {
            for (let col = 0; col < lines[row].length - 1; col++) {
                if (lines[row].slice(col, col + 1) == "{*") { //found a multi-line comment
                    lines[row] = lines[row].slice(0, col) + "\n";
                    semanticTokens.push([row, col, lines[row].length - col, 9, 0]);
                }
            }
        }
    }
    return document;
}
exports.removeMultiComments = removeMultiComments;
function removeSingleComments(document) {
    var lines = document.split("\n");
    for (let row = 0; row < lines.length; row++) {
        for (let col = 0; col < lines[row].length - 1; col++) {
            if (lines[row].slice(col, col + 1) == "--") { //found a single-line comment
                lines[row] = lines[row].slice(0, col) + "\n";
                semanticTokens.push([row, col, lines[row].length - col, 9, 0]);
            }
        }
    }
    return document;
}
exports.removeSingleComments = removeSingleComments;
//# sourceMappingURL=removeComments.js.map