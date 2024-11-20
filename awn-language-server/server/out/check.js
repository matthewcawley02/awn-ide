"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Check = exports.InitialiseCheck = void 0;
const ast = require("./ast");
const vscode_languageserver_1 = require("vscode-languageserver");
var dummyParent; //I'd rather use the same AST nodes, but everything requires a parent. Use a dummy parent when the parent isn't actually necessary.
var types = [];
var variables = [];
var constants = [];
var functions = [];
var processes = [];
var aliases = [];
//objects which have been declared, but are invalid in some way. (so further references to them aren't marked as errors)
var invalidTypes = [];
var invalidVariables = [];
var invalidConstants = [];
var invalidFunctions = [];
var invalidProcesses = [];
var invalidAliases = [];
var errors = [];
function InitialiseCheck() {
    return;
}
exports.InitialiseCheck = InitialiseCheck;
function Check(root) {
    errors = [];
    dummyParent = root;
    //set up default objects (move to initialise later)
    types = [];
    variables = [];
    constants = [];
    functions = [];
    processes = [];
    aliases = [];
    invalidTypes = [];
    invalidVariables = [];
    invalidConstants = [];
    invalidFunctions = [];
    invalidProcesses = [];
    invalidAliases = [];
    const t1 = new ast.Type(dummyParent, "Bool");
    t1.typeExpr = new ast.TE_Name(t1, "Bool");
    types.push(t1);
    const t2 = new ast.Type(dummyParent, "DATA");
    t2.typeExpr = new ast.TE_Name(t2, "DATA");
    types.push(t2);
    const t3 = new ast.Type(dummyParent, "MSG");
    t3.typeExpr = new ast.TE_Name(t3, "MSG");
    types.push(t3);
    const t4 = new ast.Type(dummyParent, "IP");
    t4.typeExpr = new ast.TE_Name(t4, "IP");
    types.push(t4);
    const t5 = new ast.Type(dummyParent, "TIME");
    t5.typeExpr = new ast.TE_Name(t5, "TIME");
    types.push(t5);
    const v = new ast.Variable(dummyParent, "now");
    v.typeExpr = t5.typeExpr;
    variables.push(v);
    const c1 = new ast.Constant(dummyParent, "true");
    c1.typeExpr = t1.typeExpr;
    constants.push(c1);
    const c2 = new ast.Constant(dummyParent, "false");
    c1.typeExpr = t1.typeExpr;
    constants.push(c2);
    const booleanfunc = new ast.BTE_Function(dummyParent);
    booleanfunc.left = new ast.TE_Name(booleanfunc, "Bool");
    booleanfunc.right = new ast.TE_Name(booleanfunc, "Bool");
    booleanfunc.output = new ast.TE_Name(booleanfunc, "Bool");
    const f1 = new ast.Function_Infix(dummyParent, "&");
    f1.signature = booleanfunc;
    functions.push(f1);
    const f2 = new ast.Function_Infix(dummyParent, "|");
    f2.signature = booleanfunc;
    functions.push(f2);
    const f3 = new ast.Function_Infix(dummyParent, "->");
    f3.signature = booleanfunc;
    functions.push(f3);
    const f4 = new ast.Function_Infix(dummyParent, "<->");
    f4.signature = booleanfunc;
    functions.push(f4);
    const f5 = new ast.Function_Infix(dummyParent, "newpkt");
    f5.signature = new ast.BTE_Function(f5);
    booleanfunc.left = new ast.TE_Name(booleanfunc, "Data");
    booleanfunc.right = new ast.TE_Name(booleanfunc, "IP");
    booleanfunc.output = new ast.TE_Name(booleanfunc, "MSG");
    functions.push(f5);
    for (const block of root.blocks) {
        switch (block.kind) {
            case ast.ASTKinds.Block_Include: { //TODO
                break;
            }
            case ast.ASTKinds.Block_Type: {
                for (const typedec of block.types) {
                    if (usedNames().includes(typedec.typeName)) {
                        errors.push(createErrorMessage(100, 100, 100, 100, `Name "${typedec.typeName}" already defined previously.`));
                        continue;
                    }
                    const newTE = expandTypeExpression(typedec.typeExpr, typedec.typeName);
                    if (newTE != null) {
                        typedec.typeExpr = newTE;
                        types.push(typedec);
                    } //note: the above function handles adding to invalidTypes
                }
                break;
            }
            case ast.ASTKinds.Block_Variable: {
                for (var vari of block.vars) {
                    if (usedNames().includes(vari.name)) {
                        errors.push(createErrorMessage(100, 100, 100, 100, `Name "${vari.name}" already defined previously.`));
                        continue;
                    }
                    const newTE = expandTypeExpression(vari.typeExpr);
                    if (newTE != null) {
                        vari.typeExpr = newTE;
                        variables.push(vari);
                    }
                    else {
                        invalidVariables.push(vari.name);
                    }
                }
                break;
            }
            case ast.ASTKinds.Block_Constant: {
                for (var con of block.consts) {
                    if (usedNames().includes(con.name)) {
                        errors.push(createErrorMessage(100, 100, 100, 100, `Name "${con.name}" already defined previously.`));
                        continue;
                    }
                    const newTE = expandTypeExpression(con.typeExpr);
                    if (newTE != null) {
                        con.typeExpr = newTE;
                        constants.push(con);
                    }
                    else {
                        invalidVariables.push(con.name);
                    }
                }
                break;
            }
            case ast.ASTKinds.Block_Function: {
                for (var func of block.funcs) {
                    if (usedNames().includes(func.name)) {
                        errors.push(createErrorMessage(100, 100, 100, 100, `Name "${func.name}" already defined previously.`));
                        continue;
                    }
                    const newTE = expandTypeExpression(func.signature);
                    if (newTE != null) {
                        func.signature = newTE;
                        functions.push(func);
                    }
                    else {
                        invalidVariables.push(func.name);
                    }
                }
                break;
            }
            case ast.ASTKinds.Block_Alias: {
                for (const alias of block.aliases) {
                    switch (alias.kind) {
                        case ast.ASTKinds.Alias_Data: {
                        }
                    }
                }
                break;
            }
            case ast.ASTKinds.Block_Process: {
                for (const proc of block.procs) {
                    if (usedNames().includes(proc.name)) {
                        errors.push(createErrorMessage(100, 100, 100, 100, `Name "${proc.name}" already defined previously.`));
                        continue;
                    }
                    if (CheckSPE(proc)) {
                        processes.push(proc);
                    }
                    else {
                        invalidProcesses.push(proc.name);
                    }
                }
                break;
            }
        }
    }
    console.log("Semantic Information:", types, variables, constants, functions, processes, aliases, invalidTypes, invalidVariables, invalidConstants, invalidFunctions, invalidProcesses, invalidAliases);
    return errors;
}
exports.Check = Check;
//Expands out typeExp by replacing typenames with equivalents.
//If processing Type nodes (those found in a type block), include typeName so we can
//check circular definitions and add to invalidTypes if necessary.
//If any circular or undefined typenames are found, aborts and returns false.
//Otherwise, returns true (meaning success).
function expandTypeExpression(typeExp, typeName) {
    //if a name, replace with equivalent
    if (typeExp.kind == ast.ASTKinds.TE_Name) {
        //ensure no circular definition (only possible when typeName != null)
        if (typeName != null) {
            if (typeExp.typename == typeName) {
                //circular definition
                invalidTypes.push(typeName);
                errors.push(createErrorMessage(100, 100, 100, 100, `"${typeName}" contains a circular type definition.`));
                return null;
            }
        }
        const result = getTypeDefinition(typeExp.typename); //retrieve the equivalent
        if (result == null) {
            //nonexistent type referenced
            if (typeName != null) {
                invalidTypes.push(typeName);
            }
            return null;
        }
        else {
            //valid expansion returned; replace the typeExp with it
            typeExp = result;
            if (typeExp.kind != ast.ASTKinds.TE_Name) { //if the replacement was not just another typename, keep going
                for (var childTE of typeExp.children) {
                    const childResult = expandTypeExpression(childTE, typeName);
                    if (childResult == null) {
                        return null;
                    }
                    else {
                        childTE = childResult;
                    }
                }
            }
            return typeExp;
        }
    }
    else { //move on to children if not typename (there will be children if not typename, so don't need to check)
        var failure = false;
        for (var childTE of typeExp.children) {
            const childResult = expandTypeExpression(childTE, typeName);
            if (childResult == null) {
                failure = true;
            }
            else {
                childTE = childResult;
            }
        }
        if (failure) { //we check for failure afterwards rather than returning immediately so that this function can possibly find other errors further down the tree.
            return null;
        }
        else {
            return typeExp;
        }
    }
}
//Given a type name, returns its type definition.
//If the type has been declared but is invalid, returns 1.
//If the type doesn't exist, returns 0.
function getTypeDefinition(typeName) {
    var result;
    for (const type of types) {
        if (type.typeName == typeName) {
            return type.typeExpr;
        }
    }
    for (const type of invalidTypes) {
        if (type == typeName) {
            return null;
        }
    }
    errors.push(createErrorMessage(100, 100, 100, 100, `Nonexistent type "${typeName}" referenced.`));
    return null;
}
//TODO add case of VE[DE]
function getVariable(variableName) {
    var result;
    for (const vari of variables) {
        if (vari.name == variableName) {
            return vari;
        }
    }
    for (const vari of invalidVariables) {
        if (vari == variableName) {
            return null;
        }
    }
    errors.push(createErrorMessage(100, 100, 100, 100, `Nonexistent variable "${variableName}" referenced.`));
    return null;
}
function getFunction(functionName) {
    var result;
    for (const func of functions) {
        if (func.name == functionName) {
            return func;
        }
    }
    for (const func of invalidFunctions) {
        if (func == functionName) {
            return null;
        }
    }
    errors.push(createErrorMessage(100, 100, 100, 100, `Nonexistent function "${functionName}" referenced.`));
    return null;
}
//Evaluates and checks the data expression from the bottom up.
//Returns true if it is free of errors.
function CheckDataExpression(de) {
    switch (de.kind) {
        case ast.ASTKinds.DE_Singleton: {
            const DE = de;
            if (CheckDataExpression(DE.dataExp) == false) {
                return false;
            }
            DE.type = new ast.TE_Pow(dummyParent, DE.dataExp.type);
            return true;
        }
        case ast.ASTKinds.DE_Set: {
            const DE = de;
            if (CheckDataExpression(DE.dataExp) == false) {
                return false;
            }
            const v = getVariable(DE.name);
            if (v == null) {
                return false;
            }
            if (DE.dataExp.type.kind == ast.ASTKinds.TE_Name) {
                if (DE.dataExp.type.typename == "Bool") {
                    DE.type = new ast.TE_Pow(dummyParent, v.typeExpr);
                    return true;
                }
            }
            errors.push(createErrorMessage(100, 100, 100, 100, `Expected type "Bool" but got TODO.`));
            return false;
        }
        case ast.ASTKinds.DE_Partial: {
            const DE = de;
            if (CheckDataExpression(DE.left) == false || CheckDataExpression(DE.right) == false) {
                return false;
            }
            const v = getVariable(DE.name);
            if (v == null) {
                return false;
            }
            if (DE.right.type.kind == ast.ASTKinds.TE_Name) {
                if (DE.right.type.typename == "Bool") {
                    DE.type = new ast.TE_Partial(dummyParent, v.typeExpr, DE.left.type);
                    return true;
                }
            }
            errors.push(createErrorMessage(100, 100, 100, 100, `Expected type "Bool" but got TODO.`));
            return false;
        }
        case ast.ASTKinds.DE_Lambda: {
            const DE = de;
            if (CheckDataExpression(DE.dataExp) == false) {
                return false;
            }
            const v = getVariable(DE.name);
            if (v == null) {
                return false;
            }
            DE.type = new ast.TE_Function(dummyParent, v.typeExpr, DE.type);
        }
        case ast.ASTKinds.DE_Forall: {
            const DE = de;
            if (CheckDataExpression(DE.dataExp) == false) {
                return false;
            }
            const v = getVariable(DE.name);
            if (v == null) {
                return false;
            }
            if (DE.dataExp.type.kind == ast.ASTKinds.TE_Name) {
                if (DE.dataExp.type.typename == "Bool") {
                    DE.type = new ast.TE_Name(dummyParent, "Bool");
                    return true;
                }
            }
            errors.push(createErrorMessage(100, 100, 100, 100, `Expected type "Bool" but got TODO.`));
            return false;
        }
        case ast.ASTKinds.DE_Exists: {
            const DE = de;
            if (CheckDataExpression(DE.dataExp) == false) {
                return false;
            }
            const v = getVariable(DE.name);
            if (v == null) {
                return false;
            }
            if (DE.dataExp.type.kind == ast.ASTKinds.TE_Name) {
                if (DE.dataExp.type.typename == "Bool") {
                    DE.type = new ast.TE_Name(dummyParent, "Bool");
                    return true;
                }
            }
            errors.push(createErrorMessage(100, 100, 100, 100, `Expected type "Bool" but got TODO.`));
            return false;
        }
        case ast.ASTKinds.DE_Brack: {
            const DE = de;
            if (CheckDataExpression(DE.dataExp) == false) {
                return false;
            }
            DE.type = DE.dataExp.type;
            return true;
        }
        case ast.ASTKinds.DE_Name: {
            const DE = de; //assume function for now (also could be alias)
            const f = getFunction(DE.name);
            if (f == null) {
                return false;
            }
            DE.type = f.signature;
            return true;
        }
        case ast.ASTKinds.DE_Tuple: return true; //TODO
        case ast.ASTKinds.DE_Function: {
            const DE = de;
            if (CheckDataExpression(DE.left) == false) {
                return false;
            }
            if (CheckDataExpression(DE.right) == false) {
                return false;
            }
            //ensure left DE has function type
            if (![ast.ASTKinds.TE_Function, ast.ASTKinds.TE_Partial].includes(DE.left.kind)) {
                errors.push(createErrorMessage(100, 100, 100, 100, `Expected functional type but got TODO.`));
                return false;
            }
            switch (DE.left.kind) {
                case ast.ASTKinds.TE_Function: {
                    if (!AreIdenticalTypes(DE.left.type.left, DE.right.type)) {
                        errors.push(createErrorMessage(100, 100, 100, 100, `Function arguments don't match signature.`));
                        return false;
                    }
                }
                case ast.ASTKinds.TE_Partial: {
                    if (!AreIdenticalTypes(DE.left.type.left, DE.right.type)) {
                        errors.push(createErrorMessage(100, 100, 100, 100, `Function arguments don't match signature.`));
                        return false;
                    }
                }
            }
            DE.type = DE.right.type;
            return true;
        }
        case ast.ASTKinds.DE_Binary: {
            const DE = de;
            return true;
            if (CheckDataExpression(DE.left) == false) {
                return false;
            }
            if (CheckDataExpression(DE.right) == false) {
                return false;
            }
            //	const f = getFunction(DE.)
            //	if(f == null){return false}
            //	DE.type = (f as ast.Function).signature
        }
    }
    return false;
}
function CheckSPE(proc) {
    switch (proc.kind) {
        case ast.ASTKinds.SPE_Guard: {
            const DEType = proc.dataExp.type;
            if (DEType.kind == ast.ASTKinds.TE_Name) {
                return DEType.typename == "Bool"
                    && CheckSPE(proc.nextproc);
            }
            return false;
        }
        case ast.ASTKinds.SPE_Assign: {
            const Proc = proc;
            const result = getVariable(Proc.name);
            if (result == null) {
                return false;
            }
            else {
                Proc.variable = result;
            }
            return (AreIdenticalTypes(Proc.variable.typeExpr, Proc.dataExpAssign.type))
                && CheckSPE(Proc.nextproc);
        }
        case ast.ASTKinds.SPE_Unicast: {
            const Proc = proc;
            const DELType = Proc.dataExpL.type;
            const DERType = Proc.dataExpR.type;
            if (DELType.kind == ast.ASTKinds.TE_Name && DERType.kind == ast.ASTKinds.TE_Name) {
                return DELType.typename == "IP"
                    && DERType.typename == "MSG"
                    && CheckSPE(Proc.procA)
                    && CheckSPE(Proc.procB);
            }
            return false;
        }
        case ast.ASTKinds.SPE_Groupcast: {
            const Proc = proc;
            const DELType = Proc.dataExpL.type;
            const DERType = Proc.dataExpR.type;
            if (DELType.kind == ast.ASTKinds.TE_Pow) {
                const deltype = DELType;
                if (deltype.typeExpr.kind == ast.ASTKinds.TE_Name && DERType.kind == ast.ASTKinds.TE_Name) {
                    return deltype.typeExpr.typename == "IP"
                        && DERType.typename == "MSG"
                        && CheckSPE(Proc.nextproc);
                }
            }
            return false;
        }
        case ast.ASTKinds.SPE_Broadcast: {
            const Proc = proc;
            const DEType = Proc.dataExp.type;
            if (DEType.kind == ast.ASTKinds.TE_Name) {
                return DEType.typename == "MSG"
                    && CheckSPE(Proc.nextproc);
            }
            return false;
        }
        case ast.ASTKinds.SPE_Send: {
            const Proc = proc;
            const DEType = Proc.dataExp.type;
            if (DEType.kind == ast.ASTKinds.TE_Name) {
                return DEType.typename == "MSG"
                    && CheckSPE(Proc.nextproc);
            }
            return false;
        }
        case ast.ASTKinds.SPE_Deliver: {
            const Proc = proc;
            const DEType = Proc.dataExp.type;
            if (DEType.kind == ast.ASTKinds.TE_Name) {
                return DEType.typename == "DATA"
                    && CheckSPE(Proc.nextproc);
            }
            return false;
        }
        case ast.ASTKinds.SPE_Receive: {
            const Proc = proc;
            const result = getVariable(Proc.name);
            if (result == null) {
                return false;
            }
            else {
                Proc.variable = result;
            }
            const varitype = Proc.variable.typeExpr;
            if (varitype.kind == ast.ASTKinds.TE_Name) {
                return varitype.typename == "MSG"
                    && CheckSPE(Proc.nextproc);
            }
            return false;
        }
        case ast.ASTKinds.SPE_Choice: {
            const Proc = proc;
            return CheckSPE(Proc.left) && CheckSPE(Proc.right);
        }
        default: return true; //TODO are SPE_Name and SPE_Call
    }
}
function AreIdenticalTypes(type1, type2) {
    if (type1.kind != type2.kind) {
        return false;
    }
    if (type1.kind == ast.ASTKinds.TE_Name) {
        if (type1.typename != type2.typename) {
            return false;
        }
    }
    var areIdentical = true;
    for (let i = 0; i < type1.children.length; i++) { //if kind matches, they have the same # of children, so this is safe
        if (!AreIdenticalTypes(type1.children[i], type2.children[i])) {
            areIdentical = false;
        }
    }
    return areIdentical;
}
//TODO consider innocent overloading
function usedNames() {
    return types.map(x => x.typeName).concat(invalidTypes)
        .concat(variables.map(x => x.name)).concat(invalidVariables)
        .concat(constants.map(x => x.name)).concat(invalidConstants)
        .concat(functions.map(x => x.name)).concat(invalidFunctions)
        .concat(processes.map(x => x.name)).concat(invalidProcesses)
        .concat(aliases.map(x => x.name)).concat(invalidAliases);
}
function createErrorMessage(startLine, startChar, endLine, endChar, message) {
    return {
        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
        range: {
            start: { line: startLine, character: startChar },
            end: { line: endLine, character: endChar }
        },
        message: message
    };
}
//# sourceMappingURL=check.js.map