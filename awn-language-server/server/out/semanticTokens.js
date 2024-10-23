"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSemantTokens = void 0;
const parser_1 = require("./parser");
var tokens = [];
var curLine = 0;
var curOffset = 0;
function pushAndUpdate(absoluteLine, absolutePos, length, tokenType, tokenMods) {
    const isNewline = (absoluteLine - 1 - curLine !== 0);
    const token = [absoluteLine - 1 - curLine, isNewline ? absolutePos : absolutePos - curOffset, length, tokenType, tokenMods];
    tokens.push(token);
    curLine = absoluteLine - 1;
    curOffset = absolutePos;
}
var Colours;
(function (Colours) {
    Colours[Colours["Keyword"] = 0] = "Keyword";
    Colours[Colours["Type"] = 1] = "Type";
    Colours[Colours["Function"] = 2] = "Function";
    Colours[Colours["Variable"] = 3] = "Variable";
    Colours[Colours["Constant"] = 4] = "Constant";
    Colours[Colours["Number"] = 5] = "Number";
    Colours[Colours["String"] = 6] = "String";
    Colours[Colours["Parameter"] = 7] = "Parameter";
    Colours[Colours["Process"] = 8] = "Process";
})(Colours || (Colours = {}));
//semantic tokens documentation:
//[deltaLine, deltaStartChar, length, tokenType, tokenModifiers]
//NOTES:
//the correct offset may be +/- 1 from block.pos.offset, have to experiment bc idk what block.pos.offset's behaviour is
function getSemantTokens(node) {
    tokens = [];
    curLine = 0;
    curOffset = 0;
    for (const block of node.block) {
        switch (block.kind) {
            case parser_1.ASTKinds.Block_1: { //multiple includes
                pushAndUpdate(block.pos.line, block.pos.offset, 8, Colours.Keyword, 0);
                for (const include of block.include) {
                    pushAndUpdate(include.posS.line, include.posS.offset, include.posE.offset - include.posS.offset, Colours.String, 0);
                }
                break;
            }
            case parser_1.ASTKinds.Block_2: { //singlular include
                pushAndUpdate(block.pos.line, block.pos.offset, 7, Colours.Keyword, 0);
                const include = block.include;
                pushAndUpdate(include.posS.line, include.posS.offset, include.posE.offset - include.posS.offset, Colours.String, 0);
                break;
            }
            case parser_1.ASTKinds.Block_3: { //types
                pushAndUpdate(block.pos.line, block.pos.offset, 5, Colours.Keyword, 0);
                for (const type of block.type) {
                    parseType(type);
                }
                break;
            }
            case parser_1.ASTKinds.Block_4: { //variables
                pushAndUpdate(block.pos.line, block.pos.offset, 9, Colours.Keyword, 0);
                for (const vari of block.var) {
                    parseConVar(vari, true);
                }
                break;
            }
            case parser_1.ASTKinds.Block_5: { //constants
                pushAndUpdate(block.pos.line, block.pos.offset, 9, Colours.Keyword, 0);
                for (const con of block.const) {
                    parseConVar(con, false);
                }
                break;
            }
            case parser_1.ASTKinds.Block_6: { //functions
                pushAndUpdate(block.pos.line, block.pos.offset, 9, Colours.Keyword, 0);
                for (const func of block.func) {
                    parseFunction(func);
                }
                break;
            }
            case parser_1.ASTKinds.Block_7: { //multiple processes
                pushAndUpdate(block.pos.line, block.pos.offset, 9, Colours.Keyword, 0);
                for (const proc of block.proc) {
                    parseProcess(proc);
                }
                break;
            }
            case parser_1.ASTKinds.Block_8: { //singular process
                pushAndUpdate(block.pos.line, block.pos.offset, 4, Colours.Keyword, 0);
                parseProcess(block.proc);
                break;
            }
        }
    }
    return tokens.flat();
}
exports.getSemantTokens = getSemantTokens;
function parseType(node) {
    pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Type, 0);
    if (node.typeExprW !== null) {
        parseTypeExpr(node.typeExprW.typeExpr);
    }
}
function parseTypeExpr(node) {
    switch (node.kind) {
        case parser_1.ASTKinds.TE_1: { //brackets
            parseTypeExpr(node.typeExpr);
            if (node.typeExprMore !== null) {
                parseTypeExpr(node.typeExprMore);
            }
            break;
        }
        case parser_1.ASTKinds.TE_2: { //pow
            pushAndUpdate(node.pos.line, node.pos.offset, 3, Colours.Type, 0);
            parseTypeExpr(node.typeExpr);
            if (node.typeExprMore !== null) {
                parseTypeExpr(node.typeExprMore);
            }
            break;
        }
        case parser_1.ASTKinds.TE_3: { //list
            parseTypeExpr(node.typeExpr);
            if (node.typeExprMore !== null) {
                parseTypeExpr(node.typeExprMore);
            }
            break;
        }
        case parser_1.ASTKinds.TE_4: { //name
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Type, 0);
            if (node.typeExprMore !== null) {
                parseTypeExpr(node.typeExprMore);
            }
            break;
        }
        case parser_1.ASTKinds.TE1_1: { //function
            parseTypeExpr(node.typeExpr);
            if (node.typeExprMore !== null) {
                parseTypeExpr(node.typeExprMore);
            }
            break;
        }
        case parser_1.ASTKinds.TE1_2: { //partial function
            parseTypeExpr(node.typeExpr);
            if (node.typeExprMore !== null) {
                parseTypeExpr(node.typeExprMore);
            }
            break;
        }
        case parser_1.ASTKinds.TE1_3: { //product
            if (node.typeExprMore !== null) {
                parseTypeExpr(node.typeExprMore);
            }
            break;
        }
    }
}
function parseConVar(node, isVar) {
    switch (node.kind) {
        case parser_1.ASTKinds.ConVar_1: {
            parseTypeExpr(node.typeExpr);
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, isVar ? Colours.Variable : Colours.Constant, 0);
            for (const namesMore of node.namesMore) {
                pushAndUpdate(namesMore.posS.line, namesMore.posS.offset, namesMore.posE.offset - namesMore.posS.offset, isVar ? Colours.Variable : Colours.Constant, 0);
            }
        }
        case parser_1.ASTKinds.ConVar_2: {
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, isVar ? Colours.Variable : Colours.Constant, 0);
            parseTypeExpr(node.typeExpr);
        }
    }
}
function parseFunction(node) {
    switch (node.kind) {
        case parser_1.ASTKinds.Function_1: { //not infix
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Function, 0);
            parseTypeExpr(node.typeExpr);
            break;
        }
        case parser_1.ASTKinds.Function_2: { //infix
            //TODO add infix functionality
            break;
        }
    }
}
function parseProcess(node) {
    switch (node.kind) {
        case parser_1.ASTKinds.Process_1: {
            pushAndUpdate(node.pos1S.line, node.pos1S.offset, node.pos1E.offset - node.pos1S.offset, Colours.Process, 0);
            if (node.argFirst !== null) {
                pushAndUpdate(node.pos2S.line, node.pos2S.offset, node.pos2E.offset - node.pos2S.offset, Colours.Parameter, 0);
            }
            for (const namesMore of node.argsMore) {
                pushAndUpdate(namesMore.posS.line, namesMore.posS.offset, namesMore.posE.offset - namesMore.posS.offset, Colours.Parameter, 0);
            }
            parseProcExp(node.proc);
            break;
        }
        case parser_1.ASTKinds.Process_2: {
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Process, 0);
            parseProcExp(node.proc);
            break;
        }
    }
}
function parseProcExp(node) {
    switch (node.kind) {
        case parser_1.ASTKinds.SPE_1: { //guard
            parseDataExp(node.dataExp);
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_2: {
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Variable, 0);
            for (const de of node.dataExpList) {
                parseDataExp(de.dataExp);
            }
            parseDataExp(node.dataExpAssignment);
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_3: {
            pushAndUpdate(node.pos.line, node.pos.offset, 7, Colours.Keyword, 0);
            parseDataExp(node.dataExpL);
            parseDataExp(node.dataExpR);
            parseProcExp(node.procL);
            parseProcExp(node.procR);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_4: {
            pushAndUpdate(node.pos.line, node.pos.offset, 9, Colours.Keyword, 0);
            parseDataExp(node.dataExp);
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_5: {
            pushAndUpdate(node.pos.line, node.pos.offset, 9, Colours.Keyword, 0);
            parseDataExp(node.dataExpL);
            parseDataExp(node.dataExpR);
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_6: {
            pushAndUpdate(node.pos.line, node.pos.offset, 4, Colours.Keyword, 0);
            parseDataExp(node.dataExp);
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_7: {
            pushAndUpdate(node.pos.line, node.pos.offset, 7, Colours.Keyword, 0);
            parseDataExp(node.dataExp);
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_8: {
            pushAndUpdate(node.pos.line, node.pos.offset, 7, Colours.Keyword, 0);
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Process, 0);
            for (const de of node.dataExpList) {
                parseDataExp(de.dataExp);
            }
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_9: {
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_10: {
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Function, 0);
            if (node.dataExpFirst !== null) {
                parseDataExp(node.dataExpFirst);
            }
            for (const de of node.dataExpW) {
                parseDataExp(de.dataExp);
            }
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE_11: {
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Process, 0);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
        case parser_1.ASTKinds.SPE1: {
            parseProcExp(node.proc);
            if (node.procMore !== null) {
                parseProcExp(node.procMore);
            }
            break;
        }
    }
}
function parseDataExp(node) {
    switch (node.kind) {
        case parser_1.ASTKinds.DE_1: {
            parseDataExp(node.dataExp);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE_2: {
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Parameter, 0);
            parseDataExp(node.dataExpLeft);
            parseDataExp(node.dataExpRight);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE_3: {
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Parameter, 0);
            parseDataExp(node.dataExpRight);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE_4: {
            pushAndUpdate(node.pos.line, node.pos.offset, 6, Colours.Keyword, 0);
            parseDataExp(node.dataExp);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE_5: {
            pushAndUpdate(node.pos.line, node.pos.offset, 6, Colours.Keyword, 0);
            parseDataExp(node.dataExp);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE_6: {
            pushAndUpdate(node.pos.line, node.pos.offset, 6, Colours.Keyword, 0);
            parseDataExp(node.dataExp);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE_7: {
            parseDataExp(node.dataExp);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE_8: {
            pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset - node.posS.offset, Colours.Parameter, 0);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE1_1: {
            parseDataExp(node.dataExp);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE1_2: {
            for (const de of node.dataExpW) {
                parseDataExp(de.dataExp);
            }
            break;
        }
        case parser_1.ASTKinds.DE1_3:
        case parser_1.ASTKinds.DE1_4:
        case parser_1.ASTKinds.DE1_5:
        case parser_1.ASTKinds.DE1_6:
        case parser_1.ASTKinds.DE1_7:
        case parser_1.ASTKinds.DE1_8:
        case parser_1.ASTKinds.DE1_9:
        case parser_1.ASTKinds.DE1_10:
        case parser_1.ASTKinds.DE1_11:
        case parser_1.ASTKinds.DE1_12: {
            parseDataExp(node.dataExp);
            if (node.dataExpMore !== null) {
                parseDataExp(node.dataExpMore);
            }
            break;
        }
        case parser_1.ASTKinds.DE1_13: break; //TODO add infix functionality
    }
}
//# sourceMappingURL=semanticTokens.js.map