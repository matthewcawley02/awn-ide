"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DE_Exists = exports.DE_Forall = exports.DE_Lambda = exports.DE_Partial = exports.DE_Set = exports.DE_Singleton = exports.DE = exports.SPE_Brack = exports.SPE_Choice = exports.SPE_Name = exports.SPE_Call = exports.SPE_Receive = exports.SPE_Deliver = exports.SPE_Send = exports.SPE_Groupcast = exports.SPE_Broadcast = exports.SPE_Unicast = exports.SPE_Assign = exports.SPE_Guard = exports.Alias_Data = exports.Alias_List = exports.Process = exports.Function_Infix = exports.Function_Prefix = exports.Function = exports.Constant = exports.Variable = exports.TE_Any = exports.TE_Product = exports.TE_FuncPart = exports.TE_FuncFull = exports.TE_Function = exports.TE_RootType = exports.TE_Name = exports.TE_Array = exports.TE_Pow = exports.TE_Brack = exports.Type = exports.Include = exports.Block_Alias = exports.Block_Process = exports.Block_Function = exports.Block_Constant = exports.Block_Variable = exports.Block_Type = exports.Block_Include = exports.AWNRoot = exports.Node = exports.isBracketType = exports.ASTKinds = void 0;
exports.DE_Function_Infix = exports.DE_Function_Prefix = exports.DE_Tuple = exports.DE_Name = exports.DE_Brack = void 0;
var ASTKinds;
(function (ASTKinds) {
    ASTKinds["AWNRoot"] = "AWNRoot";
    ASTKinds["Block_Include"] = "Block_Include";
    ASTKinds["Block_Type"] = "Block_Type";
    ASTKinds["Block_Variable"] = "Block_Variable";
    ASTKinds["Block_Constant"] = "Block_Constant";
    ASTKinds["Block_Function"] = "Block_Function";
    ASTKinds["Block_Process"] = "Block_Process";
    ASTKinds["Block_Alias"] = "Block_Alias";
    ASTKinds["Include"] = "Include";
    ASTKinds["Type"] = "Type";
    ASTKinds["Variable"] = "Variable";
    ASTKinds["Constant"] = "Constant";
    ASTKinds["ConVar"] = "ConVar";
    ASTKinds["Function_Prefix"] = "Function_Prefix";
    ASTKinds["Function_Infix"] = "Function_Infix";
    ASTKinds["Process"] = "Process";
    ASTKinds["Alias_List"] = "Alias_List";
    ASTKinds["Alias_Data"] = "Alias_Data";
    ASTKinds["TE_Brack"] = "TE_Brack";
    ASTKinds["TE_Pow"] = "TE_Pow";
    ASTKinds["TE_Array"] = "TE_Array";
    ASTKinds["TE_Name"] = "TE_Name";
    ASTKinds["TE_RootType"] = "TE_RootType";
    ASTKinds["TE_FuncPart"] = "TE_FuncPart";
    ASTKinds["TE_FuncFull"] = "TE_FuncFull";
    ASTKinds["TE_Product"] = "TE_Product";
    ASTKinds["TE_Any"] = "TE_Any";
    ASTKinds["SPE_Guard"] = "SPE_Guard";
    ASTKinds["SPE_Unicast"] = "SPE_Unicast";
    ASTKinds["SPE_Broadcast"] = "SPE_Broadcast";
    ASTKinds["SPE_Assign"] = "SPE_Assign";
    ASTKinds["SPE_Brack"] = "SPE_Brack";
    ASTKinds["SPE_Call"] = "SPE_Call";
    ASTKinds["SPE_Choice"] = "SPE_Choice";
    ASTKinds["SPE_Deliver"] = "SPE_Deliver";
    ASTKinds["SPE_Groupcast"] = "SPE_Groupcast";
    ASTKinds["SPE_Name"] = "SPE_Name";
    ASTKinds["SPE_Receive"] = "SPE_Receive";
    ASTKinds["SPE_Send"] = "SPE_Send";
    ASTKinds["DE_Infix"] = "DE_Infix";
    ASTKinds["DE_Brack"] = "DE_Brack";
    ASTKinds["DE_Exists"] = "DE_Exists";
    ASTKinds["DE_Forall"] = "DE_Forall";
    ASTKinds["DE_Function"] = "DE_Function";
    ASTKinds["DE_Lambda"] = "DE_Lambda";
    ASTKinds["DE_Name"] = "DE_Name";
    ASTKinds["DE_Partial"] = "DE_Partial";
    ASTKinds["DE_Set"] = "DE_Set";
    ASTKinds["DE_Singleton"] = "DE_Singleton";
    ASTKinds["DE_Tuple"] = "DE_Tuple";
})(ASTKinds || (exports.ASTKinds = ASTKinds = {}));
function isBracketType(x) {
    return x === ASTKinds.TE_Brack || x === ASTKinds.TE_Array || x === ASTKinds.TE_Pow || x === ASTKinds.DE_Brack || x === ASTKinds.SPE_Brack || x === ASTKinds.DE_Function;
}
exports.isBracketType = isBracketType;
class Node {
    constructor(precedence, kind, parent) {
        this.parent = parent;
        this.precedence = precedence;
        this.kind = kind;
    }
}
exports.Node = Node;
//Nodes have children properties as non-nullable (or empty list). This is so 
//when constructing the AST, we can define all other properties 
//of the node first, then define the child immediately after.
//(Otherwise [defining the child] will execute before the rest
//of the node is built, and we can't have that or rotating
//won't work as the parents won't exist.)
class AWNRoot extends Node {
    constructor() {
        //Going with the approach of having the root have itself as parent to avoid null checks.
        //The one time this node is instantiated, immediately afterwards, parent is set properly.
        super(10, ASTKinds.AWNRoot, {});
        this.blocks = [];
    }
}
exports.AWNRoot = AWNRoot;
class Block_Include extends Node {
    constructor(parent, keywordPos) {
        super(10, ASTKinds.Block_Include, parent);
        this.includes = [];
        this.keywordPos = keywordPos;
    }
}
exports.Block_Include = Block_Include;
class Block_Type extends Node {
    constructor(parent, keywordPos) {
        super(10, ASTKinds.Block_Type, parent);
        this.types = [];
        this.keywordPos = keywordPos;
    }
}
exports.Block_Type = Block_Type;
class Block_Variable extends Node {
    constructor(parent, keywordPos) {
        super(10, ASTKinds.Block_Variable, parent);
        this.vars = [];
        this.keywordPos = keywordPos;
    }
}
exports.Block_Variable = Block_Variable;
class Block_Constant extends Node {
    constructor(parent, keywordPos) {
        super(10, ASTKinds.Block_Constant, parent);
        this.consts = [];
        this.keywordPos = keywordPos;
    }
}
exports.Block_Constant = Block_Constant;
class Block_Function extends Node {
    constructor(parent, keywordPos) {
        super(10, ASTKinds.Block_Function, parent);
        this.funcs = [];
        this.keywordPos = keywordPos;
    }
}
exports.Block_Function = Block_Function;
class Block_Process extends Node {
    constructor(parent, keywordPos, definedAsProc) {
        super(10, ASTKinds.Block_Process, parent);
        this.procs = [];
        this.keywordPos = keywordPos;
        this.definedAsProc = definedAsProc;
    }
}
exports.Block_Process = Block_Process;
class Block_Alias extends Node {
    constructor(parent, keywordPos) {
        super(10, ASTKinds.Block_Alias, parent);
        this.aliases = [];
        this.keywordPos = keywordPos;
    }
}
exports.Block_Alias = Block_Alias;
class Include extends Node {
    constructor(parent, name, posS, posE) {
        super(0, ASTKinds.Include, parent);
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.Include = Include;
class Type extends Node {
    constructor(parent, typeName, posS, posE) {
        super(10, ASTKinds.Type, parent);
        this.typeName = typeName;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.Type = Type;
class TE_Brack extends Node {
    constructor(parent) {
        super(4, ASTKinds.TE_Brack, parent);
    }
}
exports.TE_Brack = TE_Brack;
class TE_Pow extends Node {
    constructor(parent, pos, typeExpr) {
        super(4, ASTKinds.TE_Pow, parent);
        if (typeExpr != null) {
            this.typeExpr = typeExpr;
        }
        this.pos = pos;
    }
}
exports.TE_Pow = TE_Pow;
class TE_Array extends Node {
    constructor(parent) {
        super(4, ASTKinds.TE_Array, parent);
    }
}
exports.TE_Array = TE_Array;
class TE_Name extends Node {
    constructor(parent, typename, posS, posE) {
        super(0, ASTKinds.TE_Name, parent);
        this.typename = typename;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.TE_Name = TE_Name;
class TE_RootType extends Node {
    constructor(parent, typename) {
        super(0, ASTKinds.TE_RootType, parent);
        this.typename = typename;
    }
}
exports.TE_RootType = TE_RootType;
//both full and partial functions extend this
class TE_Function extends Node {
    get sigType() {
        return convertToTEProduct(this.left);
    }
    get outType() { return this.right; }
    get isBTE() {
        const sig = this.sigType;
        if (sig == null) {
            return false;
        }
        return sig.children.length == 2;
    }
}
exports.TE_Function = TE_Function;
class TE_FuncFull extends TE_Function {
    constructor(parent, left, right) {
        super(2, ASTKinds.TE_FuncFull, parent);
        if (left != null && right != null) {
            this.left = left;
            this.right = right;
        }
    }
}
exports.TE_FuncFull = TE_FuncFull;
class TE_FuncPart extends TE_Function {
    constructor(parent, left, right) {
        super(3, ASTKinds.TE_FuncPart, parent);
        if (left != null && right != null) {
            this.left = left;
            this.right = right;
        }
    }
}
exports.TE_FuncPart = TE_FuncPart;
class TE_Product extends Node {
    constructor(parent, children) {
        super(1, ASTKinds.TE_Product, parent);
        if (children != null) {
            this.children = children;
        }
    }
}
exports.TE_Product = TE_Product;
class TE_Any extends Node {
    constructor(parent) {
        super(0, ASTKinds.TE_Any, parent);
    }
}
exports.TE_Any = TE_Any;
class Variable extends Node {
    constructor(parent, name, posS, posE) {
        super(10, ASTKinds.Variable, parent);
        this.typeDeclaredFirst = false; //needed for syntax highlighting
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.Variable = Variable;
class Constant extends Node {
    constructor(parent, name, posS, posE) {
        super(10, ASTKinds.Constant, parent);
        this.typeDeclaredFirst = false; //needed for syntax highlighting
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.Constant = Constant;
class Function extends Node {
    constructor(precedence, kind, parent, name, posS, posE) {
        super(precedence, kind, parent);
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
    get isBinary() { return this.sigType.children.length == 2; }
}
exports.Function = Function;
class Function_Prefix extends Function {
    constructor(parent, name, posS, posE) {
        super(10, ASTKinds.Function_Prefix, parent, name, posS, posE);
    }
}
exports.Function_Prefix = Function_Prefix;
class Function_Infix extends Function {
    constructor(parent, name, posS, posE) {
        super(10, ASTKinds.Function_Infix, parent, name, posS, posE);
    }
}
exports.Function_Infix = Function_Infix;
class Process extends Node {
    constructor(parent, name, posS, posE) {
        super(10, ASTKinds.Process, parent);
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.Process = Process;
class Alias_List extends Node {
    constructor(parent, name, posS, posE) {
        super(10, ASTKinds.Alias_List, parent);
        this.args = [];
        this.argsPosS = [];
        this.argsPosE = [];
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.Alias_List = Alias_List;
class Alias_Data extends Node {
    constructor(parent, name, posS, posE) {
        super(10, ASTKinds.Alias_Data, parent);
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.Alias_Data = Alias_Data;
class SPE_Guard extends Node {
    constructor(parent, DEStart, DEEnd) {
        super(9, ASTKinds.SPE_Guard, parent);
        this.DEStart = DEStart;
        this.DEEnd = DEEnd;
    }
}
exports.SPE_Guard = SPE_Guard;
class SPE_Assign extends Node {
    constructor(parent, name, nameStart, varStart, assignExpStart, end) {
        super(9, ASTKinds.SPE_Assign, parent);
        this.name = name;
        this.nameStart = nameStart;
        this.varStart = varStart;
        this.assignExpStart = assignExpStart;
        this.end = end;
    }
}
exports.SPE_Assign = SPE_Assign;
class SPE_Unicast extends Node {
    constructor(parent, start, DELstart, DELend, DERend) {
        super(9, ASTKinds.SPE_Unicast, parent);
        this.DELstart = DELstart;
        this.DELend = DELend;
        this.DERend = DERend;
        this.start = start;
    }
}
exports.SPE_Unicast = SPE_Unicast;
class SPE_Broadcast extends Node {
    constructor(parent, start, DEstart, DEend) {
        super(9, ASTKinds.SPE_Broadcast, parent);
        this.DEstart = DEstart;
        this.DEend = DEend;
        this.start = start;
    }
}
exports.SPE_Broadcast = SPE_Broadcast;
class SPE_Groupcast extends Node {
    constructor(parent, start, DELstart, DELend, DERend) {
        super(9, ASTKinds.SPE_Groupcast, parent);
        this.DELstart = DELstart;
        this.DELend = DELend;
        this.DERend = DERend;
        this.start = start;
    }
}
exports.SPE_Groupcast = SPE_Groupcast;
class SPE_Send extends Node {
    constructor(parent, start, DEstart, DEend) {
        super(9, ASTKinds.SPE_Send, parent);
        this.DEstart = DEstart;
        this.DEend = DEend;
        this.start = start;
    }
}
exports.SPE_Send = SPE_Send;
class SPE_Deliver extends Node {
    constructor(parent, start, DEstart, DEend) {
        super(9, ASTKinds.SPE_Deliver, parent);
        this.DEstart = DEstart;
        this.DEend = DEend;
        this.start = start;
    }
}
exports.SPE_Deliver = SPE_Deliver;
class SPE_Receive extends Node {
    constructor(parent, start, name, namePos, nameEnd) {
        super(9, ASTKinds.SPE_Receive, parent);
        this.name = name;
        this.namePos = namePos;
        this.nameEnd = nameEnd;
        this.start = start;
    }
}
exports.SPE_Receive = SPE_Receive;
class SPE_Call extends Node {
    constructor(parent, name, posS, posE) {
        super(9, ASTKinds.SPE_Call, parent);
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.SPE_Call = SPE_Call;
class SPE_Name extends Node {
    constructor(parent, name, posS, posE) {
        super(9, ASTKinds.SPE_Name, parent);
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.SPE_Name = SPE_Name;
class SPE_Choice extends Node {
    constructor(parent) {
        super(10, ASTKinds.SPE_Choice, parent);
    }
}
exports.SPE_Choice = SPE_Choice;
class SPE_Brack extends Node {
    constructor(parent) {
        super(10, ASTKinds.SPE_Brack, parent);
    }
}
exports.SPE_Brack = SPE_Brack;
class DE extends Node {
    constructor(precedence, kind, parent) {
        super(precedence, kind, parent);
    }
}
exports.DE = DE;
class DE_Singleton extends DE {
    constructor(parent) {
        super(0, ASTKinds.DE_Singleton, parent);
    }
}
exports.DE_Singleton = DE_Singleton;
class DE_Set extends DE {
    constructor(parent, name, posS, posE) {
        super(0, ASTKinds.DE_Set, parent);
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.DE_Set = DE_Set;
class DE_Partial extends DE {
    constructor(parent, name, posS, posE) {
        super(0, ASTKinds.DE_Partial, parent);
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.DE_Partial = DE_Partial;
class DE_Lambda extends DE {
    constructor(parent, name, namePos, startPos) {
        super(6, ASTKinds.DE_Lambda, parent);
        this.name = name;
        this.namePos = namePos;
        this.startPos = startPos;
    }
}
exports.DE_Lambda = DE_Lambda;
class DE_Forall extends DE {
    constructor(parent, name, namePos, startPos) {
        super(6, ASTKinds.DE_Forall, parent);
        this.name = name;
        this.namePos = namePos;
        this.startPos = startPos;
    }
}
exports.DE_Forall = DE_Forall;
class DE_Exists extends DE {
    constructor(parent, name, namePos, startPos) {
        super(6, ASTKinds.DE_Exists, parent);
        this.name = name;
        this.namePos = namePos;
        this.startPos = startPos;
    }
}
exports.DE_Exists = DE_Exists;
class DE_Brack extends DE {
    constructor(parent) {
        super(10, ASTKinds.DE_Brack, parent);
    }
}
exports.DE_Brack = DE_Brack;
class DE_Name extends DE {
    constructor(parent, name, posS, posE) {
        super(0, ASTKinds.DE_Name, parent);
        this.refersTo = ASTKinds.AWNRoot; //what kind of object the DE_Name refers to - note this is different to what type it is
        this.name = name;
        this.posS = posS;
        this.posE = posE;
    }
}
exports.DE_Name = DE_Name;
class DE_Tuple extends DE {
    constructor(parent) {
        super(7, ASTKinds.DE_Tuple, parent);
    }
}
exports.DE_Tuple = DE_Tuple;
//DE_Function is Name(DE)
//DE is eventually converted to DE_Tuple - if it is not a tuple, it becomes one with 1 element
class DE_Function_Prefix extends DE {
    constructor(parent, name, sigStart, sigEnd, argPos, endPos) {
        super(10, ASTKinds.DE_Function, parent);
        this.name = name;
        this.sigStart = sigStart;
        this.sigEnd = sigEnd;
        this.argPos = argPos;
        this.endPos = endPos;
    }
}
exports.DE_Function_Prefix = DE_Function_Prefix;
class DE_Function_Infix extends DE {
    constructor(parent, precedence, sigStart, sigEnd) {
        super(precedence, ASTKinds.DE_Infix, parent);
        this.sigStart = sigStart;
        this.sigEnd = sigEnd;
    }
}
exports.DE_Function_Infix = DE_Function_Infix;
function convertToTEProduct(typeExp) {
    switch (typeExp.kind) {
        case ASTKinds.TE_Brack: return convertToTEProduct(typeExp.typeExpr);
        case ASTKinds.TE_Array: return new TE_Product(typeExp.parent, [typeExp.typeExpr]);
        case ASTKinds.TE_Pow: return new TE_Product(typeExp.parent, [typeExp.typeExpr]);
        case ASTKinds.TE_Name: return new TE_Product(typeExp.parent, [typeExp]);
        case ASTKinds.TE_Product: return typeExp;
        default: return null;
    }
}
//# sourceMappingURL=ast.js.map