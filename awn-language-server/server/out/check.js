"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWarningMessage = exports.createErrorMessage = exports.Check = exports.getAutoComplete = exports.getHoverInformation = exports.InitialiseSingleCheck = exports.Initialise = void 0;
const ast = require("./ast");
const vscode_languageserver_1 = require("vscode-languageserver");
const server_1 = require("./server");
var importedFiles = [];
var inRootFile = true;
var types = [];
var variables = [];
var constants = [];
var functions = [];
var processes = [];
var aliasesSingle = [];
var aliasesList = [];
//objects which have been declared, but are invalid in some way. (so further references to them aren't marked as errors)
var invalidTypes = [];
var invalidVariables = [];
var invalidConstants = [];
var invalidFunctions = [];
var invalidProcesses = []; //kept as process so we can still use the signature for hover information (the process may be invalid further down).
//note that the fields in here are not guaranteed to be non-null
var invalidAliasesSingle = [];
var invalidAliasesList = [];
var errors = [];
var warnings = [];
//default objects
const boolType = new ast.Type("Bool");
boolType.typeExpr = new ast.TE_RootType("Bool");
const dataType = new ast.Type("DATA");
dataType.typeExpr = new ast.TE_RootType("DATA");
const msgType = new ast.Type("MSG");
msgType.typeExpr = new ast.TE_RootType("MSG");
const ipType = new ast.Type("IP");
ipType.typeExpr = new ast.TE_RootType("IP");
const timeType = new ast.Type("TIME");
timeType.typeExpr = new ast.TE_RootType("TIME");
const nowVar = new ast.Variable("now");
nowVar.typeExpr = timeType.typeExpr;
const trueCon = new ast.Constant("true");
trueCon.typeExpr = boolType.typeExpr;
const falseCon = new ast.Constant("false");
falseCon.typeExpr = boolType.typeExpr;
const not = new ast.Function_Prefix("!");
not.sigType = new ast.TE_Product([boolType.typeExpr]);
not.outType = boolType.typeExpr;
const and = new ast.Function_Infix("&");
and.sigType = new ast.TE_Product([boolType.typeExpr, boolType.typeExpr]);
and.outType = boolType.typeExpr;
const or = new ast.Function_Infix("|");
or.sigType = new ast.TE_Product([boolType.typeExpr, boolType.typeExpr]);
or.outType = boolType.typeExpr;
const imp = new ast.Function_Infix("->");
imp.sigType = new ast.TE_Product([boolType.typeExpr, boolType.typeExpr]);
imp.outType = boolType.typeExpr;
const iff = new ast.Function_Infix("<->");
iff.sigType = new ast.TE_Product([boolType.typeExpr, boolType.typeExpr]);
iff.outType = boolType.typeExpr;
const newpkt = new ast.Function_Prefix("newpkt");
newpkt.sigType = new ast.TE_Product([dataType.typeExpr, ipType.typeExpr]);
newpkt.outType = msgType.typeExpr;
//Using TE_Any ensures that any type is allowed in these functions.
//A separate check is performed later which makes sure that if using these functions, the arguments are of correct type with regards to each other
const eq = new ast.Function_Infix("=");
eq.sigType = new ast.TE_Product([new ast.TE_Any(), new ast.TE_Any()]);
eq.outType = boolType.typeExpr;
const neq = new ast.Function_Infix("!=");
neq.sigType = new ast.TE_Product([new ast.TE_Any(), new ast.TE_Any()]);
neq.outType = boolType.typeExpr;
const iselem = new ast.Function_Prefix("isElem");
iselem.sigType = new ast.TE_Product([new ast.TE_Any(), new ast.TE_Pow(new ast.TE_Any())]);
iselem.outType = boolType.typeExpr;
function Initialise() {
    types.push(...[boolType, dataType, msgType, ipType, timeType]);
    variables.push(nowVar);
    constants.push(...[trueCon, falseCon]);
    functions.push(...[not, or, and, imp, iff, newpkt, eq, neq, iselem]);
    return;
}
exports.Initialise = Initialise;
function InitialiseSingleCheck() {
    types = types.slice(0, 5);
    variables = variables.slice(0, 1);
    constants = constants.slice(0, 2);
    functions = functions.slice(0, 9);
    processes = [];
    aliasesSingle = [];
    aliasesList = [];
    invalidTypes = [];
    invalidVariables = [];
    invalidConstants = [];
    invalidFunctions = [];
    invalidProcesses = [];
    invalidAliasesSingle = [];
    invalidAliasesList = [];
    importedFiles = [];
    errors = [];
    warnings = [];
}
exports.InitialiseSingleCheck = InitialiseSingleCheck;
function getHoverInformation(word) {
    const t = getType(word);
    if (t != null) {
        return `\`\`\`typescript\nTYPE ${word}: ${TypeAsString(t)}`;
    }
    const v = getVariable(word);
    if (v != null) {
        return `\`\`\`typescript\nVARIABLE ${word}: ${TypeAsString(v.typeExpr)}`;
    }
    const c = getConstant(word);
    if (c != null) {
        return `\`\`\`typescript\nCONSTANT ${word}: ${TypeAsString(c.typeExpr)}`;
    }
    var funcWord = word; //word but without the final ":" except if it's only ":"
    if (word.endsWith(":") && word !== ":")
        funcWord = word.slice(0, -1);
    const f = getFunction(funcWord);
    if (f != null) {
        var output = "\`\`\`typescript";
        for (const func of f) {
            output = output.concat(`\nFUNCTION '${funcWord}': ${TypeAsString(func.sigType)} -> ${TypeAsString(func.outType)}`);
        }
        output = output.concat(`\n\`\`\``);
        return output;
    }
    const p = getProcess(word);
    if (p != null) {
        var arglist = '';
        if (p.args != null) { //check p.args!=null in case p came from invalidProcesses
            let i = 0;
            for (const arg of p.args) {
                arglist += arg.name;
                i++;
                if (i < p.args.length) {
                    arglist += ', ';
                }
            }
        }
        return `\`\`\`typescript\nPROC ${word}(${arglist})`;
    }
    var aliasWord = word;
    if (word.endsWith(":="))
        aliasWord = word.slice(0, -2);
    const al = getAliasList(aliasWord);
    if (al != null) {
        var arglist = '';
        let i = 0;
        for (const arg of al.argNames) {
            arglist += arg;
            if (i != al.argNames.length - 1) {
                arglist += ', ';
            }
            i++;
        }
        return `\`\`\`typescript\nALIAS ${aliasWord}: ${arglist})`;
    }
    const as = getAliasSingle(aliasWord);
    if (as != null) {
        return `\`\`\`typescript\nALIAS ${aliasWord}: ${DeAsString(as.dataExp)}`;
    }
    return null;
}
exports.getHoverInformation = getHoverInformation;
function getAutoComplete() {
    return usedNames().concat([
        "forall", "exists", "lambda", "include", "proc", "INCLUDES", "TYPES", "VARIABLES", "CONSTANTS", "FUNCTIONS", "PROCESSES", "ALIASES", "unicast", "broadcast", "groupcast", "send", "deliver", "receive"
    ]);
}
exports.getAutoComplete = getAutoComplete;
function Check(root, isRootFile, filepath) {
    inRootFile = isRootFile;
    if (inRootFile) {
        importedFiles.push(filepath);
    }
    for (const Block of root.blocks) {
        switch (Block.kind) {
            case ast.ASTKinds.Block_Include: {
                const block = Block;
                const directory = filepath.substring(0, filepath.lastIndexOf('/'));
                for (const include of block.includes) {
                    if (importedFiles.includes(directory + '/' + include.name)) {
                        createWarningMessage(`"${include.name}" already imported, ignoring this line.`, include.pos["posS"], include.pos["posE"]);
                        continue;
                    }
                    importedFiles.push(directory + '/' + include.name);
                    Import(include, directory);
                }
                break;
            }
            case ast.ASTKinds.Block_Type: {
                const block = Block;
                for (const typedec of block.types) {
                    //empty type declarations (those given without an accompanying TE) are given rootType
                    if (typedec.typeExpr == null) {
                        if (["Bool", "DATA", "MSG", "IP", "TIME"].includes(typedec.typeName)) {
                            createWarningMessage(`"${typedec.typeName}" is a predefined type. This declaration is unnecessary.`, typedec.pos["posS"]);
                            continue;
                        }
                        if (usedNames().includes(typedec.typeName)) {
                            createErrorMessage(`Name "${typedec.typeName}" already defined previously.`, typedec.pos["posS"]);
                            continue;
                        }
                        const newType = new ast.Type(typedec.typeName);
                        newType.typeExpr = new ast.TE_RootType(typedec.typeName, boolType);
                        types.push(newType);
                        continue;
                    }
                    //type declaration with accompanying TE
                    if (usedNames().includes(typedec.typeName)) {
                        createErrorMessage(`Name "${typedec.typeName}" already defined previously.`, typedec.pos["posS"]);
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
                const block = Block;
                for (var vari of block.vars) {
                    if (vari.name == "now") {
                        createWarningMessage(`"now" is a predefined variable. This declaration is unnecessary.`, vari.pos["posS"]);
                        continue;
                    }
                    if (usedNames().includes(vari.name)) {
                        createErrorMessage(`Name "${vari.name}" already defined previously.`, vari.pos["posS"]);
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
                const block = Block;
                for (var con of block.consts) {
                    if (['true', 'false'].includes(con.name)) {
                        createWarningMessage(`Name "${con.name}" is a predefined constant. This declaration is unnecessary.`, con.pos["posS"]);
                        continue;
                    }
                    if (usedNames().includes(con.name)) {
                        createErrorMessage(`Name "${con.name}" already defined previously.`, con.pos["posS"]);
                        continue;
                    }
                    const newTE = expandTypeExpression(con.typeExpr);
                    if (newTE != null) {
                        con.typeExpr = newTE;
                        constants.push(con);
                    }
                    else {
                        invalidConstants.push(con.name);
                    }
                }
                break;
            }
            case ast.ASTKinds.Block_Function: {
                const block = Block;
                for (var func of block.funcs) {
                    const expTE = expandTypeExpression(func.type);
                    if (expTE != null) {
                        //see if this function + signature combination already exists
                        const f = getFunction(func.name, expTE);
                        if (f != null) {
                            createErrorMessage(`Function "${func.name}" with type "${TypeAsString(expTE)}" already defined.`, func.pos["posS"]);
                            continue;
                        }
                        if ([ast.ASTKinds.TE_FuncFull, ast.ASTKinds.TE_FuncPart].includes(expTE.kind)) {
                            const sigType = expTE.sigType;
                            func.outType = expTE.outType;
                            if (sigType != null) {
                                func.sigType = sigType;
                                if (func.kind == ast.ASTKinds.Function_Infix && !func.isBinary) {
                                    createErrorMessage(`Infix functions require a binary signature. Instead got ${TypeAsString(func.sigType)}`, func.pos["posS"]);
                                    invalidFunctions.push(func.name);
                                    continue;
                                }
                                else {
                                    functions.push(func);
                                }
                            }
                            else {
                                createErrorMessage(`Cannot have a function as the signature of a function.`, func.pos["posS"]);
                                invalidFunctions.push(func.name);
                                continue;
                            }
                        }
                        else {
                            createErrorMessage(`Type of function declaration is not a function. Got type ${TypeAsString(expTE)}`, func.pos["posS"]);
                            invalidFunctions.push(func.name);
                            continue;
                        }
                    }
                    else {
                        invalidFunctions.push(func.name);
                        continue;
                    }
                }
                break;
            }
            case ast.ASTKinds.Block_Alias: {
                const block = Block;
                for (const alias of block.aliases) {
                    switch (alias.kind) {
                        case ast.ASTKinds.Alias_Data: {
                            const Alias = alias;
                            if (CheckDataExpression(Alias.dataExp)) {
                                aliasesSingle.push(Alias);
                            }
                            else {
                                invalidAliasesSingle.push(Alias.name);
                            }
                            break;
                        }
                        case ast.ASTKinds.Alias_List: {
                            const Alias = alias;
                            CheckListAlias(Alias);
                            break;
                        }
                    }
                }
                break;
            }
            case ast.ASTKinds.Block_Process: {
                const block = Block;
                for (const proc of block.procs) {
                    var validProc = true;
                    if (usedNames().includes(proc.name)) {
                        createErrorMessage(`Name "${proc.name}" already defined previously.`, proc.pos["posS"]);
                        validProc = false;
                    }
                    //expand out argument list and check for duplicates
                    for (const procarg of proc.argInfo) {
                        if (variables.map(x => x.name).concat(invalidVariables).includes(procarg.name)) {
                            const vari = getVariable(procarg.name);
                            if (vari == null) {
                                continue;
                            } //note this is impossible
                            if (proc.args.map(v => v.name).includes(vari.name)) {
                                createErrorMessage(`Duplicated variable "${vari.name}".`, procarg.pos["posS"]);
                            }
                            else {
                                proc.args.push(vari);
                                procarg.argType = ast.ASTKinds.Variable;
                            }
                        }
                        else if (aliasesList.map(x => x.name).concat(invalidAliasesList).includes(procarg.name)) {
                            const alias = getAliasList(procarg.name);
                            if (alias == null) {
                                continue;
                            } //note this is impossible
                            const vars = expandAlistList(alias);
                            for (const vari of vars) {
                                if (proc.args.map(v => v.name).includes(vari.name)) {
                                    createErrorMessage(`Duplicated variable "${vari.name}" inside list alias ${procarg.name}.`, procarg.pos["posS"]);
                                }
                                else {
                                    proc.args.push(vari);
                                }
                            }
                            procarg.argType = ast.ASTKinds.Alias_List;
                        }
                    }
                    if (CheckSPE(proc.proc, proc.args.map(x => x.name)) && validProc) {
                        processes.push(proc);
                    }
                    else {
                        invalidProcesses.push(proc);
                    }
                }
                break;
            }
        }
    }
    if (inRootFile) {
        console.log("Semantic Information:", types, variables, constants, functions, processes, aliasesSingle, aliasesList, invalidTypes, invalidVariables, invalidConstants, invalidFunctions, invalidProcesses, invalidAliasesSingle, invalidAliasesList);
    }
    return warnings.concat(errors);
}
exports.Check = Check;
//Imports and calls Check() on an include, adding its info to types[], variables[], etc.
//Errors/warnings in the included file are not displayed for the user.
//Note that the ast.Include only contains the filename, not the directory, hence it's an argument here.
function Import(include, directory) {
    const result = (0, server_1.prepareFile)(directory + "/" + include.name);
    if (result == 0) {
        createErrorMessage(`"${include.name}" could not be found.`, include.pos["posS"], include.pos["posE"]);
        return;
    }
    else if (result == 1) {
        createErrorMessage(`"${include.name}" could not be parsed.`, include.pos["posS"], include.pos["posE"]);
        return;
    }
    const newast = result;
    const wasRootFile = inRootFile;
    Check(newast, false, directory + "/" + include.name);
    inRootFile = wasRootFile;
}
//Given a type name, returns its type definition.
//If the type is in invalidTypes, returns null.
//If the type doesn't exist, returns null and optionally print an error message at pos.
function getType(typeName, posForError) {
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
    if (posForError != null) {
        createErrorMessage(`Could not find type "${typeName}".`, posForError);
    }
    return null;
}
//Given a constant name, returns its Constant object.
//If the constant is in invalidConstants, returns null.
//If the constant doesn't exist, returns null and optionally print an error message at pos.
function getConstant(constantName, posForError) {
    for (const con of constants) {
        if (con.name == constantName) {
            return con;
        }
    }
    for (const con of invalidConstants) {
        if (con == constantName) {
            return null;
        }
    }
    if (posForError != null) {
        createErrorMessage(`Could not find constant "${constantName}".`, posForError);
    }
    return null;
}
//Given a variable name, returns its Variable object
//If the variable is in invalidVariables, returns null.
//If the variable doesn't exist, returns null and optionally print an error message at pos.
function getVariable(variableName, posForError) {
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
    if (posForError != null) {
        createErrorMessage(`Could not find variable "${variableName}".`, posForError);
    }
    return null;
}
//Find function with name, and optionally signature. If signature is not specified, returns all functions with that name.
//If a matching function is in invalidFunctions[] and not in functions[], returns null.
//If the function doesn't exist, returns null and optionally print an error message at pos.
function getFunction(functionName, signature, posForError) {
    var funcs = [];
    for (const func of functions) {
        if (func.name == functionName) {
            if (signature != null) {
                if (AreIdenticalTypes(func.sigType, signature)) {
                    return [func];
                }
                else {
                    continue;
                }
            }
            else {
                funcs.push(func);
            }
        }
    }
    if (funcs.length != 0) {
        return funcs;
    }
    for (const func of invalidFunctions) {
        if (func == functionName) {
            return null;
        }
    }
    if (posForError != null && signature == null) {
        createErrorMessage(`Could not find function "${functionName}".`, posForError);
    }
    return null;
}
//Given a process name, returns its Process object.
//If the process is in invalidProcesses instead, returns that.
//If the process doesn't exist, returns null and optionally print an error message at pos.
function getProcess(procName, posForError) {
    for (const proc of processes) {
        if (proc.name == procName) {
            return proc;
        }
    }
    for (const proc of invalidProcesses) {
        if (proc.name == null) {
            continue;
        }
        if (proc.name == procName) {
            return proc;
        }
    }
    if (posForError != null) {
        createErrorMessage(`Could not find process "${procName}".`, posForError);
    }
    return null;
}
//Given a data alias name, returns its Alias_Data object.
//If the data alias is in invalidAliasesSingle, returns null.
//If the data alias doesn't exist, returns null and optionally prints an error message at pos.
function getAliasSingle(aliasName, posForError) {
    for (const alias of aliasesSingle) {
        if (alias.name == aliasName) {
            return alias;
        }
    }
    for (const alias of invalidAliasesSingle) {
        if (alias == aliasName) {
            return null;
        }
    }
    if (posForError != null) {
        createErrorMessage(`Could not find data alias "${aliasName}".`, posForError);
    }
    return null;
}
//Given a list alias name, returns its Alias_List object.
//If the list alias is in invalidAliasesList, returns null.
//If the list alias doesn't exist, returns null and optionally prints an error message at pos.
function getAliasList(aliasName, posForError) {
    for (const alias of aliasesList) {
        if (alias.name == aliasName) {
            return alias;
        }
    }
    for (const alias of invalidAliasesList) {
        if (alias == aliasName) {
            return null;
        }
    }
    if (posForError != null) {
        createErrorMessage(`Could not find list alias "${aliasName}".`, posForError);
    }
    return null;
}
//Given a list alias, returns the full list of variables it expands out to (including recursively).
//Note that this function can recurse infinitely if the list alias is self-referential.
function expandAlistList(aliaslist) {
    var result = [];
    for (const vari of aliaslist.args) {
        if (vari.kind == ast.ASTKinds.Variable) {
            const Vari = vari;
            result.push(Vari);
        }
        else if (vari.kind == ast.ASTKinds.Alias_List) {
            const Vari = vari;
            result.push(...expandAlistList(Vari));
        }
    }
    return result;
}
//Expands out a TE by replacing typenames with equivalents down to TE_RootType.
//Optionally include typeName to check for circular definitions.
//If any circular or undefined typenames are found, returns null.
function expandTypeExpression(typeExp, typeName) {
    if (expandTypeExpressionHelper(typeExp, typeName)) {
        return typeExp;
    }
    else {
        return null;
    }
}
//Helper for expandTypeExpression, expands out the given typeExp and returns
//a boolean signifying if any errors occurred.
function expandTypeExpressionHelper(typeExp, typeName) {
    if (typeExp.kind == ast.ASTKinds.TE_RootType) {
        return true;
    }
    //if a name, set typeExp field to equivalent
    if (typeExp.kind == ast.ASTKinds.TE_Name) {
        var TypeExp = typeExp;
        //ensure no circular definition if we're checking for that
        if (typeName != null) {
            if (TypeExp.typename == typeName) {
                //circular definition
                invalidTypes.push(typeName);
                createErrorMessage(`"${typeName}" contains a circular type definition.`, TypeExp.pos["posS"]);
                return false;
            }
        }
        const result = getType(TypeExp.typename, TypeExp.pos["posS"]); //retrieve the equivalent
        if (result == null) {
            //nonexistent or invalid type referenced
            if (typeName != null) {
                invalidTypes.push(typeName);
            }
            return false;
        }
        else {
            //also expand out the replacement
            TypeExp.typeExpr = result;
            return expandTypeExpressionHelper(result, typeName);
        }
    }
    else { //move on to children if not typename or type_root
        var failure = false;
        for (var childTE of getTypeExpChildren(typeExp)) {
            const childResult = expandTypeExpressionHelper(childTE, typeName);
            if (childResult == false) {
                failure = true;
            }
        }
        if (failure) { //we check for failure afterwards rather than returning immediately so that this function can possibly find other errors further down the tree.
            return false;
        }
        else {
            return true;
        }
    }
}
//Checks an SPE - more accurately, a sequence of SPEs - as this includes any other SPEs attached to it.
//boundArgs is passed by reference so it gets built on over the course of a Process
function CheckSPE(proc, boundArgs) {
    boundArgs.push("now"); //now is technically a variable but it's always bound/non-null
    switch (proc.kind) {
        case ast.ASTKinds.SPE_Guard: {
            const Proc = proc;
            if (!CheckDEFull(Proc.dataExp, boundArgs)) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            const DEType = Proc.dataExp.type;
            //guard DE must be bool
            if (!AreIdenticalTypes(DEType, boolType.typeExpr)) {
                createErrorMessage(`Guard requires type "Bool" but got "${TypeAsString(DEType)}" instead.`, Proc.pos["DEStart"], Proc.pos["DEEnd"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            return CheckSPE(Proc.nextproc, boundArgs);
        }
        case ast.ASTKinds.SPE_Assign: {
            const Proc = proc;
            var l = CheckVarExpression(Proc.variableExp);
            var r = CheckDEFull(Proc.dataExpAssign, boundArgs);
            var success = l && r;
            if (!success) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            if (Proc.variableExp.type != null) { //if success is true, this won't happen, but feel it's better to keep this check in
                if (!AreIdenticalTypes(Proc.variableExp.type, Proc.dataExpAssign.type)) {
                    createErrorMessage(`Variable expression and data expression must have the same type. VE has type "${TypeAsString(Proc.variableExp.type)}", DE has type "${TypeAsString(Proc.dataExpAssign.type)}"`, Proc.pos["assignExpStart"], Proc.pos["end"]);
                    CheckSPE(Proc.nextproc, boundArgs);
                    return false;
                }
            }
            return CheckSPE(Proc.nextproc, boundArgs);
        }
        case ast.ASTKinds.SPE_Unicast: {
            const Proc = proc;
            if (!CheckDEFull(Proc.dataExpL, boundArgs)) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            if (!CheckDEFull(Proc.dataExpR, boundArgs)) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            const DELType = Proc.dataExpL.type;
            const DERType = Proc.dataExpR.type;
            if (!AreIdenticalTypes(DELType, ipType.typeExpr)) {
                createErrorMessage(`Unicast expected type "IP" but got "${TypeAsString(DELType)}" instead.`, Proc.pos["DELstart"], Proc.pos["DELend"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            if (!AreIdenticalTypes(DERType, msgType.typeExpr)) {
                createErrorMessage(`Unicast expected type "MSG" but got "${TypeAsString(DERType)}" instead.`, Proc.pos["DELend"], Proc.pos["DERend"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            return CheckSPE(Proc.nextproc, boundArgs);
        }
        case ast.ASTKinds.SPE_Groupcast: {
            const Proc = proc;
            if (!CheckDEFull(Proc.dataExpL, boundArgs)) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            if (!CheckDEFull(Proc.dataExpR, boundArgs)) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            const DELType = Proc.dataExpL.type;
            const DERType = Proc.dataExpR.type;
            const powIPType = new ast.TE_Pow(ipType.typeExpr);
            if (!AreIdenticalTypes(DELType, powIPType)) {
                createErrorMessage(`Groupcast expected type "Pow(IP)" but got "${TypeAsString(DELType)}" instead.`, Proc.pos["DELstart"], Proc.pos["DELend"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            if (!AreIdenticalTypes(DERType, msgType.typeExpr)) {
                createErrorMessage(`Groupcast expected type "MSG" but got "${TypeAsString(DERType)}" instead.`, Proc.pos["DELend"], Proc.pos["DERend"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            return CheckSPE(Proc.nextproc, boundArgs);
        }
        case ast.ASTKinds.SPE_Broadcast: {
            const Proc = proc;
            if (!CheckDEFull(Proc.dataExp, boundArgs)) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            const DEType = Proc.dataExp.type;
            if (!AreIdenticalTypes(DEType, msgType.typeExpr)) {
                createErrorMessage(`Broadcast expected type "MSG" but got "${TypeAsString(DEType)}" instead.`, Proc.pos["DEstart"], Proc.pos["DEend"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            return CheckSPE(Proc.nextproc, boundArgs);
        }
        case ast.ASTKinds.SPE_Send: {
            const Proc = proc;
            if (!CheckDEFull(Proc.dataExp, boundArgs)) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            const DEType = Proc.dataExp.type;
            if (!AreIdenticalTypes(DEType, msgType.typeExpr)) {
                createErrorMessage(`Send expected type "MSG" but got "${TypeAsString(DEType)}" instead.`, Proc.pos["DEstart"], Proc.pos["DEend"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            return CheckSPE(Proc.nextproc, boundArgs);
        }
        case ast.ASTKinds.SPE_Deliver: {
            const Proc = proc;
            if (!CheckDEFull(Proc.dataExp, boundArgs)) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            const DEType = Proc.dataExp.type;
            if (!AreIdenticalTypes(DEType, dataType.typeExpr)) {
                createErrorMessage(`Deliver expected type "DATA" but got "${TypeAsString(DEType)}" instead.`, Proc.pos["DEstart"], Proc.pos["DEend"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            return CheckSPE(Proc.nextproc, boundArgs);
        }
        case ast.ASTKinds.SPE_Receive: {
            const Proc = proc;
            const v = getVariable(Proc.name, Proc.pos["namePos"]);
            if (v == null) {
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            else {
                boundArgs.push(v.name);
                Proc.variable = v;
            }
            const varitype = Proc.variable.typeExpr;
            if (!AreIdenticalTypes(varitype, msgType.typeExpr)) {
                createErrorMessage(`Receive expected type "MSG" but got "${TypeAsString(varitype)}" instead.`, Proc.pos["namePos"], Proc.pos["nameEnd"]);
                CheckSPE(Proc.nextproc, boundArgs);
                return false;
            }
            return CheckSPE(Proc.nextproc, boundArgs);
        }
        case ast.ASTKinds.SPE_Choice: {
            const Proc = proc;
            var l = CheckSPE(Proc.left, boundArgs);
            var r = CheckSPE(Proc.right, boundArgs);
            return l && r;
        }
        case ast.ASTKinds.SPE_Call: {
            const Proc = proc;
            var success = true;
            if (Proc.name == Proc.curProcIn.name) {
                Proc.proc = Proc.curProcIn;
            }
            else {
                var p = getProcess(Proc.name, Proc.pos["posS"]);
                if (p != null) {
                    Proc.proc = p;
                }
                else {
                    success = false;
                }
            }
            for (var arg of Proc.args) {
                if (!CheckDEFull(arg, boundArgs)) {
                    success = false;
                }
            }
            return success;
        }
        case ast.ASTKinds.SPE_Brack: {
            const Proc = proc;
            return CheckSPE(Proc.proc, boundArgs);
        }
        default: return false;
    }
}
function CheckVarExpression(varexp) {
    var success = true;
    var leftType = null;
    const v = getVariable(varexp.name, varexp.pos["posS"]);
    if (v != null) {
        leftType = v.typeExpr;
    }
    else {
        success = false;
    }
    if (varexp.des.length == 0) {
        if (leftType != null) {
            varexp.type = leftType;
        }
        return success;
    }
    for (let i = 0; i < varexp.des.length; i++) {
        const rightValid = CheckDEFull(varexp.des[i]);
        if (leftType != null) {
            if (![ast.ASTKinds.TE_FuncFull, ast.ASTKinds.TE_FuncPart].includes(leftType.kind)) {
                createErrorMessage(`This expression should be of a functional type, instead got ${TypeAsString(leftType)}.`, varexp.pos["posS"], i == 0 ? varexp.pos["posE"] : varexp.DEPosE[i - 1]);
                success = false;
                leftType = null;
                break;
            }
            ;
            const LeftType = leftType;
            if (rightValid) {
                if (!AreIdenticalTypes(LeftType.sigType, varexp.des[i].type)) {
                    createErrorMessage(`Expected function signature to have type ${TypeAsString(varexp.des[i].type)}, but instead got ${TypeAsString(LeftType.sigType)}.`, varexp.DEPosS[i], varexp.DEPosE[i]);
                    success = false;
                    leftType = null;
                    break;
                }
                leftType = LeftType.outType;
            }
        }
    }
    if (leftType != null) {
        varexp.type = leftType;
    }
    return success;
}
//Expands out then checks a DE.
//If boundArgs are given, perform boundness calculations: add free arguments within guard 
//SPEs to boundArgs as per AWN rules, and checks whether DE_Names referring to variables are bound.
function CheckDEFull(de, boundArgs) {
    var d = expandDataExpression(de);
    if (d == null) {
        return false;
    }
    else {
        de = d;
    }
    if (CheckDataExpression(de, boundArgs) == false) {
        return false;
    }
    return true;
}
//Copy of expandTypeExpression but for data expressions.
//Expands out a DE by replacing aliases with equivalents.
//If processing data alias blocks, include the alias name so we can
//check for circular definitions.
//If any circular or undefined typenames are found, returns null.
function expandDataExpression(dataExp, aliasName) {
    if (expandDataExpressionHelper(dataExp, aliasName)) {
        return dataExp;
    }
    else {
        return null;
    }
}
//Expands out a dataExp recursively and returns false if there were any errors in doing so.
function expandDataExpressionHelper(dataExp, aliasName) {
    //only require (possible) expanding on names - if the name refers to a data alias
    if (dataExp.kind == ast.ASTKinds.DE_Name) {
        //ensure no circular definition if we're checking for that
        if (aliasName != null) {
            if (dataExp.name == aliasName) {
                //circular definition
                invalidAliasesSingle.push(aliasName);
                createErrorMessage(`"${dataExp}" contains a circular alias definition.`, dataExp.pos["posS"], dataExp.pos["posS"]);
                return false;
            }
        }
        const result = getAliasSingle(dataExp.name); //retrieve the equivalent
        if (result == null) {
            //do nothing, the name could refer to something else.
            return true;
        }
        else {
            //valid expansion returned; replace the dataExp with it
            dataExp = result.dataExp;
            if (dataExp.kind != ast.ASTKinds.DE_Name) { //if the replacement was not just another DE_Name, keep going
                return expandDataExpressionHelper(dataExp, aliasName);
            }
            else {
                return true;
            }
        }
    }
    else { //move on to children if not DE_Name
        var failure = false;
        for (var childDE of getDataExpChildren(dataExp)) {
            const childResult = expandDataExpressionHelper(childDE, aliasName);
            if (childResult == false) {
                failure = true;
            }
        }
        if (failure) { //we check for failure afterwards rather than returning immediately so that this function can possibly find other errors further down the tree.
            return false;
        }
        else {
            return true;
        }
    }
}
//Evaluates and checks the data expression from the bottom up.
//Also sets the type of the data expression.
//Assumes that all data aliases have already been expanded out.
//If boundArgs are given, perform boundness calculations: add free arguments within guard 
//SPEs to boundArgs as per AWN rules, and checks whether DE_Names referring to variables are bound.
function CheckDataExpression(de, boundArgs) {
    switch (de.kind) {
        case ast.ASTKinds.DE_Singleton: {
            const DE = de;
            // {DE}
            if (CheckDataExpression(DE.dataExp, boundArgs) == false) {
                return false;
            }
            DE.type = new ast.TE_Pow(DE.dataExp.type);
            return true;
        }
        case ast.ASTKinds.DE_Set: {
            const DE = de;
            // {Name | DE}
            const v = getVariable(DE.name, DE.pos["posS"]);
            //Name is bound for the following DE only, so just concat name to boundArgs in this function call instead of pushing
            //Likewise for Partial, Exists, Lambda, Forall
            if (CheckDataExpression(DE.dataExp, v == null ? boundArgs : boundArgs?.concat(v.name)) == false) {
                return false;
            }
            if (!AreIdenticalTypes(DE.dataExp.type, boolType.typeExpr)) {
                createErrorMessage(`Expected type "Bool" but got "${TypeAsString(DE.dataExp.type)}".`, DE.pos["posS"]);
                return false;
            }
            if (v == null) {
                return false;
            }
            DE.type = new ast.TE_Pow(v.typeExpr, DE, v.pos["posS"]);
            return true;
        }
        case ast.ASTKinds.DE_Partial: {
            const DE = de;
            // {(Name, DE), DE}
            const v = getVariable(DE.name, DE.pos["posS"]);
            var l = CheckDataExpression(DE.left, v == null ? boundArgs : boundArgs?.concat(v.name));
            var r = CheckDataExpression(DE.right, v == null ? boundArgs : boundArgs?.concat(v.name));
            if (!(l || r)) {
                return false;
            }
            if (!AreIdenticalTypes(DE.right.type, boolType.typeExpr)) {
                createErrorMessage(`Expected type "Bool" but got "${TypeAsString(DE.right.type)}".`, DE.pos["posS"]);
                return false;
            }
            if (v == null) {
                return false;
            }
            DE.type = new ast.TE_FuncPart(DE, v.typeExpr, DE.left.type);
            return true;
        }
        case ast.ASTKinds.DE_Lambda: {
            const DE = de;
            // lambda Name . DE
            var success = true;
            const v = getVariable(DE.name, DE.pos["namePos"]);
            if (v == null) {
                success = false;
            }
            else {
                DE.variable = v;
            }
            if (CheckDataExpression(DE.dataExp, boundArgs?.concat(DE.variable?.name)) == false) {
                success = false;
            }
            if (!success) {
                return false;
            }
            DE.type = new ast.TE_FuncFull(DE, DE.variable.typeExpr, DE.dataExp.type);
            return true;
        }
        case ast.ASTKinds.DE_Forall: {
            const DE = de;
            // forall Name . DE
            var success = true;
            const v = getVariable(DE.name, DE.pos["namePos"]);
            if (v == null) {
                success = false;
            }
            else {
                DE.variable = v;
            }
            if (CheckDataExpression(DE.dataExp, boundArgs?.concat(DE.variable?.name)) == false) {
                success = false;
            }
            if (!success) {
                return false;
            }
            if (!AreIdenticalTypes(DE.dataExp.type, boolType.typeExpr)) {
                createErrorMessage(`Expected type "Bool" but got "${TypeAsString(DE.dataExp.type)}".`, DE.pos["namePos"]);
                return false;
            }
            DE.type = new ast.TE_Name("Bool", DE, DE.dataExp.type.pos["posS"], DE.dataExp.type.pos["posE"]);
            var t = DE.type;
            t.typeExpr = boolType.typeExpr;
            return true;
        }
        case ast.ASTKinds.DE_Exists: {
            const DE = de;
            // exists Name . DE
            success = true;
            const v = getVariable(DE.name, DE.pos["namePos"]);
            if (v == null) {
                success = false;
            }
            else {
                DE.variable = v;
            }
            if (CheckDataExpression(DE.dataExp, boundArgs?.concat(DE.variable?.name)) == false) {
                success = false;
            }
            if (!success) {
                return false;
            }
            if (!AreIdenticalTypes(DE.dataExp.type, boolType.typeExpr)) {
                createErrorMessage(`Expected type "Bool" but got "${TypeAsString(DE.dataExp.type)}".`, DE.pos["namePos"]);
                return false;
            }
            DE.type = new ast.TE_Name("Bool", DE, DE.dataExp.type.pos["posS"], DE.dataExp.type.pos["posE"]);
            var t = DE.type;
            t.typeExpr = boolType.typeExpr;
            return true;
        }
        case ast.ASTKinds.DE_Brack: {
            const DE = de;
            if (CheckDataExpression(DE.dataExp, boundArgs) == false) {
                return false;
            }
            DE.type = DE.dataExp.type;
            return true;
        }
        case ast.ASTKinds.DE_Name: {
            const DE = de;
            //all this does is set the type and what it refers to, which is all is needed
            var c = getConstant(DE.name);
            if (c != null) {
                DE.type = c.typeExpr;
                DE.refersTo = ast.ASTKinds.Constant;
                return true;
            }
            if (invalidConstants.includes(DE.name)) {
                DE.refersTo = ast.ASTKinds.Constant;
                return false;
            }
            var v = getVariable(DE.name);
            if (v != null) {
                DE.type = v.typeExpr;
                DE.refersTo = ast.ASTKinds.Variable;
                if (boundArgs != null) {
                    if (!boundArgs.includes(v.name)) {
                        createErrorMessage(`Variable "${v.name}" is not bound here.`, DE.pos["posS"]);
                        return true; //return true because the variable's type is still valid, so we can still work with it for the sake of semantics. The error is still sent.
                    }
                }
                return true;
            }
            if (invalidVariables.includes(DE.name)) {
                DE.refersTo = ast.ASTKinds.Variable;
                return false;
            }
            var f = getFunction(DE.name);
            if (f != null) {
                DE.type = f[0].type;
                DE.refersTo = ast.ASTKinds.Function_Prefix;
                return true;
            }
            if (invalidFunctions.includes(DE.name)) {
                DE.refersTo = ast.ASTKinds.Function_Prefix;
                return false;
            }
            var asi = getAliasSingle(DE.name);
            if (asi != null) {
                DE.type = asi.dataExp.type;
                DE.refersTo = ast.ASTKinds.Alias_Data;
                return true;
            }
            if (invalidAliasesSingle.includes(DE.name)) {
                DE.refersTo = ast.ASTKinds.Alias_Data;
                return false;
            }
            var ali = getAliasList(DE.name);
            if (ali != null) {
                DE.refersTo = ast.ASTKinds.Alias_List;
                return true;
            }
            if (invalidAliasesList.includes(DE.name)) {
                DE.refersTo = ast.ASTKinds.Alias_List;
                return false;
            }
            createErrorMessage(`Could not find identifier "${DE.name}".`, DE.pos["posS"]);
            return false;
        }
        case ast.ASTKinds.DE_Function: {
            const DE = de;
            // Name(DE)
            //first, find the arguments' type. if the arguments aren't a DE_tuple, make it a DE_tuple with one element
            if (CheckDataExpression(DE.dataExp, boundArgs) == false) {
                return false;
            }
            else {
                if (DE.dataExp.kind == ast.ASTKinds.DE_Tuple) {
                    DE.arguments = DE.dataExp;
                }
                else {
                    var tuple = new ast.DE_Tuple(DE);
                    tuple.dataExps = [DE.dataExp];
                    DE.arguments = tuple;
                    var argtype = new ast.TE_Product([DE.dataExp.type]);
                    DE.arguments.type = argtype;
                }
            }
            //find the function that has the same sigtype as the arguments' type
            const f = getFunction(DE.name, DE.arguments.type, DE.pos["sigStart"]);
            if (f != null) {
                DE.function = f[0];
            }
            else {
                createErrorMessage(`Could not find a function named "${DE.name}" with function signature: "${TypeAsString(DE.arguments.type)}"`, DE.pos["sigStart"]);
                return false;
            }
            DE.type = DE.function.outType;
            return true;
        }
        case ast.ASTKinds.DE_Infix: {
            const DE = de;
            //DE Infix DE
            var l = CheckDataExpression(DE.left, boundArgs);
            var r = CheckDataExpression(DE.right, boundArgs);
            if (!(l && r)) {
                return false;
            }
            //retrieve function with type l x r
            const expectedtype = new ast.TE_Product([DE.left.type, DE.right.type]);
            const f = getFunction(DE.function.name, expectedtype, DE.pos["sigStart"]);
            if (f != null) {
                DE.function = f[0];
            }
            else {
                createErrorMessage(`Could not find a function named "${DE.function.name}" with function signature: \n"${TypeAsString(expectedtype)}"`, DE.pos["sigStart"], DE.pos["sigEnd"]);
                return false;
            }
            //for special predefined ones (=, !=, isElem), make sure arguments match each other in the right way
            if (DE.function.name == "=" || DE.function.name == "!=") {
                if (!AreIdenticalTypes(DE.left.type, DE.right.type)) {
                    createErrorMessage(`"${DE.function.name}" requires that left and right types are identical. Got ${TypeAsString(expectedtype)}`, DE.pos["sigStart"], DE.pos["sigEnd"]);
                    return false;
                }
            }
            if (DE.function.name == "isElem") {
                const powofleft = new ast.TE_Pow(DE.left.type);
                if (!AreIdenticalTypes(powofleft, DE.right.type)) {
                    createErrorMessage(`"isElem" requires a type signature of style T x Pow(T). Got ${TypeAsString(expectedtype)}`, DE.pos["sigStart"], DE.pos["sigEnd"]);
                    return false;
                }
            }
            DE.type = f[0].outType;
            return true;
        }
        case ast.ASTKinds.DE_Tuple: {
            const DE = de;
            var success = true;
            var childtypes = [];
            for (const child of DE.dataExps) {
                if (CheckDataExpression(child, boundArgs)) {
                    childtypes.push(child.type);
                }
                else {
                    success = false;
                }
            }
            if (success) {
                DE.type = new ast.TE_Product(childtypes, DE);
                return true;
            }
            return false;
        }
    }
    return false;
}
function CheckListAlias(alias) {
    var success = true;
    var argsSoFar = [];
    var i = 0;
    for (const vari of alias.argNames) {
        if (argsSoFar.includes(vari)) {
            createErrorMessage(`"${vari}" is duplicated in this list alias.`, { line: alias.argsPosS[i].line, offset: alias.argsPosS[i].offset, overallPos: 0 });
            success = false;
            i++;
            continue;
        }
        argsSoFar.push(vari);
        var v = getVariable(vari, alias.argsPosS[i]);
        if (v == null) {
            success = false;
            i++;
            continue;
        }
        alias.args.push(v);
        i++;
    }
    if (success) {
        aliasesList.push(alias);
        return true;
    }
    else {
        invalidAliasesList.push(alias.name);
        return false;
    }
}
function getTypeExpChildren(typeExp) {
    switch (typeExp.kind) {
        case ast.ASTKinds.TE_RootType: return [];
        case ast.ASTKinds.TE_Name: return [typeExp.typeExpr];
        case ast.ASTKinds.TE_Brack: return [typeExp.typeExpr];
        case ast.ASTKinds.TE_Pow: return [typeExp.typeExpr];
        case ast.ASTKinds.TE_Array: return [typeExp.typeExpr];
        case ast.ASTKinds.TE_FuncFull: return [typeExp.left, typeExp.right];
        case ast.ASTKinds.TE_FuncPart: return [typeExp.left, typeExp.right];
        case ast.ASTKinds.TE_Product: return typeExp.children;
        default: return [];
    }
}
function getDataExpChildren(dataExp) {
    switch (dataExp.kind) {
        case ast.ASTKinds.DE_Brack: return [dataExp.dataExp];
        case ast.ASTKinds.DE_Exists: return [dataExp.dataExp];
        case ast.ASTKinds.DE_Forall: return [dataExp.dataExp];
        case ast.ASTKinds.DE_Lambda: return [dataExp.dataExp];
        case ast.ASTKinds.DE_Singleton: return [dataExp.dataExp];
        case ast.ASTKinds.DE_Set: return [dataExp.dataExp];
        case ast.ASTKinds.DE_Partial: return [dataExp.left, dataExp.right];
        case ast.ASTKinds.DE_Name: return [];
        case ast.ASTKinds.DE_Tuple: return dataExp.dataExps;
        case ast.ASTKinds.DE_Function: return [dataExp.dataExp];
        case ast.ASTKinds.DE_Infix: return [dataExp.left, dataExp.right];
        default: return [];
    }
}
//Note that this function takes TEs and not Types
function AreIdenticalTypes(type1, type2) {
    if (type1 == null || type2 == null) {
        console.log("AreIdenticalTypes encountered a null type");
        return false;
    }
    if (type1.kind == ast.ASTKinds.TE_Any || type2.kind == ast.ASTKinds.TE_Any) {
        return true;
    }
    //firstly, replace names with expansions
    if (type1.kind == ast.ASTKinds.TE_Name) {
        return AreIdenticalTypes(type1.typeExpr, type2);
    }
    if (type2.kind == ast.ASTKinds.TE_Name) {
        return AreIdenticalTypes(type1, type2.typeExpr);
    }
    if (type1.kind != type2.kind) {
        return false;
    }
    if (type1.kind == ast.ASTKinds.TE_RootType) {
        return type1.typename == type2.typename;
    }
    var areIdentical = true;
    const type1children = getTypeExpChildren(type1);
    const type2children = getTypeExpChildren(type2);
    if (type1children.length != type2children.length) {
        return false;
    }
    for (let i = 0; i < type1children.length; i++) {
        if (!AreIdenticalTypes(type1children[i], type2children[i])) {
            areIdentical = false;
        }
    }
    return areIdentical;
}
//Prints out a TE as a well-formatted string.
function TypeAsString(type) {
    if (type == null) {
        return "null";
    }
    switch (type.kind) {
        case ast.ASTKinds.TE_Name: {
            const Type = type;
            return Type.typename;
        }
        case ast.ASTKinds.TE_Array: {
            const Type = type;
            return "[" + TypeAsString(Type.typeExpr) + "]";
        }
        case ast.ASTKinds.TE_Brack: {
            const Type = type;
            return "(" + TypeAsString(Type.typeExpr) + ")";
        }
        case ast.ASTKinds.TE_FuncFull: {
            const Type = type;
            return TypeAsString(Type.left) + "->" + TypeAsString(Type.right);
        }
        case ast.ASTKinds.TE_FuncPart: {
            const Type = type;
            return TypeAsString(Type.left) + "+->" + TypeAsString(Type.right);
        }
        case ast.ASTKinds.TE_Pow: {
            const Type = type;
            return "Pow(" + TypeAsString(Type.typeExpr) + ")";
        }
        case ast.ASTKinds.TE_Product: {
            const Type = type;
            var out = TypeAsString(Type.children[0]);
            for (let i = 1; i < Type.children.length; i++) {
                out = out.concat(" x ").concat(TypeAsString(Type.children[i]));
            }
            return out;
        }
        case ast.ASTKinds.TE_RootType: {
            const Type = type;
            return Type.typename;
        }
        case ast.ASTKinds.TE_Any: {
            const Type = type;
            return "Any";
        }
        default: return "";
    }
}
//Prints out a Data Expression as a nicely formatted string.
function DeAsString(de) {
    switch (de.kind) {
        case ast.ASTKinds.DE_Brack: {
            const DE = de;
            return "(" + DeAsString(DE.dataExp) + ")";
        }
        case ast.ASTKinds.DE_Exists: {
            const DE = de;
            return "exists " + DE.name + " . " + DeAsString(DE.dataExp);
        }
        case ast.ASTKinds.DE_Forall: {
            const DE = de;
            return "forall " + DE.name + " . " + DeAsString(DE.dataExp);
        }
        case ast.ASTKinds.DE_Lambda: {
            const DE = de;
            return "lambda " + DE.name + " . " + DeAsString(DE.dataExp);
        }
        case ast.ASTKinds.DE_Singleton: {
            const DE = de;
            return "{" + DeAsString(DE.dataExp) + "}";
        }
        case ast.ASTKinds.DE_Set: {
            const DE = de;
            return "{" + DE.name + " | " + DeAsString(DE.dataExp) + "}";
        }
        case ast.ASTKinds.DE_Partial: {
            const DE = de;
            return "{(" + DE.name + ", " + DeAsString(DE.left) + " | " + DeAsString(DE.right) + "}";
        }
        case ast.ASTKinds.DE_Function: {
            const DE = de;
            return DE.function.name + "(" + DeAsString(DE.arguments) + ")";
        }
        case ast.ASTKinds.DE_Infix: {
            const DE = de;
            return DeAsString(DE.left) + " " + DE.function.name + " " + DeAsString(DE.right);
        }
        case ast.ASTKinds.DE_Tuple: {
            const DE = de;
            var out = DeAsString(DE.dataExps[0]);
            for (let i = 1; i < DE.dataExps.length; i++) {
                out = out.concat(", ").concat(DeAsString(DE.dataExps[i]));
            }
            return out;
        }
        case ast.ASTKinds.DE_Name: {
            const DE = de;
            return DE.name;
        }
        default: return "";
    }
}
function usedNames() {
    return types.map(x => x.typeName).concat(invalidTypes)
        .concat(variables.map(x => x.name)).concat(invalidVariables)
        .concat(constants.map(x => x.name)).concat(invalidConstants)
        .concat(functions.map(x => x.name)).concat(invalidFunctions)
        .concat(processes.map(x => x.name)).concat(invalidProcesses.map(x => x.name == null ? "" : x.name))
        .concat(aliasesSingle.map(x => x.name)).concat(invalidAliasesSingle)
        .concat(aliasesList.map(x => x.name)).concat(invalidAliasesList);
}
//Adds an LSP error object to errors[], with message and range.
//End position is optional, if not given then start/end become the same,
//which is often fine as LSP maps to the borders of semantic tokens.
function createErrorMessage(message, start, ending) {
    if (!inRootFile) {
        return;
    }
    errors.push({
        severity: vscode_languageserver_1.DiagnosticSeverity.Error,
        range: {
            start: { line: start.line - 1, character: start.offset },
            end: { line: ending == null ? start.line - 1 : ending.line - 1, character: ending == null ? start.offset : ending.offset }
        },
        message: message
    });
}
exports.createErrorMessage = createErrorMessage;
//Same as createErrorMessage, see immediately above
function createWarningMessage(message, start, ending) {
    if (!inRootFile) {
        return;
    }
    warnings.push({
        severity: vscode_languageserver_1.DiagnosticSeverity.Warning,
        range: {
            start: { line: start.line - 1, character: start.offset },
            end: { line: ending == null ? start.line - 1 : ending.line - 1, character: ending == null ? start.offset : ending.offset }
        },
        message: message
    });
}
exports.createWarningMessage = createWarningMessage;
//# sourceMappingURL=check.js.map