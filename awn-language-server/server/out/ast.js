"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DE_Name = exports.DE_Brack = exports.DE_Exists = exports.DE_Forall = exports.DE_Lambda = exports.DE_Set = exports.DE_Partial = exports.DE_Singleton = exports.DE = exports.SPE_Choice = exports.SPE_Name = exports.SPE_Call = exports.SPE_Receive = exports.SPE_Deliver = exports.SPE_Send = exports.SPE_Groupcast = exports.SPE_Broadcast = exports.SPE_Unicast = exports.SPE_Assign = exports.SPE_Guard = exports.Alias_Data = exports.Alias_List = exports.Process = exports.Function_Infix = exports.Function_Generic = exports.Constant = exports.Variable = exports.BTE_Partial = exports.BTE_Function = exports.TE_Product = exports.TE_Partial = exports.TE_Function = exports.TE_Name = exports.TE_List = exports.TE_Pow = exports.TE_Brack = exports.TE = exports.Type = exports.Include = exports.Block_Alias = exports.Block_Process = exports.Block_Function = exports.Block_Constant = exports.Block_Variable = exports.Block_Type = exports.Block_Include = exports.AWNRoot = exports.Node = exports.isBracketType = exports.ASTKinds = void 0;
exports.DE_Binary = exports.DE_Tuple = exports.DE_Function = void 0;
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
    ASTKinds["Function_Generic"] = "Function_Generic";
    ASTKinds["Function_Infix"] = "Function_Infix";
    ASTKinds["Process"] = "Process";
    ASTKinds["Alias_List"] = "Alias_List";
    ASTKinds["Alias_Data"] = "Alias_Data";
    ASTKinds["TE_Brack"] = "TE_Brack";
    ASTKinds["TE_Pow"] = "TE_Pow";
    ASTKinds["TE_List"] = "TE_List";
    ASTKinds["TE_Name"] = "TE_Name";
    ASTKinds["TE_Function"] = "TE_Function";
    ASTKinds["TE_Partial"] = "TE_Partial";
    ASTKinds["TE_Product"] = "TE_Product";
    ASTKinds["BTE_Partial"] = "BTE_Partial";
    ASTKinds["BTE_Function"] = "BTE_Function";
    ASTKinds["BTE_Pow"] = "BTE_Pow";
    ASTKinds["BTE_Name"] = "BTE_Name";
    ASTKinds["BTE_List"] = "BTE_List";
    ASTKinds["BTE_Brack"] = "BTE_Brack";
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
    ASTKinds["DE_Binary"] = "DE_Binary";
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
    return x === ASTKinds.TE_Brack || x === ASTKinds.TE_List || x === ASTKinds.TE_Pow || x === ASTKinds.DE_Brack || x === ASTKinds.SPE_Brack;
}
exports.isBracketType = isBracketType;
class Node {
    constructor(precedence, kind, parent, position) {
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
    constructor(parent) {
        super(10, ASTKinds.Block_Include, parent);
        this.includes = [];
    }
}
exports.Block_Include = Block_Include;
class Block_Type extends Node {
    constructor(parent) {
        super(10, ASTKinds.Block_Type, parent);
        this.types = [];
    }
}
exports.Block_Type = Block_Type;
class Block_Variable extends Node {
    constructor(parent) {
        super(10, ASTKinds.Block_Variable, parent);
        this.vars = [];
    }
}
exports.Block_Variable = Block_Variable;
class Block_Constant extends Node {
    constructor(parent) {
        super(10, ASTKinds.Block_Constant, parent);
        this.consts = [];
    }
}
exports.Block_Constant = Block_Constant;
class Block_Function extends Node {
    constructor(parent) {
        super(10, ASTKinds.Block_Function, parent);
        this.funcs = [];
    }
}
exports.Block_Function = Block_Function;
class Block_Process extends Node {
    constructor(parent) {
        super(10, ASTKinds.Block_Process, parent);
        this.procs = [];
    }
}
exports.Block_Process = Block_Process;
class Block_Alias extends Node {
    constructor(parent) {
        super(10, ASTKinds.Block_Alias, parent);
        this.aliases = [];
    }
}
exports.Block_Alias = Block_Alias;
class Include extends Node {
    constructor(parent, name) {
        super(0, ASTKinds.Include, parent);
        this.name = name;
    }
}
exports.Include = Include;
class Type extends Node {
    constructor(parent, typeName, position) {
        super(10, ASTKinds.Type, parent);
        this.typeName = typeName;
        this.pos = position;
    }
}
exports.Type = Type;
class TE extends Node {
    constructor(parent, precedence, kind) {
        super(precedence, kind, parent);
        this.children = [];
    }
}
exports.TE = TE;
class TE_Brack extends TE {
    constructor(parent) {
        super(parent, 4, ASTKinds.TE_Brack);
    }
}
exports.TE_Brack = TE_Brack;
class TE_Pow extends TE {
    constructor(parent, typeExpr) {
        super(parent, 4, ASTKinds.TE_Pow);
        if (typeExpr != null) {
            this.typeExpr = typeExpr;
        }
    }
}
exports.TE_Pow = TE_Pow;
class TE_List extends TE {
    constructor(parent) {
        super(parent, 4, ASTKinds.TE_List);
    }
}
exports.TE_List = TE_List;
class TE_Name extends TE {
    constructor(parent, typename, position) {
        super(parent, 0, ASTKinds.TE_Name);
        this.typename = typename;
        this.pos = position;
    }
}
exports.TE_Name = TE_Name;
class TE_Function extends TE {
    constructor(parent, left, right) {
        super(parent, 3, ASTKinds.TE_Function);
        if (left != null && right != null) {
            this.left = left;
            this.right = right;
        }
    }
}
exports.TE_Function = TE_Function;
class TE_Partial extends TE {
    constructor(parent, left, right) {
        super(parent, 2, ASTKinds.TE_Function);
        if (left != null && right != null) {
            this.left = left;
            this.right = right;
        }
    }
}
exports.TE_Partial = TE_Partial;
class TE_Product extends TE {
    constructor(parent) {
        super(parent, 1, ASTKinds.TE_Product);
    }
}
exports.TE_Product = TE_Product;
class BTE_Function extends TE {
    constructor(parent) {
        super(parent, 10, ASTKinds.BTE_Function);
    }
}
exports.BTE_Function = BTE_Function;
class BTE_Partial extends TE {
    constructor(parent) {
        super(parent, 10, ASTKinds.BTE_Partial);
    }
}
exports.BTE_Partial = BTE_Partial;
class Variable extends Node {
    constructor(parent, name, namePos) {
        super(10, ASTKinds.Variable, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.Variable = Variable;
class Constant extends Node {
    constructor(parent, name, namePos) {
        super(10, ASTKinds.Constant, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.Constant = Constant;
class Function_Generic extends Node {
    constructor(parent, name, namePos) {
        super(10, ASTKinds.Function_Generic, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.Function_Generic = Function_Generic;
class Function_Infix extends Node {
    constructor(parent, name, namePos) {
        super(10, ASTKinds.Function_Infix, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.Function_Infix = Function_Infix;
class Process extends Node {
    constructor(parent, name, namePos) {
        super(10, ASTKinds.Process, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.Process = Process;
class Alias_List extends Node {
    constructor(parent, name) {
        super(10, ASTKinds.Alias_List, parent);
        this.name = name;
    }
}
exports.Alias_List = Alias_List;
class Alias_Data extends Node {
    constructor(parent, name) {
        super(10, ASTKinds.Alias_Data, parent);
        this.name = name;
    }
}
exports.Alias_Data = Alias_Data;
class SPE_Guard extends Node {
    constructor(parent, DEStart, DEEnd) {
        super(10, ASTKinds.SPE_Guard, parent);
        this.DEStart = DEStart;
        this.DEEnd = DEEnd;
    }
}
exports.SPE_Guard = SPE_Guard;
class SPE_Assign extends Node {
    constructor(parent, name, nameStart, varStart, listExpStart, listExpEnd, assignExpStart, end) {
        super(10, ASTKinds.SPE_Assign, parent);
        this.name = name;
        this.nameStart = nameStart;
        this.varStart = varStart;
        this.listExpStart = listExpStart;
        this.listExpEnd = listExpEnd;
        this.assignExpStart = assignExpStart;
        this.end = end;
    }
}
exports.SPE_Assign = SPE_Assign;
class SPE_Unicast extends Node {
    constructor(parent, DELstart, DELend, DERend) {
        super(10, ASTKinds.SPE_Unicast, parent);
        this.DELstart = DELstart;
        this.DELend = DELend;
        this.DERend = DERend;
    }
}
exports.SPE_Unicast = SPE_Unicast;
class SPE_Broadcast extends Node {
    constructor(parent, DEstart, DEend) {
        super(10, ASTKinds.SPE_Broadcast, parent);
        this.DEstart = DEstart;
        this.DEend = DEend;
    }
}
exports.SPE_Broadcast = SPE_Broadcast;
class SPE_Groupcast extends Node {
    constructor(parent, DELstart, DELend, DERend) {
        super(10, ASTKinds.SPE_Groupcast, parent);
        this.DELstart = DELstart;
        this.DELend = DELend;
        this.DERend = DERend;
    }
}
exports.SPE_Groupcast = SPE_Groupcast;
class SPE_Send extends Node {
    constructor(parent, DEstart, DEend) {
        super(10, ASTKinds.SPE_Send, parent);
        this.DEstart = DEstart;
        this.DEend = DEend;
    }
}
exports.SPE_Send = SPE_Send;
class SPE_Deliver extends Node {
    constructor(parent, DEstart, DEend) {
        super(10, ASTKinds.SPE_Deliver, parent);
        this.DEstart = DEstart;
        this.DEend = DEend;
    }
}
exports.SPE_Deliver = SPE_Deliver;
class SPE_Receive extends Node {
    constructor(parent, name, namePos, nameEnd) {
        super(10, ASTKinds.SPE_Receive, parent);
        this.name = name;
        this.namePos = namePos;
        this.nameEnd = nameEnd;
    }
}
exports.SPE_Receive = SPE_Receive;
class SPE_Call extends Node {
    constructor(parent, name, namePos) {
        super(10, ASTKinds.SPE_Call, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.SPE_Call = SPE_Call;
class SPE_Name extends Node {
    constructor(parent, name, namePos) {
        super(10, ASTKinds.SPE_Name, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.SPE_Name = SPE_Name;
class SPE_Choice extends Node {
    constructor(parent) {
        super(10, ASTKinds.SPE_Choice, parent);
    }
}
exports.SPE_Choice = SPE_Choice;
class DE extends Node {
    constructor(precedence, kind, parent) {
        super(precedence, kind, parent);
        this.children = [];
    }
}
exports.DE = DE;
class DE_Singleton extends DE {
    constructor(parent) {
        super(0, ASTKinds.DE_Singleton, parent);
    }
}
exports.DE_Singleton = DE_Singleton;
class DE_Partial extends DE {
    constructor(parent, name, namePos) {
        super(0, ASTKinds.DE_Partial, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.DE_Partial = DE_Partial;
class DE_Set extends DE {
    constructor(parent, name, namePos) {
        super(0, ASTKinds.DE_Set, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.DE_Set = DE_Set;
class DE_Lambda extends DE {
    constructor(parent, name, namePos) {
        super(6, ASTKinds.DE_Lambda, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.DE_Lambda = DE_Lambda;
class DE_Forall extends DE {
    constructor(parent, name, namePos) {
        super(6, ASTKinds.DE_Forall, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.DE_Forall = DE_Forall;
class DE_Exists extends DE {
    constructor(parent, name, namePos) {
        super(6, ASTKinds.DE_Exists, parent);
        this.name = name;
        this.namePos = namePos;
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
    constructor(parent, name, namePos) {
        super(0, ASTKinds.DE_Name, parent);
        this.name = name;
        this.namePos = namePos;
    }
}
exports.DE_Name = DE_Name;
class DE_Function extends DE {
    constructor(parent, sigPos, argPos, endPos) {
        super(1, ASTKinds.DE_Function, parent);
        this.sigPos = sigPos;
        this.argPos = argPos;
        this.endPos = endPos;
    }
}
exports.DE_Function = DE_Function;
class DE_Tuple extends DE {
    constructor(parent) {
        super(5, ASTKinds.DE_Tuple, parent);
    }
}
exports.DE_Tuple = DE_Tuple;
class DE_Binary extends DE {
    constructor(parent, precedence) {
        super(precedence, ASTKinds.DE_Binary, parent);
    }
}
exports.DE_Binary = DE_Binary;
//# sourceMappingURL=ast.js.map