"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DE_Partial = exports.DE_Set = exports.DE_Singleton = exports.DE = exports.SPE_Brack = exports.SPE_Choice = exports.SPE_Call = exports.SPE_Receive = exports.SPE_Deliver = exports.SPE_Send = exports.SPE_Groupcast = exports.SPE_Broadcast = exports.SPE_Unicast = exports.SPE_Assign = exports.SPE_Guard = exports.SPE = exports.Alias_Data = exports.Alias_List = exports.ProcArg = exports.Process = exports.Function_Infix = exports.Function_Prefix = exports.Function = exports.VariableExp = exports.Variable = exports.Constant = exports.TE_Any = exports.TE_Product = exports.TE_FuncPart = exports.TE_FuncFull = exports.TE_Function = exports.TE_RootType = exports.TE_Name = exports.TE_Array = exports.TE_Pow = exports.TE_Brack = exports.Type = exports.Include = exports.Block_Alias = exports.Block_Process = exports.Block_Function = exports.Block_Constant = exports.Block_Variable = exports.Block_Type = exports.Block_Include = exports.AWNRoot = exports.isBracketType = exports.DummyNode = exports.Node = exports.ASTKinds = void 0;
exports.DE_Function_Infix = exports.DE_Function_Prefix = exports.DE_Tuple = exports.DE_Name = exports.DE_Brack = exports.DE_Exists = exports.DE_Forall = exports.DE_Lambda = void 0;
var ASTKinds;
(function (ASTKinds) {
    ASTKinds["Dummy"] = "AWN_Dummy";
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
    ASTKinds["VariableExp"] = "VariableExp";
    ASTKinds["Constant"] = "Constant";
    ASTKinds["ConVar"] = "ConVar";
    ASTKinds["Function_Prefix"] = "Function_Prefix";
    ASTKinds["Function_Infix"] = "Function_Infix";
    ASTKinds["Process"] = "Process";
    ASTKinds["ProcArgs"] = "ProcArgs";
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
//All AST objects extend Node.
//Nodes have child nodes as non-nullable (or empty list).
//This is so when constructing the AST, we can define all other properties 
//of the node first before defining the child.
//This is important because we can't have defining the child
//executing before the rest of the node is built, as the child
//relies on its parent's properties being defined for rotation.
//
//Note that I could pass the child node in the constructor and have it be built
//inside here, but I want to have the control flow of that not
//be in this file. This approach doesn't really do anything bad, just forces me 
//to have "!" on child objects.
class Node {
    constructor(precedence, kind, parent, poses) {
        this.precedence = precedence;
        this.kind = kind;
        if (kind == ASTKinds.Dummy) {
            this.parent = this; //avoid infinite loop on dummy instantiation
        }
        else {
            this.parent = parent ?? getdpar();
        }
        this.pos = poses ?? {}; //don't think i ever pass this as null anyway, but i want it after the parent argument for consistency w/ the nodes :)
    }
}
exports.Node = Node;
//avoid nullchecks by using a DummyNode as the parent of 
//nodes where the parent is never relevant, also as the parent of AWNRoot
class DummyNode extends Node {
    constructor() {
        super(10, ASTKinds.Dummy, null);
        this.parent = this; //immediately overwrite "null as any"
    }
}
exports.DummyNode = DummyNode;
//dpar and dpos are dummy parent and position respectively
let dpar;
function getdpar() {
    if (dpar == null) {
        dpar = new DummyNode();
    }
    return dpar;
}
const dpos = { overallPos: 10000, line: 1000, offset: 0 };
//Given a set of string-pos pairs which may include undefined poses,
//turns the undefined ones into dummypos.
function buildPoses(poses) {
    var out = {};
    for (const [name, p] of Object.entries(poses)) {
        out[name] = p ?? dpos;
    }
    return out;
}
//Used when moving nodes up the tree to know whether a node is allowed to move upwards, as brackets act as barriers.
function isBracketType(x) {
    return x === ASTKinds.TE_Brack || x === ASTKinds.TE_Array || x === ASTKinds.TE_Pow || x === ASTKinds.DE_Brack || x === ASTKinds.SPE_Brack || x === ASTKinds.DE_Function;
}
exports.isBracketType = isBracketType;
//======= AST STARTS HERE =======
//Each node has its (simplified) grammar definition as a comment above it,
//with positions represented by @ symbols for reference.
//For the full unsimplified version, see awn-grammar.peg.
//The definitions won't precisely correspond to the actual grammar
//because the grammar needed to be edited to remove left-recursion.
class AWNRoot extends Node {
    constructor() {
        super(10, ASTKinds.AWNRoot, new DummyNode());
        this.blocks = [];
    }
}
exports.AWNRoot = AWNRoot;
//	 keywordPos=@ 'INCLUDES:' Include+
class Block_Include extends Node {
    constructor(parent, keywordPos) {
        const poses = buildPoses({ keywordPos });
        super(10, ASTKinds.Block_Include, parent, poses);
        this.includes = [];
    }
}
exports.Block_Include = Block_Include;
//	 keywordPos=@ 'TYPES:' Type+
class Block_Type extends Node {
    constructor(parent, keywordPos) {
        const poses = buildPoses({ keywordPos });
        super(10, ASTKinds.Block_Type, parent, poses);
        this.types = [];
    }
}
exports.Block_Type = Block_Type;
//	 keywordPos=@ 'VARIABLES:' Variable+
class Block_Variable extends Node {
    constructor(parent, keywordPos) {
        const poses = buildPoses({ keywordPos });
        super(10, ASTKinds.Block_Variable, parent, poses);
        this.vars = [];
    }
}
exports.Block_Variable = Block_Variable;
//	 keywordPos=@ 'CONSTANTS:' Constant+
class Block_Constant extends Node {
    constructor(parent, keywordPos) {
        const poses = buildPoses({ keywordPos });
        super(10, ASTKinds.Block_Constant, parent, poses);
        this.consts = [];
    }
}
exports.Block_Constant = Block_Constant;
//	 keywordPos=@ 'FUNCTIONS:' Function+
class Block_Function extends Node {
    constructor(parent, keywordPos) {
        const poses = buildPoses({ keywordPos });
        super(10, ASTKinds.Block_Function, parent, poses);
        this.funcs = [];
    }
}
exports.Block_Function = Block_Function;
//	 keywordPos=@ 'PROCESSES:' Process+
//	|keywordPos=@ 'proc:' Process
class Block_Process extends Node {
    constructor(definedAsProc, parent, keywordPos) {
        const poses = buildPoses({ keywordPos });
        super(10, ASTKinds.Block_Process, parent, poses);
        this.procs = [];
        this.definedAsProc = definedAsProc;
    }
}
exports.Block_Process = Block_Process;
//	 keywordPos=@ 'ALIASES:' Alias+
class Block_Alias extends Node {
    constructor(parent, keywordPos) {
        const poses = buildPoses({ keywordPos });
        super(10, ASTKinds.Block_Alias, parent, poses);
        this.aliases = [];
    }
}
exports.Block_Alias = Block_Alias;
//	 posS=@ name posE=@
class Include extends Node {
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.Include, parent, poses);
        this.name = name;
    }
}
exports.Include = Include;
//For type defs declared in a TYPES block
//	posS=@ typeName posE=@ '=' typeExpr
class Type extends Node {
    constructor(typeName, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.Type, parent, poses);
        this.typeName = typeName;
    }
}
exports.Type = Type;
// 	'(' typeExpr ')'
class TE_Brack extends Node {
    constructor(parent) {
        super(4, ASTKinds.TE_Brack, parent);
    }
}
exports.TE_Brack = TE_Brack;
//	 powPos=@ 'Pow' '(' typeExpr ')'
class TE_Pow extends Node {
    constructor(typeExpr, parent, powPos) {
        const poses = buildPoses({ powPos });
        super(4, ASTKinds.TE_Pow, parent, poses);
        if (typeExpr != null) {
            this.typeExpr = typeExpr;
        }
    }
}
exports.TE_Pow = TE_Pow;
//	'[' typeExpr ']'
class TE_Array extends Node {
    constructor(parent) {
        super(4, ASTKinds.TE_Array, parent);
    }
}
exports.TE_Array = TE_Array;
//	posS=@ typename posE=@
class TE_Name extends Node {
    constructor(typename, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(0, ASTKinds.TE_Name, parent, poses);
        this.typename = typename;
    }
}
exports.TE_Name = TE_Name;
class TE_RootType extends Node {
    constructor(typename, parent) {
        super(0, ASTKinds.TE_RootType, parent);
        this.typename = typename;
    }
}
exports.TE_RootType = TE_RootType;
//used for both full & partial funcs
class TE_Function extends Node {
    get sigType() {
        return convertToTEProduct(this.left);
    }
    get outType() {
        return this.right;
    }
    get isBTE() {
        const sig = this.sigType;
        if (sig == null) {
            return false;
        }
        return sig.children.length == 2;
    }
}
exports.TE_Function = TE_Function;
//	left '->' right
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
// 	left '+->' right
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
// 	children = (x-delimited typeExprs)
class TE_Product extends Node {
    constructor(children, parent) {
        super(1, ASTKinds.TE_Product, parent);
        if (children != null) {
            this.children = children;
        }
    }
}
exports.TE_Product = TE_Product;
//TE_Any is used as the type of some functions, such as "=", which take any arguments.
//Typematches with everything.
class TE_Any extends Node {
    constructor(parent) {
        super(0, ASTKinds.TE_Any, parent);
    }
}
exports.TE_Any = TE_Any;
//	typeExpr posS=@ name posE=@
// |posS=@ name posE=@ ':' typeExpr
class Constant extends Node {
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.Constant, parent, poses);
        this.typeDeclaredFirst = false; //needed for syntax highlighting (which format the const was declared with)
        this.name = name;
    }
}
exports.Constant = Constant;
//	typeExpr posS=@ name posE=@
// |posS=@ name posE=@ ':' typeExpr
class Variable extends Node {
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.Variable, parent, poses);
        this.typeDeclaredFirst = false; //needed for syntax highlighting (which format the var was declared with)
        this.name = name;
    }
}
exports.Variable = Variable;
//  posS=@ name (referring to var) posE=@ {[DE]}*
class VariableExp extends Node {
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.VariableExp, parent, poses);
        this.des = [];
        this.DEPosS = [];
        this.DEPosE = [];
        this.name = name;
    }
}
exports.VariableExp = VariableExp;
//see Function_Prefix/Infix
class Function extends Node {
    constructor(precedence, kind, name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(precedence, kind, parent, poses);
        this.name = name;
    }
    get isBinary() { return this.sigType.children.length == 2; }
}
exports.Function = Function;
//	posS=@ name posE=@ ':' typeExpr
class Function_Prefix extends Function {
    constructor(name, parent, posS, posE) {
        super(10, ASTKinds.Function_Prefix, name, parent, posS, posE);
    }
}
exports.Function_Prefix = Function_Prefix;
//	posS=@ infixname posE=@ ':' typeExpr
class Function_Infix extends Function {
    constructor(name, parent, posS, posE) {
        super(10, ASTKinds.Function_Infix, name, parent, posS, posE);
    }
}
exports.Function_Infix = Function_Infix;
//	posS=@ name posE@ '(' (comma-delimited arguments, held in args/argInfo) ')' ':=' lb proc
class Process extends Node {
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.Process, parent, poses);
        this.argInfo = [];
        this.args = [];
        this.name = name;
    }
}
exports.Process = Process;
//Exists separately to variable for syntax highlighing.
//	posS=@ name posE=@
class ProcArg extends Node {
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.ProcArgs, parent, poses);
        this.proc = parent;
        this.name = name;
    }
}
exports.ProcArg = ProcArg;
//	posS=@ name posE@ ':=' (comma-delimited argument list, held in argNames etc.)
class Alias_List extends Node {
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.Alias_List, parent, poses);
        this.args = [];
        this.argsPosS = [];
        this.argsPosE = [];
        this.name = name;
    }
}
exports.Alias_List = Alias_List;
// posS=@ name posE=@ ':=' dataExp
class Alias_Data extends Node {
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(10, ASTKinds.Alias_Data, parent, poses);
        this.name = name;
    }
}
exports.Alias_Data = Alias_Data;
class SPE extends Node {
    constructor(precedence, kind, curProcIn, parent, poses) {
        super(precedence, kind, parent, poses);
        this.curProcIn = curProcIn;
    }
}
exports.SPE = SPE;
//	'[' DEStart=@ dataExp DEEnd=@ ']' lb nextproc
class SPE_Guard extends SPE {
    constructor(curProcIn, parent, DEStart, DEEnd) {
        const poses = buildPoses({ DEStart, DEEnd });
        super(9, ASTKinds.SPE_Guard, curProcIn, parent, poses);
    }
}
exports.SPE_Guard = SPE_Guard;
//	'[[' nameStart=@ name varStart=@ ':=' assignExpStart=@ dataExpAssign end=@ ']]' lb nextproc
class SPE_Assign extends SPE {
    constructor(curProcIn, parent, assignExpStart, end) {
        const poses = buildPoses({ assignExpStart, end });
        super(9, ASTKinds.SPE_Assign, curProcIn, parent, poses);
    }
}
exports.SPE_Assign = SPE_Assign;
//	start=@ 'unicast' '(' DELstart=@ dataExpL DELend=@ ';' dataExpR DERend=@ '\)' '.' procA '>' procB
class SPE_Unicast extends SPE {
    constructor(curProcIn, parent, start, DELstart, DELend, DERend) {
        const poses = buildPoses({ start, DELstart, DELend, DERend });
        super(9, ASTKinds.SPE_Unicast, curProcIn, parent, poses);
    }
}
exports.SPE_Unicast = SPE_Unicast;
//	start=@ 'broadcast' '(' DEstart=@ dataExp DEend=@ '\)' '.' nextproc
class SPE_Broadcast extends SPE {
    constructor(curProcIn, parent, start, DEstart, DEend) {
        const poses = buildPoses({ start, DEstart, DEend });
        super(9, ASTKinds.SPE_Broadcast, curProcIn, parent, poses);
    }
}
exports.SPE_Broadcast = SPE_Broadcast;
//	start=@ 'groupcast' '(' DELstart=@ dataExpL DELend=@ ';' dataExpR=DE DERend=@ ')' '.' nextproc
class SPE_Groupcast extends SPE {
    constructor(curProcIn, parent, start, DELstart, DELend, DERend) {
        const poses = buildPoses({ start, DELstart, DELend, DERend });
        super(9, ASTKinds.SPE_Groupcast, curProcIn, parent, poses);
    }
}
exports.SPE_Groupcast = SPE_Groupcast;
//	start=@ 'send' '(' DEstart=@ dataExp DEend=@ ')' '.' nextproc
class SPE_Send extends SPE {
    constructor(curProcIn, parent, start, DEstart, DEend) {
        const poses = buildPoses({ start, DEstart, DEend });
        super(9, ASTKinds.SPE_Send, curProcIn, parent, poses);
    }
}
exports.SPE_Send = SPE_Send;
//	start=@ 'deliver' '(' DEstart=@ dataExp DEend=@ ')' '.' nextproc
class SPE_Deliver extends SPE {
    constructor(curProcIn, parent, start, DEstart, DEend) {
        const poses = buildPoses({ start, DEstart, DEend });
        super(9, ASTKinds.SPE_Deliver, curProcIn, parent, poses);
    }
}
exports.SPE_Deliver = SPE_Deliver;
//	start=@ 'receive' '(' namePos=@ name=Name nameEnd=@ dataExps ')' '.' nextproc
class SPE_Receive extends SPE {
    constructor(name, curProcIn, parent, start, namePos, nameEnd) {
        const poses = buildPoses({ start, namePos, nameEnd });
        super(9, ASTKinds.SPE_Receive, curProcIn, parent, poses);
        this.name = name;
    }
}
exports.SPE_Receive = SPE_Receive;
//	posS=@ name posE=@ '(' (args) ')'
class SPE_Call extends SPE {
    constructor(name, curProcIn, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(9, ASTKinds.SPE_Call, curProcIn, parent, poses);
        this.name = name;
    }
}
exports.SPE_Call = SPE_Call;
//	left '+' right
class SPE_Choice extends SPE {
    constructor(curProcIn, parent) {
        super(10, ASTKinds.SPE_Choice, curProcIn, parent);
    }
}
exports.SPE_Choice = SPE_Choice;
//	'(' proc ')'
class SPE_Brack extends SPE {
    constructor(curProcIn, parent) {
        super(10, ASTKinds.SPE_Brack, curProcIn, parent);
    }
}
exports.SPE_Brack = SPE_Brack;
class DE extends Node {
    constructor(precedence, kind, parent, poses) {
        super(precedence, kind, parent, poses);
    }
}
exports.DE = DE;
/*DE Binding strengths (most binding to least)
(DE_Function_Prefixes are listed individually)
DE_Name					0
DE_Singleton			0
DE_Set					0
DE_Partial				0
custom infix			1
:						2
<=						3
>=						3
>						3
<						3
!=						3
=						3
|						4
&						4
->						5
<->						5
DE_Lambda				6
DE_Forall				6
DE_Exists				6
DE_Tuple				7
DE_Function_Prefix		10
DE_Brack				10	but can't escape out of
*/
//	'{' dataExp '}'
class DE_Singleton extends DE {
    constructor(parent) {
        super(0, ASTKinds.DE_Singleton, parent);
    }
}
exports.DE_Singleton = DE_Singleton;
//	'{' posS=@ name posE=@ '|' DEPosS=@ dataExp DEPosE=@ '}
class DE_Set extends DE {
    constructor(name, parent, posS, posE, DEPosS, DEPosE) {
        const poses = buildPoses({ posS, posE, DEPosS, DEPosE });
        super(0, ASTKinds.DE_Set, parent, poses);
        this.name = name;
    }
}
exports.DE_Set = DE_Set;
//	'{' '(' posS=@ name posE=@ ',' left ')' '|' DEPosS=@ right DEPosE=@ '}'
class DE_Partial extends DE {
    constructor(name, parent, posS, posE, DEPosS, DEPosE) {
        const poses = buildPoses({ posS, posE, DEPosS, DEPosE });
        super(0, ASTKinds.DE_Partial, parent, poses);
        this.name = name;
    }
}
exports.DE_Partial = DE_Partial;
//	startPos=@ 'lambda ' namePos=@ name '. ' dataExp
class DE_Lambda extends DE {
    constructor(name, parent, namePos, startPos) {
        const poses = buildPoses({ namePos, startPos });
        super(6, ASTKinds.DE_Lambda, parent, poses);
        this.name = name;
    }
}
exports.DE_Lambda = DE_Lambda;
//	startPos=@ 'forall ' namePos=@ name '. ' dataExp
class DE_Forall extends DE {
    constructor(name, parent, namePos, startPos) {
        const poses = buildPoses({ namePos, startPos });
        super(6, ASTKinds.DE_Forall, parent, poses);
        this.name = name;
    }
}
exports.DE_Forall = DE_Forall;
//	startPos=@ 'exists ' namePos=@ name '. ' dataExp
class DE_Exists extends DE {
    constructor(name, parent, namePos, startPos) {
        const poses = buildPoses({ namePos, startPos });
        super(6, ASTKinds.DE_Exists, parent, poses);
        this.name = name;
    }
}
exports.DE_Exists = DE_Exists;
//	'(' dataExp ')'
class DE_Brack extends DE {
    constructor(parent) {
        super(10, ASTKinds.DE_Brack, parent);
    }
}
exports.DE_Brack = DE_Brack;
//	posS=@ name posE=@
class DE_Name extends DE {
    //needed for semantic tokens
    constructor(name, parent, posS, posE) {
        const poses = buildPoses({ posS, posE });
        super(0, ASTKinds.DE_Name, parent, poses);
        this.refersTo = ASTKinds.AWNRoot; //what kind of object the DE_Name refers to - note this is different to what type it is
        this.name = name;
    }
}
exports.DE_Name = DE_Name;
//	dataExps are comma separated DEs
class DE_Tuple extends DE {
    constructor(parent) {
        super(7, ASTKinds.DE_Tuple, parent);
    }
}
exports.DE_Tuple = DE_Tuple;
//DE_Function_Prefix is Name(DE)
//	
class DE_Function_Prefix extends DE {
    constructor(name, parent, sigStart, sigEnd, argPos, endPos) {
        const poses = buildPoses({ sigStart, sigEnd, argPos, endPos });
        super(10, ASTKinds.DE_Function, parent, poses);
        this.name = name;
    }
}
exports.DE_Function_Prefix = DE_Function_Prefix;
//	left sigStart=@ infixfunc sigEnd=@ right
class DE_Function_Infix extends DE {
    constructor(precedence, parent, sigStart, sigEnd) {
        const poses = buildPoses({ sigStart, sigEnd });
        super(precedence, ASTKinds.DE_Infix, parent, poses);
    }
}
exports.DE_Function_Infix = DE_Function_Infix;
function convertToTEProduct(typeExp) {
    switch (typeExp.kind) {
        case ASTKinds.TE_Brack: return convertToTEProduct(typeExp.typeExpr);
        case ASTKinds.TE_Array: return new TE_Product([typeExp.typeExpr], typeExp.parent);
        case ASTKinds.TE_Pow: return new TE_Product([typeExp.typeExpr], typeExp.parent);
        case ASTKinds.TE_Product: return typeExp;
        default: return new TE_Product([typeExp], typeExp.parent);
    }
}
//# sourceMappingURL=ast.js.map