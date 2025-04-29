"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSemantTokens = exports.convertAbstoRelTokens = exports.pushAbsGivenLength = exports.resetSemanticTokens = void 0;
const ast = require("./ast");
var tokensAbsolute = []; // [line, char, length, type, modifiers]
var tokensRelative = []; // [deltaLine, deltaStartChar, length, tokenType, tokenModifiers]
function resetSemanticTokens() {
    tokensAbsolute = [];
    tokensRelative = [];
}
exports.resetSemanticTokens = resetSemanticTokens;
//colours defined in "onInitialize" in server.ts
var Colours;
(function (Colours) {
    Colours[Colours["Keyword"] = 0] = "Keyword";
    Colours[Colours["Type"] = 1] = "Type";
    Colours[Colours["Function"] = 2] = "Function";
    Colours[Colours["Constant"] = 3] = "Constant";
    Colours[Colours["Variable"] = 4] = "Variable";
    Colours[Colours["String"] = 5] = "String";
    Colours[Colours["Process"] = 6] = "Process";
    Colours[Colours["Alias"] = 7] = "Alias";
    Colours[Colours["Comment"] = 8] = "Comment"; //green
})(Colours || (Colours = {}));
function pushAbsGivenLength(pos, length, tokenType, tokenMods) {
    tokensAbsolute.push([pos.line, pos.offset, length, tokenType, tokenMods]);
}
exports.pushAbsGivenLength = pushAbsGivenLength;
function pushAbsGivenRange(startPos, endPos, tokenType, tokenMods) {
    const length = endPos.offset - startPos.offset;
    tokensAbsolute.push([startPos.line, startPos.offset, length, tokenType, tokenMods]);
}
// tokensabs: [line, char, length, type, modifiers]
// tokensrel: [deltaLine, deltaStartChar, length, tokenType, tokenModifiers]
function convertAbstoRelTokens() {
    tokensAbsolute = [...tokensAbsolute].sort((x, y) => sortPosition(x, y)); //sort by position
    tokensRelative[0] = tokensAbsolute[0].slice(0);
    tokensRelative[0][0] = 0; //it requires we start on line "0"
    for (var i = 1; i < tokensAbsolute.length; i++) {
        const isNewline = tokensAbsolute[i][0] != tokensAbsolute[i - 1][0];
        const deltaLine = tokensAbsolute[i][0] - tokensAbsolute[i - 1][0];
        const deltaChar = isNewline ? tokensAbsolute[i][1] : tokensAbsolute[i][1] - tokensAbsolute[i - 1][1];
        tokensRelative[i] = [deltaLine, deltaChar, tokensAbsolute[i][2], tokensAbsolute[i][3], tokensAbsolute[i][4]];
    }
    return tokensRelative;
}
exports.convertAbstoRelTokens = convertAbstoRelTokens;
//Used to sort tokensAbsolute
function sortPosition(t1, t2) {
    if (t1[0] < t2[0]) {
        return -1;
    }
    else if (t1[0] > t2[0]) {
        return 1;
    }
    else if (t1[1] < t2[1]) {
        return -1;
    }
    else if (t1[1] > t2[1]) {
        return 1;
    }
    return 0;
}
//gets the (non-comment) semantic tokens from the file and puts them in tokensAbsolute
function getSemantTokens(node) {
    for (const block of node.blocks) {
        if (block.kind == null) {
            continue;
        }
        switch (block.kind) {
            case ast.ASTKinds.Block_Include: {
                const Block = block;
                pushAbsGivenLength(Block.keywordPos, 8, Colours.Keyword, 0);
                for (const include of Block.includes) {
                    pushAbsGivenRange(include.posS, include.posE, Colours.String, 0);
                }
                break;
            }
            case ast.ASTKinds.Block_Type: {
                const Block = block;
                pushAbsGivenLength(Block.keywordPos, 5, Colours.Keyword, 0);
                for (const type of Block.types) {
                    parseType(type);
                }
                break;
            }
            case ast.ASTKinds.Block_Variable: {
                const Block = block;
                pushAbsGivenLength(Block.keywordPos, 9, Colours.Keyword, 0);
                for (const vari of Block.vars) {
                    parseVariable(vari);
                }
                break;
            }
            case ast.ASTKinds.Block_Constant: {
                const Block = block;
                pushAbsGivenLength(Block.keywordPos, 9, Colours.Keyword, 0);
                for (const con of Block.consts) {
                    parseConstant(con);
                }
                break;
            }
            case ast.ASTKinds.Block_Function: {
                const Block = block;
                pushAbsGivenLength(Block.keywordPos, 9, Colours.Keyword, 0);
                for (const func of Block.funcs) {
                    parseFunction(func);
                }
                break;
            }
            case ast.ASTKinds.Block_Process: {
                const Block = block;
                if (Block.definedAsProc) {
                    pushAbsGivenLength(Block.keywordPos, 4, Colours.Keyword, 0);
                }
                else {
                    pushAbsGivenLength(Block.keywordPos, 9, Colours.Keyword, 0);
                }
                for (const proc of Block.procs) {
                    parseProcess(proc);
                }
                break;
            }
            case ast.ASTKinds.Block_Alias: {
                const Block = block;
                pushAbsGivenLength(Block.keywordPos, 7, Colours.Keyword, 0);
                for (const alias of Block.aliases) {
                    switch (alias.kind) {
                        case ast.ASTKinds.Alias_Data: {
                            const Alias = alias;
                            parseAliasData(Alias);
                            break;
                        }
                        case ast.ASTKinds.Alias_List: {
                            const Alias = alias;
                            parseAliasList(Alias);
                            break;
                        }
                    }
                }
                break;
            }
        }
    }
}
exports.getSemantTokens = getSemantTokens;
function parseType(node) {
    pushAbsGivenRange(node.posS, node.posE, Colours.Type, 0);
    parseTypeExpr(node.typeExpr);
}
function parseTypeExpr(te) {
    if (te == null) {
        return;
    }
    switch (te.kind) {
        case ast.ASTKinds.TE_Brack: {
            const TE = te;
            parseTypeExpr(TE.typeExpr);
            break;
        }
        case ast.ASTKinds.TE_Pow: {
            const TE = te;
            pushAbsGivenLength(TE.pos, 3, Colours.Type, 0);
            parseTypeExpr(TE.typeExpr);
            break;
        }
        case ast.ASTKinds.TE_Array: {
            const TE = te;
            parseTypeExpr(TE.typeExpr);
            break;
        }
        case ast.ASTKinds.TE_Name: {
            const TE = te;
            pushAbsGivenRange(TE.posS, TE.posE, Colours.Type, 0);
            break;
        }
        case ast.ASTKinds.TE_FuncFull: {
            const TE = te;
            parseTypeExpr(TE.left);
            parseTypeExpr(TE.right);
            break;
        }
        case ast.ASTKinds.TE_FuncPart: {
            const TE = te;
            parseTypeExpr(TE.left);
            parseTypeExpr(TE.right);
            break;
        }
        case ast.ASTKinds.TE_Product: {
            const TE = te;
            for (const child of TE.children) {
                parseTypeExpr(child);
            }
            break;
        }
    }
}
function parseConstant(con) {
    if (con.typeDeclaredFirst) {
        parseTypeExpr(con.typeExpr);
        pushAbsGivenRange(con.posS, con.posE, Colours.Constant, 0);
    }
    else {
        pushAbsGivenRange(con.posS, con.posE, Colours.Constant, 0);
        parseTypeExpr(con.typeExpr);
    }
}
function parseVariable(vari) {
    if (vari.typeDeclaredFirst) {
        parseTypeExpr(vari.typeExpr);
        pushAbsGivenRange(vari.posS, vari.posE, Colours.Variable, 0);
    }
    else {
        pushAbsGivenRange(vari.posS, vari.posE, Colours.Variable, 0);
        parseTypeExpr(vari.typeExpr);
    }
}
function parseFunction(func) {
    pushAbsGivenRange(func.posS, func.posE, Colours.Function, 0);
    parseTypeExpr(func.sigType);
    parseTypeExpr(func.outType);
}
function parseProcess(proc) {
    pushAbsGivenRange(proc.posS, proc.posE, Colours.Process, 0);
    for (const arg of proc.argInfo) {
        parseProcArg(arg);
    }
    parseProcExp(proc.proc);
}
function parseProcArg(procarg) {
    switch (procarg.argType) {
        case ast.ASTKinds.Variable: {
            pushAbsGivenRange(procarg.posS, procarg.posE, Colours.Variable, 0);
            break;
        }
        case ast.ASTKinds.Alias_List: {
            pushAbsGivenRange(procarg.posS, procarg.posE, Colours.Alias, 0);
            break;
        }
    }
}
function parseProcExp(procexp) {
    if (procexp.kind == null) {
        return;
    }
    switch (procexp.kind) {
        case ast.ASTKinds.SPE_Guard: {
            const Procexp = procexp;
            parseDataExp(Procexp.dataExp);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Assign: {
            const Procexp = procexp;
            pushAbsGivenRange(Procexp.nameStart, Procexp.varStart, Colours.Variable, 0);
            parseDataExp(Procexp.dataExpAssign);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Unicast: {
            const Procexp = procexp;
            pushAbsGivenLength(Procexp.start, 7, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExpL);
            parseDataExp(Procexp.dataExpR);
            parseProcExp(Procexp.procA);
            parseProcExp(Procexp.procB);
            break;
        }
        case ast.ASTKinds.SPE_Broadcast: {
            const Procexp = procexp;
            pushAbsGivenLength(Procexp.start, 9, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExp);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Groupcast: {
            const Procexp = procexp;
            pushAbsGivenLength(Procexp.start, 9, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExpL);
            parseDataExp(Procexp.dataExpR);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Send: {
            const Procexp = procexp;
            pushAbsGivenLength(Procexp.start, 4, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExp);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Deliver: {
            const Procexp = procexp;
            pushAbsGivenLength(Procexp.start, 7, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExp);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Receive: {
            const Procexp = procexp;
            pushAbsGivenLength(Procexp.start, 7, Colours.Keyword, 0);
            pushAbsGivenRange(Procexp.namePos, Procexp.nameEnd, Colours.Process, 0);
            for (const de of Procexp.dataExps) {
                parseDataExp(de);
            }
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Call: {
            const Procexp = procexp;
            pushAbsGivenRange(Procexp.posS, Procexp.posE, Colours.Process, 0);
            if (Procexp.args == null) {
                return;
            }
            for (const de of Procexp.args) {
                parseDataExp(de);
            }
            break;
        }
        case ast.ASTKinds.SPE_Choice: {
            const Procexp = procexp;
            parseProcExp(Procexp.left);
            parseProcExp(Procexp.right);
            break;
        }
    }
}
function parseDataExp(de) {
    //what this would be now is - if name then give colour based on type, else recursive call
    if (de.kind == null) {
        return;
    }
    switch (de.kind) {
        case ast.ASTKinds.DE_Singleton: {
            const DE = de;
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Partial: {
            const DE = de;
            pushAbsGivenRange(DE.posS, DE.posE, Colours.Variable, 0);
            parseDataExp(DE.left);
            parseDataExp(DE.right);
            break;
        }
        case ast.ASTKinds.DE_Set: {
            const DE = de;
            pushAbsGivenRange(DE.posS, DE.posE, Colours.Variable, 0);
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Lambda: {
            const DE = de;
            pushAbsGivenLength(DE.startPos, 6, Colours.Keyword, 0);
            pushAbsGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0);
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Forall: {
            const DE = de;
            pushAbsGivenLength(DE.startPos, 6, Colours.Keyword, 0);
            pushAbsGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0);
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Exists: {
            const DE = de;
            pushAbsGivenLength(DE.startPos, 6, Colours.Keyword, 0);
            pushAbsGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0);
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Brack: {
            const DE = de;
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Function: {
            const DE = de;
            pushAbsGivenRange(DE.sigStart, DE.sigEnd, Colours.Function, 0);
            if (DE.arguments != null) {
                parseDataExp(DE.arguments);
            }
            else { //if there was a problem in parsing, use DE.dataExp as a backup
                parseDataExp(DE.dataExp);
            }
            break;
        }
        case ast.ASTKinds.DE_Tuple: {
            const DE = de;
            if (DE.dataExps == null) {
                return;
            }
            for (const param of DE.dataExps) {
                parseDataExp(param);
            }
            break;
        }
        case ast.ASTKinds.DE_Infix: {
            const DE = de;
            parseDataExp(DE.left);
            parseDataExp(DE.right);
            break;
        }
        case ast.ASTKinds.DE_Name: {
            const DE = de;
            if (DE.refersTo == null) {
                break;
            }
            switch (DE.refersTo) {
                case ast.ASTKinds.Constant:
                    pushAbsGivenRange(DE.posS, DE.posE, Colours.Constant, 0);
                    break;
                case ast.ASTKinds.Variable:
                    pushAbsGivenRange(DE.posS, DE.posE, Colours.Variable, 0);
                    break;
                case ast.ASTKinds.Function_Infix:
                    pushAbsGivenRange(DE.posS, DE.posE, Colours.Function, 0);
                    break;
                case ast.ASTKinds.Function_Prefix:
                    pushAbsGivenRange(DE.posS, DE.posE, Colours.Function, 0);
                    break;
                case ast.ASTKinds.Alias_Data:
                    pushAbsGivenRange(DE.posS, DE.posE, Colours.Alias, 0);
                    break;
                case ast.ASTKinds.Alias_List:
                    pushAbsGivenRange(DE.posS, DE.posE, Colours.Alias, 0);
                    break;
            }
        }
    }
}
function parseAliasData(alias) {
    pushAbsGivenRange(alias.posS, alias.posE, Colours.Alias, 0);
    parseDataExp(alias.dataExp);
}
function parseAliasList(alias) {
    pushAbsGivenRange(alias.posS, alias.posE, Colours.Alias, 0);
    for (var i = 0; i < alias.argsPosE.length; i++) {
        pushAbsGivenRange(alias.argsPosS[i], alias.argsPosE[i], Colours.Variable, 0);
    }
}
//# sourceMappingURL=semanticTokens.js.map