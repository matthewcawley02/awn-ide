"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNewToOldAST = void 0;
const newast = require("./ast");
const oldast = require("./parser");
const dummyPos = {
    overallPos: 0,
    line: 0,
    offset: 0
};
function convertNewToOldAST(oldroot) {
    var root = new newast.AWNRoot();
    root.parent = root;
    for (const oldblock of oldroot.block) {
        switch (oldblock.kind) {
            case oldast.ASTKinds.Block_1: { //multiple includes
                let newblock = new newast.Block_Include(root, oldblock.pos);
                root.blocks.push(newblock);
                for (const oldinclude of oldblock.include) {
                    let ni = new newast.Include(newblock, oldinclude.name.value, oldinclude.posS, oldinclude.posE);
                    newblock.includes.push(ni);
                }
                break;
            }
            case oldast.ASTKinds.Block_2: { //single include
                let newblock = new newast.Block_Include(root, oldblock.pos);
                root.blocks.push(newblock);
                let ni = new newast.Include(newblock, oldblock.include.name.value, oldblock.include.posS, oldblock.include.posE);
                newblock.includes.push(ni);
                break;
            }
            case oldast.ASTKinds.Block_3: { //type
                let newblock = new newast.Block_Type(root, oldblock.pos);
                root.blocks.push(newblock);
                for (const oldtype of oldblock.type) {
                    let newtype = new newast.Type(newblock, oldtype.typeName.value, oldtype.posS, oldtype.posE);
                    newblock.types.push(newtype);
                    if (oldtype.typeExprW !== null) {
                        newtype.typeExpr = convertTypeExpr(oldtype.typeExprW.typeExpr, newtype);
                    }
                }
                break;
            }
            case oldast.ASTKinds.Block_4: { //variable
                let newblock = new newast.Block_Variable(root, oldblock.pos);
                root.blocks.push(newblock);
                for (const oldconvar of oldblock.var) {
                    let newvar = convertConVar(oldconvar, newblock, true);
                    newblock.vars.push(...newvar);
                }
                break;
            }
            case oldast.ASTKinds.Block_5: { //constant
                let newblock = new newast.Block_Constant(root, oldblock.pos);
                root.blocks.push(newblock);
                for (const oldconvar of oldblock.const) {
                    let newconst = convertConVar(oldconvar, newblock, false);
                    newblock.consts.push(...newconst);
                }
                break;
            }
            case oldast.ASTKinds.Block_6: { //function
                let newblock = new newast.Block_Function(root, oldblock.pos);
                root.blocks.push(newblock);
                for (const oldfunc of oldblock.func) {
                    let newfunc = convertFunction(oldfunc, newblock);
                    newblock.funcs.push(newfunc);
                }
                break;
            }
            case oldast.ASTKinds.Block_7: { //multiple processes
                let newblock = new newast.Block_Process(root, oldblock.pos, false);
                root.blocks.push(newblock);
                for (const oldproc of oldblock.proc) {
                    let newproc = convertProcess(oldproc, newblock);
                    newblock.procs.push(newproc);
                }
                break;
            }
            case oldast.ASTKinds.Block_8: { //single process
                let newblock = new newast.Block_Process(root, oldblock.pos, true);
                root.blocks.push(newblock);
                let newproc = convertProcess(oldblock.proc, newblock);
                newblock.procs.push(newproc);
                break;
            }
            case oldast.ASTKinds.Block_9: { //alias
                let newblock = new newast.Block_Alias(root, oldblock.pos);
                root.blocks.push(newblock);
                for (const oldalias of oldblock.alias) {
                    let newalias = convertAlias(oldalias, newblock);
                    newblock.aliases.push(newalias);
                }
                break;
            }
        }
    }
    return root;
}
exports.convertNewToOldAST = convertNewToOldAST;
//Converts an old form type expression into a new one.
//See ast-documentation.md for explanation of this function.
function convertTypeExpr(node, parent) {
    var newnode;
    switch (node.kind) {
        case oldast.ASTKinds.TE_1: { //brackets
            newnode = new newast.TE_Brack(parent);
            newnode.typeExpr = convertTypeExpr(node.typeExpr, newnode);
            break;
        }
        case oldast.ASTKinds.TE_2: { //pow
            newnode = new newast.TE_Pow(parent, node.pos);
            newnode.typeExpr = convertTypeExpr(node.typeExpr, newnode);
            break;
        }
        case oldast.ASTKinds.TE_3: { //Array
            newnode = new newast.TE_Array(parent);
            newnode.typeExpr = convertTypeExpr(node.typeExpr, newnode);
            break;
        }
        case oldast.ASTKinds.TE_4: { //name
            newnode = new newast.TE_Name(parent, node.typename.value, node.posS, node.posE);
            break;
        }
    }
    var returnednode = newnode;
    if (node.typeExprMore !== null) {
        convertLRTypeExpr(node.typeExprMore, newnode);
    }
    while (returnednode.parent != parent) { //make sure we're returning the correct thing, as the parent may have changed
        returnednode = returnednode.parent;
    }
    return returnednode;
}
function convertLRTypeExpr(node, parent) {
    var newnode;
    switch (node.kind) {
        case oldast.ASTKinds.TE1_1: { //function
            newnode = new newast.TE_FuncFull(parent); //(parent set temporarily, same for those below)
            insertLRNodeTE(newnode);
            newnode.right = convertTypeExpr(node.typeExpr, newnode);
            break;
        }
        case oldast.ASTKinds.TE1_2: { //partial
            newnode = new newast.TE_FuncPart(parent);
            insertLRNodeTE(newnode);
            newnode.right = convertTypeExpr(node.typeExpr, newnode);
            break;
        }
        case oldast.ASTKinds.TE1_3: { //product
            newnode = new newast.TE_Product(parent);
            insertLRNodeTE(newnode);
            switch (node.products.length) {
                case 1: {
                    newnode.right = convertTypeExpr(node.products[0].typeExpr, newnode);
                    break;
                }
                case 2: {
                    newnode.right = new newast.TE_Product(newnode);
                    var child = newnode.right;
                    child.left = convertTypeExpr(node.products[1].typeExpr, child);
                    child.left = convertTypeExpr(node.products[2].typeExpr, child);
                    break;
                }
                default: {
                    newnode.right = new newast.TE_Product(newnode);
                    var curnode = newnode.right;
                    for (let i = 1;; i++) {
                        curnode.left = convertTypeExpr(node.products[i].typeExpr, curnode);
                        //on the second last chlid, set right to the last child instead of being another TE_Product
                        if (i == node.products.length - 2) {
                            curnode.right = convertTypeExpr(node.products[i + 1].typeExpr, curnode);
                            break;
                        }
                        curnode.right = new newast.TE_Product(curnode);
                        curnode = curnode.right;
                    }
                    break;
                }
            }
            newnode.children = flattenTE(newnode);
            break;
        }
    }
}
function insertLRNodeTE(node) {
    //first, find where to insert the node by iterating up the tree.
    var newChild = node;
    var newParent = node.parent;
    for (let i = 0;; i++) {
        //the second case is escaping through a bracket on the first iteration, as in that case we aren't actually inside the bracket, just an LR child of it
        if ((node.precedence > newParent.precedence) || (newast.isBracketType(newParent.kind) && i == 0)) {
            newChild = newParent;
            newParent = newParent.parent;
        }
        else {
            break;
        }
    }
    //border of new node and new child
    newChild.parent = node;
    node.left = newChild;
    //border of new node and new parent
    node.parent = newParent;
}
//Turn a binary tree TE_Product node into a node with an array that obeys correct precedence rules.
//During conversion, Products are given right precedence (i.e. a x b x c is parsed as a x (b x c))
//This simplifies this function - we just add what is on the left at all times, then check if the right is another product.
function flattenTE(typeExp) {
    var children = [];
    children.push(typeExp.left);
    if (typeExp.right.kind == newast.ASTKinds.TE_Product) {
        children.push(...flattenTE(typeExp.right));
    }
    else {
        children.push(typeExp.right);
    }
    return children;
}
//Same thing as flattenTE but for tuple DEs instead
function flattenDE(dataExp) {
    var children = [];
    children.push(dataExp.left);
    if (dataExp.right.kind == newast.ASTKinds.DE_Tuple) {
        children.push(...flattenDE(dataExp.right));
    }
    else {
        children.push(dataExp.right);
    }
    return children;
}
function convertConVar(node, parent, isVar) {
    if (isVar) {
        var convar = [];
    }
    else {
        var convar = [];
    }
    switch (node.kind) {
        case oldast.ASTKinds.ConVar_1: { //list of convar (same TE)
            if (isVar) {
                convar.push(new newast.Variable(parent, node.nameFirst.value, node.posS, node.posE));
                convar.push(...node.namesMore.map(x => new newast.Variable(parent, x.name.value, x.posS, x.posE)));
            }
            else {
                convar.push(new newast.Constant(parent, node.nameFirst.value, node.posS, node.posE));
                convar.push(...node.namesMore.map(x => new newast.Constant(parent, x.name.value, x.posS, x.posE)));
            }
            break;
        }
        case oldast.ASTKinds.ConVar_2: { //singular convar
            if (isVar) {
                convar = [new newast.Variable(parent, node.name.value, node.posS, node.posE)];
            }
            else {
                convar = [new newast.Constant(parent, node.name.value, node.posS, node.posE)];
            }
            break;
        }
    }
    for (var c of convar) {
        c.typeExpr = convertTypeExpr(node.typeExpr, c); //TODO currently inefficient, convertTE is called every iteration
        c.typeDeclaredFirst = node.typeDeclaredFirst;
    }
    return convar;
}
function convertFunction(node, parent) {
    var func;
    switch (node.kind) {
        case oldast.ASTKinds.Function_1: { //function_prefix
            func = new newast.Function_Prefix(parent, node.name.value, node.posS, node.posE);
            break;
        }
        case oldast.ASTKinds.Function_2: { //function infix
            func = new newast.Function_Infix(parent, node.name.value, node.posS, node.posE);
            break;
        }
    }
    func.type = convertTypeExpr(node.typeExpr, func);
    return func;
}
function convertProcess(node, parent) {
    switch (node.kind) {
        case oldast.ASTKinds.Process_1: { //with args
            var proc = new newast.Process(parent, node.nameFirst.value, node.pos1S, node.pos1E);
            let arglist = [];
            if (node.argFirst != null) {
                arglist.push(new newast.ProcArg(proc, node.argFirst.value, node.pos2S, node.pos2E));
            }
            arglist.push(...node.argsMore.map(arg => new newast.ProcArg(proc, arg.name.value, arg.posS, arg.posE)));
            proc.argInfo = arglist;
            proc.proc = convertProcExp(node.proc, proc, parent);
            return proc;
        }
        case oldast.ASTKinds.Process_2: { //without args
            var proc = new newast.Process(parent, node.name.value, node.posS, node.posE);
            proc.proc = convertProcExp(node.proc, proc, parent);
            return proc;
        }
    }
}
function convertProcExp(node, curProcIn, parent) {
    var newproc;
    switch (node.kind) {
        case oldast.ASTKinds.SPE_1: { //guard
            newproc = new newast.SPE_Guard(parent, curProcIn, node.posDES, node.posDEE);
            newproc.dataExp = convertDataExp(node.dataExp, newproc);
            newproc.nextproc = convertProcExp(node.proc, curProcIn, newproc);
            break;
        }
        case oldast.ASTKinds.SPE_2: { //assignment
            newproc = new newast.SPE_Assign(parent, curProcIn, node.name.value, node.posA, node.posB, node.posC, node.posD);
            newproc.dataExpAssign = convertDataExp(node.dataExpAssignment, newproc);
            newproc.nextproc = convertProcExp(node.proc, curProcIn, newproc);
            break;
        }
        case oldast.ASTKinds.SPE_3: { //unicast
            newproc = new newast.SPE_Unicast(parent, curProcIn, node.pos, node.posA, node.posB, node.posC);
            newproc.dataExpL = convertDataExp(node.dataExpL, newproc);
            newproc.dataExpR = convertDataExp(node.dataExpR, newproc);
            newproc.procA = convertProcExp(node.procL, curProcIn, newproc);
            newproc.procB = convertProcExp(node.procR, curProcIn, newproc);
            break;
        }
        case oldast.ASTKinds.SPE_4: { //broadcast
            newproc = new newast.SPE_Broadcast(parent, curProcIn, node.pos, node.posA, node.posB);
            newproc.dataExp = convertDataExp(node.dataExp, newproc);
            newproc.nextproc = convertProcExp(node.proc, curProcIn, newproc);
            break;
        }
        case oldast.ASTKinds.SPE_5: { //groupcast
            newproc = new newast.SPE_Groupcast(parent, curProcIn, node.pos, node.posA, node.posB, node.posC);
            newproc.dataExpL = convertDataExp(node.dataExpL, newproc);
            newproc.dataExpR = convertDataExp(node.dataExpR, newproc);
            newproc.nextproc = convertProcExp(node.proc, curProcIn, newproc);
            break;
        }
        case oldast.ASTKinds.SPE_6: { //send
            newproc = new newast.SPE_Send(parent, curProcIn, node.pos, node.posA, node.posB);
            newproc.dataExp = convertDataExp(node.dataExp, newproc);
            newproc.nextproc = convertProcExp(node.proc, curProcIn, newproc);
            break;
        }
        case oldast.ASTKinds.SPE_7: { //deliver
            newproc = new newast.SPE_Deliver(parent, curProcIn, node.pos, node.posA, node.posB);
            newproc.dataExp = convertDataExp(node.dataExp, newproc);
            newproc.nextproc = convertProcExp(node.proc, curProcIn, newproc);
            break;
        }
        case oldast.ASTKinds.SPE_8: { //receive
            newproc = new newast.SPE_Receive(parent, curProcIn, node.pos, node.name.value, node.posS, node.posE);
            newproc.dataExps = node.dataExpList.map(x => convertDataExp(x.dataExp, newproc));
            newproc.nextproc = convertProcExp(node.proc, curProcIn, newproc);
            break;
        }
        case oldast.ASTKinds.SPE_9: { //bracket
            newproc = new newast.SPE_Brack(parent, curProcIn);
            newproc.proc = convertProcExp(node.proc, curProcIn, parent);
            break;
        }
        case oldast.ASTKinds.SPE_10: { //call
            newproc = new newast.SPE_Call(parent, curProcIn, node.name.value, node.posS, node.posE);
            var args = [];
            if (node.dataExpFirst != null) {
                args.push(convertDataExp(node.dataExpFirst, newproc));
            }
            args.push(...node.dataExpW.map(x => convertDataExp(x.dataExp, newproc)));
            var what = newproc;
            what.args = args; //idk why i have to do this???
            break;
        }
    }
    var returnednode = newproc;
    if (node.procMore !== null) {
        convertLRProcExp(node.procMore, curProcIn, newproc);
    }
    while (returnednode.parent != parent) { //make sure we're returning the correct thing, as the parent may have changed
        returnednode = returnednode.parent;
    }
    return returnednode;
}
//this is just SPE_Choice
function convertLRProcExp(node, curProcIn, parent) {
    var newnode = new newast.SPE_Choice(parent, curProcIn); //parent set temporarily
    insertLRNodeSPE(newnode);
    newnode.right = convertProcExp(node.proc, curProcIn, newnode);
}
function insertLRNodeSPE(node) {
    var newChild = node;
    var newParent = node.parent;
    for (let i = 0;; i++) {
        //the second case is escaping through a bracket on the first iteration, as in that case we aren't actually inside the bracket, just an LR child of it
        if ((node.precedence > newParent.precedence) || (newast.isBracketType(newParent.kind) && i == 0)) {
            newChild = newParent;
            newParent = newParent.parent;
        }
        else {
            break;
        }
    }
    //border of new node and new child
    newChild.parent = node;
    node = node;
    node.left = newChild;
    //border of new node and new parent
    node.parent = newParent;
}
function convertDataExp(node, parent) {
    var newnode;
    switch (node.kind) {
        case oldast.ASTKinds.DE_3: { //singleton
            newnode = new newast.DE_Singleton(parent);
            newnode.dataExp = convertDataExp(node.dataExp, newnode);
            break;
        }
        case oldast.ASTKinds.DE_1: { //partial
            newnode = new newast.DE_Partial(parent, node.name.value, node.posS, node.posE);
            newnode.left = convertDataExp(node.dataExpLeft, newnode);
            newnode.right = convertDataExp(node.dataExpRight, newnode);
            break;
        }
        case oldast.ASTKinds.DE_2: { //set
            newnode = new newast.DE_Set(parent, node.name.value, node.posS, node.posE);
            newnode.dataExp = convertDataExp(node.dataExpRight, newnode);
            break;
        }
        case oldast.ASTKinds.DE_4: { //lambda
            newnode = new newast.DE_Lambda(parent, node.name.value, node.posS, node.pos);
            newnode.dataExp = convertDataExp(node.dataExp, newnode);
            break;
        }
        case oldast.ASTKinds.DE_5: { //forall
            newnode = new newast.DE_Forall(parent, node.name.value, node.posS, node.pos);
            newnode.dataExp = convertDataExp(node.dataExp, newnode);
            break;
        }
        case oldast.ASTKinds.DE_6: { //exists
            newnode = new newast.DE_Exists(parent, node.name.value, node.posS, node.pos);
            newnode.dataExp = convertDataExp(node.dataExp, newnode);
            break;
        }
        case oldast.ASTKinds.DE_7: { //function
            newnode = new newast.DE_Function_Prefix(parent, node.name.value, node.posN, node.posNEnd, node.posS, node.posE);
            newnode.dataExp = convertDataExp(node.dataExp, newnode);
            break;
        }
        case oldast.ASTKinds.DE_8: { //brackets
            newnode = new newast.DE_Brack(parent);
            newnode.dataExp = convertDataExp(node.dataExp, newnode);
            break;
        }
        case oldast.ASTKinds.DE_9: { //name
            newnode = new newast.DE_Name(parent, node.name.value, node.posS, node.posE);
            break;
        }
    }
    var returnednode = newnode;
    if (node.dataExpMore !== null) {
        convertLRDataExp(node.dataExpMore, newnode);
    }
    while (returnednode.parent != parent) { //make sure we're returning the correct thing, as the parent may have changed
        returnednode = returnednode.parent;
    }
    return returnednode;
}
function convertLRDataExp(node, parent) {
    var newnode;
    switch (node.kind) {
        case oldast.ASTKinds.DE1_1:
            newnode = new newast.DE_Function_Infix(parent, 5, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, "->", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_2:
            newnode = new newast.DE_Function_Infix(parent, 5, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, "<->", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_3:
            newnode = new newast.DE_Function_Infix(parent, 4, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, "&", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_4:
            newnode = new newast.DE_Function_Infix(parent, 4, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, "|", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_5:
            newnode = new newast.DE_Function_Infix(parent, 3, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, "=", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_6:
            newnode = new newast.DE_Function_Infix(parent, 3, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, "!=", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_7:
            newnode = new newast.DE_Function_Infix(parent, 3, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, ">=", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_8:
            newnode = new newast.DE_Function_Infix(parent, 3, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, "<=", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_9:
            newnode = new newast.DE_Function_Infix(parent, 3, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, ">", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_10:
            newnode = new newast.DE_Function_Infix(parent, 3, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, "<", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_11:
            newnode = new newast.DE_Function_Infix(parent, 2, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, ":", dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_12:
            newnode = new newast.DE_Function_Infix(parent, 1, node.posS, node.posE);
            newnode.function = new newast.Function_Infix(newnode, node.func.value, dummyPos, dummyPos);
            insertLRNodeDE(newnode);
            newnode.right = convertDataExp(node.dataExp, newnode);
            break;
        case oldast.ASTKinds.DE1_13: {
            newnode = new newast.DE_Tuple(parent);
            insertLRNodeDE(newnode);
            switch (node.objects.length) {
                case 1: {
                    newnode.right = convertDataExp(node.objects[0].dataExp, newnode);
                    break;
                }
                case 2: {
                    newnode.right = new newast.DE_Tuple(newnode);
                    var child = newnode.right;
                    child.left = convertDataExp(node.objects[1].dataExp, child);
                    child.left = convertDataExp(node.objects[2].dataExp, child);
                    break;
                }
                default: {
                    newnode.right = new newast.DE_Tuple(newnode);
                    var curnode = newnode.right;
                    for (let i = 1;; i++) {
                        curnode.left = convertDataExp(node.objects[i].dataExp, curnode);
                        //on the second last chlid, set right to the last child instead of being another TE_Product
                        if (i == node.objects.length - 2) {
                            curnode.right = convertDataExp(node.objects[i + 1].dataExp, curnode);
                            break;
                        }
                        curnode.right = new newast.DE_Tuple(curnode);
                        curnode = curnode.right;
                    }
                    break;
                }
            }
            newnode.dataExps = flattenDE(newnode);
            break;
        }
    }
}
function insertLRNodeDE(node) {
    //first, find where to insert the node by iterating up the tree.
    var newChild = node;
    var newParent = node.parent;
    for (let i = 0;; i++) {
        //the second case is escaping through a bracket on the first iteration, as in that case we aren't actually inside the bracket, just an LR child of it
        if ((node.precedence > newParent.precedence) || (newast.isBracketType(newParent.kind) && i == 0)) {
            newChild = newParent;
            newParent = newParent.parent;
        }
        else {
            break;
        }
    }
    //border of new node and new child
    newChild.parent = node;
    switch (node.kind) {
        case newast.ASTKinds.DE_Tuple: {
            node = node;
            node.left = newChild;
        }
        case newast.ASTKinds.DE_Infix:
            node = node;
            node.left = newChild;
    }
    //border of new node and new parent
    node.parent = newParent;
}
function convertAlias(node, parent) {
    switch (node.kind) {
        case oldast.ASTKinds.Alias_1: { //alias list
            let newnode = new newast.Alias_List(parent, node.nameFirst.value, node.pos1S, node.pos1E);
            let arglist = [];
            if (node.argFirst != null) {
                arglist.push(node.argFirst.value);
                newnode.argsPosS.push(node.pos2S);
                newnode.argsPosE.push(node.pos2E);
            }
            arglist.push(...node.argsMore.map(arg => arg.name.value));
            newnode.argsPosS.push(...node.argsMore.map(arg => arg.posS));
            newnode.argsPosE.push(...node.argsMore.map(arg => arg.posE));
            newnode.argNames = arglist;
            return newnode;
        }
        case oldast.ASTKinds.Alias_2: { //alias data
            let newnode = new newast.Alias_Data(parent, node.name.value, node.posS, node.posE);
            newnode.dataExp = convertDataExp(node.dataExp, newnode);
            return newnode;
        }
    }
}
//# sourceMappingURL=convertAST.js.map