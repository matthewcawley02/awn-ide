"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSemantTokens = void 0;
const ast = require("./ast");
var tokens = [];
var curLine = 0;
var curOffset = 0;
//node both pushAndUpdate functions only work properly if the highlighting remains on one line
//push and update, given a start and end position
function pushAndUpdate(startPos, endPos, tokenType, tokenMods) {
    const absoluteLine = startPos.line;
    const absolutePos = startPos.offset;
    const length = endPos.offset - startPos.offset;
    const isNewline = (absoluteLine - 1 - curLine !== 0);
    const token = [absoluteLine - 1 - curLine, isNewline ? absolutePos : absolutePos - curOffset, length, tokenType, tokenMods];
    tokens.push(token);
    curLine = absoluteLine - 1;
    curOffset = absolutePos;
}
//push and update, given a start position and a highlighting length
function pushAndUpdateGivenLength(startPos, length, tokenType, tokenMods) {
    const absoluteLine = startPos.line;
    const absolutePos = startPos.offset;
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
    Colours[Colours["Variable"] = 6] = "Variable";
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
    for (const block of node.blocks) {
        if (block.kind == null) {
            continue;
        }
        switch (block.kind) {
            case ast.ASTKinds.Block_Include: {
                const Block = block;
                pushAndUpdateGivenLength(Block.keywordPos, 8, Colours.Keyword, 0);
                for (const include of Block.includes) {
                    pushAndUpdate(include.posS, include.posE, Colours.String, 0);
                }
                break;
            }
            case ast.ASTKinds.Block_Type: {
                const Block = block;
                pushAndUpdateGivenLength(Block.keywordPos, 5, Colours.Keyword, 0);
                for (const type of Block.types) {
                    parseType(type);
                }
                break;
            }
            case ast.ASTKinds.Block_Variable: {
                const Block = block;
                pushAndUpdateGivenLength(Block.keywordPos, 9, Colours.Keyword, 0);
                for (const vari of Block.vars) {
                    parseVariable(vari);
                }
                break;
            }
            case ast.ASTKinds.Block_Constant: {
                const Block = block;
                pushAndUpdateGivenLength(Block.keywordPos, 9, Colours.Keyword, 0);
                for (const con of Block.consts) {
                    parseConstant(con);
                }
                break;
            }
            case ast.ASTKinds.Block_Function: {
                const Block = block;
                pushAndUpdateGivenLength(Block.keywordPos, 9, Colours.Keyword, 0);
                for (const func of Block.funcs) {
                    parseFunction(func);
                }
                break;
            }
            case ast.ASTKinds.Block_Process: {
                const Block = block;
                if (Block.definedAsProc) {
                    pushAndUpdateGivenLength(Block.keywordPos, 4, Colours.Keyword, 0);
                }
                else {
                    pushAndUpdateGivenLength(Block.keywordPos, 9, Colours.Keyword, 0);
                }
                for (const proc of Block.procs) {
                    parseProcess(proc);
                }
                break;
            }
        }
    }
    console.log("semantic tokens", tokens);
    return tokens.flat();
}
exports.getSemantTokens = getSemantTokens;
function parseType(node) {
    pushAndUpdate(node.posS, node.posE, Colours.Type, 0);
    parseTypeExpr(node.typeExpr);
}
function parseTypeExpr(te) {
    if (te.kind == null) {
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
            pushAndUpdateGivenLength(TE.pos, 3, Colours.Type, 0);
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
            pushAndUpdate(TE.posS, TE.posE, Colours.Type, 0);
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
    pushAndUpdate(con.posS, con.posE, Colours.Constant, 0);
    parseTypeExpr(con.typeExpr);
}
function parseVariable(vari) {
    pushAndUpdate(vari.posS, vari.posE, Colours.Variable, 0);
    parseTypeExpr(vari.typeExpr);
}
function parseFunction(func) {
    pushAndUpdate(func.posS, func.posE, Colours.Function, 0);
    parseTypeExpr(func.sigType);
    parseTypeExpr(func.outType);
}
function parseProcess(proc) {
    pushAndUpdate(proc.posS, proc.posE, Colours.Process, 0);
    for (const arg of proc.args) {
        pushAndUpdate(arg.posS, arg.posE, Colours.Variable, 0);
    }
    parseProcExp(proc.proc);
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
            parseDataExp(Procexp.dataExpAssign);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Unicast: {
            const Procexp = procexp;
            pushAndUpdateGivenLength(Procexp.start, 7, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExpL);
            parseDataExp(Procexp.dataExpR);
            parseProcExp(Procexp.procA);
            parseProcExp(Procexp.procB);
            break;
        }
        case ast.ASTKinds.SPE_Broadcast: {
            const Procexp = procexp;
            pushAndUpdateGivenLength(Procexp.start, 9, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExp);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Groupcast: {
            const Procexp = procexp;
            pushAndUpdateGivenLength(Procexp.start, 9, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExpL);
            parseDataExp(Procexp.dataExpR);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Send: {
            const Procexp = procexp;
            pushAndUpdateGivenLength(Procexp.start, 4, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExp);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Deliver: {
            const Procexp = procexp;
            pushAndUpdateGivenLength(Procexp.start, 7, Colours.Keyword, 0);
            parseDataExp(Procexp.dataExp);
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Receive: {
            const Procexp = procexp;
            pushAndUpdateGivenLength(Procexp.start, 7, Colours.Keyword, 0);
            pushAndUpdate(Procexp.namePos, Procexp.nameEnd, Colours.Process, 0);
            for (const de of Procexp.dataExps) {
                parseDataExp(de);
            }
            parseProcExp(Procexp.nextproc);
            break;
        }
        case ast.ASTKinds.SPE_Call: {
            const Procexp = procexp;
            pushAndUpdate(Procexp.posS, Procexp.posE, Colours.Process, 0);
            if (Procexp.args == null) {
                return;
            }
            for (const de of Procexp.args) {
                parseDataExp(de);
            }
            break;
        }
        case ast.ASTKinds.SPE_Name: {
            const Procexp = procexp;
            pushAndUpdate(Procexp.posS, Procexp.posE, Colours.Process, 0);
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
            pushAndUpdate(DE.posS, DE.posE, Colours.Parameter, 0);
            parseDataExp(DE.left);
            parseDataExp(DE.right);
            break;
        }
        case ast.ASTKinds.DE_Set: {
            const DE = de;
            pushAndUpdate(DE.posS, DE.posE, Colours.Parameter, 0);
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Lambda: {
            const DE = de;
            pushAndUpdateGivenLength(DE.startPos, 6, Colours.Keyword, 0);
            pushAndUpdateGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0);
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Forall: {
            const DE = de;
            pushAndUpdateGivenLength(DE.startPos, 6, Colours.Keyword, 0);
            pushAndUpdateGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0);
            parseDataExp(DE.dataExp);
            break;
        }
        case ast.ASTKinds.DE_Exists: {
            const DE = de;
            pushAndUpdateGivenLength(DE.startPos, 6, Colours.Keyword, 0);
            pushAndUpdateGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0);
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
            pushAndUpdate(DE.sigPos, DE.argPos, Colours.Function, 0);
            if (DE.arguments != null) {
                parseDataExp(DE.arguments);
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
            if (DE.type == null) {
                break;
            }
            switch (DE.refersTo) {
                case ast.ASTKinds.Constant:
                    pushAndUpdate(DE.posS, DE.posE, Colours.Constant, 0);
                    break;
                case ast.ASTKinds.Variable:
                    pushAndUpdate(DE.posS, DE.posE, Colours.Variable, 0);
                    break;
                case ast.ASTKinds.Function_Infix:
                case ast.ASTKinds.Function_Prefix:
                    pushAndUpdate(DE.posS, DE.posE, Colours.Function, 0);
                    break;
            }
        }
    }
}
//# sourceMappingURL=semanticTokens.js.map