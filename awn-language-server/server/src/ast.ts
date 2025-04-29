import { PosInfo } from './parser';

export enum ASTKinds {
    AWNRoot = "AWNRoot",
    Block_Include = "Block_Include",
    Block_Type = "Block_Type",
	Block_Variable = "Block_Variable",
    Block_Constant = "Block_Constant",
    Block_Function = "Block_Function",
    Block_Process = "Block_Process",
	Block_Alias = "Block_Alias",
    Include = "Include",
    Type = "Type",
	Variable = "Variable",
	Constant = "Constant",
    ConVar = "ConVar",
    Function_Prefix = "Function_Prefix",
	Function_Infix = "Function_Infix",
    Process = "Process",
	ProcArgs = "ProcArgs",
	Alias_List = "Alias_List",
	Alias_Data = "Alias_Data",
    TE_Brack = "TE_Brack",
    TE_Pow = "TE_Pow",
    TE_Array = "TE_Array",
    TE_Name = "TE_Name",
	TE_RootType = "TE_RootType",
    TE_FuncPart = "TE_FuncPart",
    TE_FuncFull = "TE_FuncFull",
    TE_Product = "TE_Product",
	TE_Any = "TE_Any",
	SPE_Guard = "SPE_Guard",
	SPE_Unicast = "SPE_Unicast",
	SPE_Broadcast = "SPE_Broadcast",
	SPE_Assign = "SPE_Assign",
	SPE_Brack = "SPE_Brack",
	SPE_Call = "SPE_Call",
	SPE_Choice = "SPE_Choice",
	SPE_Deliver = "SPE_Deliver",
	SPE_Groupcast = "SPE_Groupcast",
	SPE_Name = "SPE_Name",
	SPE_Receive = "SPE_Receive",
	SPE_Send = "SPE_Send",
	DE_Infix = "DE_Infix",
	DE_Brack = "DE_Brack",
	DE_Exists = "DE_Exists",
	DE_Forall = "DE_Forall",
	DE_Function = "DE_Function",
	DE_Lambda = "DE_Lambda",
	DE_Name = "DE_Name",
	DE_Partial = "DE_Partial",
	DE_Set = "DE_Set",
	DE_Singleton = "DE_Singleton",
	DE_Tuple = "DE_Tuple"
}

export function isBracketType(x: ASTKinds): boolean {
	return x === ASTKinds.TE_Brack || x === ASTKinds.TE_Array || x === ASTKinds.TE_Pow || x === ASTKinds.DE_Brack || x === ASTKinds.SPE_Brack || x === ASTKinds.DE_Function
}

export class Node {
    parent: Node
    precedence: number
	kind: ASTKinds

    constructor(precedence: number, kind: ASTKinds, parent: Node) {
        this.parent = parent
        this.precedence = precedence //Lower numbers actually have more precedence (i.e. they bind stronger) - this is because i thought of it the wrong way around when i set it up and haven't changed it. think about it - if something "escapes out" because it has a higher number here, that means it actually has less precedence/binding power
		this.kind = kind
    }
}

//Nodes have children properties as non-nullable (or empty list). This is so 
//when constructing the AST, we can define all other properties 
//of the node first, then define the child immediately after.
//(Otherwise [defining the child] will execute before the rest
//of the node is built, and we can't have that or rotating
//won't work as the parents won't exist.)
export class AWNRoot extends Node {
    blocks: Block[] = [];

	constructor() {
		//Going with the approach of having the root have itself as parent to avoid null checks.
		//The one time this node is instantiated, immediately afterwards, parent is set properly.
        super(10, ASTKinds.AWNRoot, {} as Node);
    }
}

//How field sections within a node are organised:
//1. Those set during convertAST.ts (some may be "!" still because of how that function works, see above AWNRoot)
//2. Those set during check.ts
//3. Position information

export type Block = Block_Include | Block_Type | Block_Constant | Block_Variable | Block_Function | Block_Process | Block_Alias
export class Block_Include extends Node {
    includes: Include[] = []

	keywordPos: PosInfo //before the keyword

	constructor(parent: Node, keywordPos: PosInfo) {
        super(10, ASTKinds.Block_Include, parent)
		this.keywordPos = keywordPos
    }
}

export class Block_Type extends Node {
    types: Type[] = [];

	keywordPos: PosInfo //before the keyword

	constructor(parent: Node, keywordPos: PosInfo) {
        super(10, ASTKinds.Block_Type, parent);
		this.keywordPos = keywordPos
    }
}

export class Block_Variable extends Node {
    vars: Variable[] = [];

	keywordPos: PosInfo //before the keyword

	constructor(parent: Node, keywordPos: PosInfo) {
        super(10, ASTKinds.Block_Variable, parent);
		this.keywordPos = keywordPos
    }
}

export class Block_Constant extends Node {
    consts: Constant[] = [];

	keywordPos: PosInfo //before the keyword

	constructor(parent: Node, keywordPos: PosInfo) {
        super(10, ASTKinds.Block_Constant, parent);
		this.keywordPos = keywordPos
    }
}

export class Block_Function extends Node {
    funcs: Function[] = [];

	keywordPos: PosInfo //before the keyword

	constructor(parent: Node, keywordPos: PosInfo) {
        super(10, ASTKinds.Block_Function, parent);
		this.keywordPos = keywordPos
    }
}

export class Block_Process extends Node {
    procs: Process[] = [];

	definedAsProc: Boolean //necessary for syntax highlighting, whether it was defined under "proc" or "PROCESSES:"
	keywordPos: PosInfo //before the keyword

	constructor(parent: Node, keywordPos: PosInfo, definedAsProc: boolean) {
        super(10, ASTKinds.Block_Process, parent);
		this.keywordPos = keywordPos
		this.definedAsProc = definedAsProc
    }
}

export class Block_Alias extends Node {
	aliases: Alias[] = [];

	keywordPos: PosInfo //before the keyword

	constructor(parent: Node, keywordPos: PosInfo) {
        super(10, ASTKinds.Block_Alias, parent);
		this.keywordPos = keywordPos
    }
}

export class Include extends Node {
    name: string;

	posS: PosInfo //before the name
	posE: PosInfo //after the name

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(0, ASTKinds.Include, parent);
		this.name = name;
		this.posS = posS; this.posE = posE
    }
}

export class Type extends Node {
    typeName: string;	
    typeExpr!: TE; //type decs without a TE are given the TE_Name type, so this can't be null. idk what the actual desired behaviour is

	posS: PosInfo //before the name
	posE: PosInfo //after the name

	constructor(parent: Node, typeName: string, posS: PosInfo, posE: PosInfo) {
        super(10, ASTKinds.Type, parent);
		this.typeName = typeName;
		this.posS = posS; this.posE = posE
    }
}

export type TE = TE_Brack | TE_Pow | TE_Array | TE_Name | TE_Function | TE_Product | TE_RootType | TE_Any

export class TE_Brack extends Node {
	typeExpr!: TE;

	constructor(parent: Node) {
        super(4, ASTKinds.TE_Brack, parent);
    }
}

export class TE_Pow extends Node {
	typeExpr!: TE;

	pos: PosInfo; //before "Pow"

	constructor(parent: Node, pos: PosInfo, typeExpr?: TE) {
        super(4, ASTKinds.TE_Pow, parent);
		if(typeExpr != null){
			this.typeExpr = typeExpr
		}
		this.pos = pos
    }
}

export class TE_Array extends Node {
	typeExpr!: TE;

	constructor(parent: Node) {
        super(4, ASTKinds.TE_Array, parent);
    }
}

export class TE_Name extends Node {
	typename: string;

	typeExpr!: TE //What the TE_Name refers to

	posS: PosInfo //before the name
	posE: PosInfo //after the name

	constructor(parent: Node, typename: string, posS: PosInfo, posE: PosInfo) {
        super(0, ASTKinds.TE_Name, parent);
		this.typename = typename;
		this.posS = posS; this.posE = posE
    }
}

export class TE_RootType extends Node {
	typename: string

	constructor(parent: Node, typename: string) {
        super(0, ASTKinds.TE_RootType, parent);
		this.typename = typename
    }
}

//both full and partial functions extend this
export class TE_Function extends Node {
	left!: TE; // (after rotation) signature type
	right!: TE; // (after rotation) output type

	get sigType(): TE_Product | null{
		return convertToTEProduct(this.left)
	}

	get outType(): TE {return this.right}

	get isBTE(): boolean {
		const sig = this.sigType;
		if(sig == null){return false}
		return sig.children.length == 2
	}
}

export class TE_FuncFull extends TE_Function {
	constructor(parent: Node, left?: TE, right?: TE) {
        super(2, ASTKinds.TE_FuncFull, parent);
		if(left != null && right != null){
			this.left = left; this.right = right
		}
    }
}

export class TE_FuncPart extends TE_Function {
	constructor(parent: Node, left?: TE, right?: TE) {
        super(3, ASTKinds.TE_FuncPart, parent);
		if(left != null && right != null){
			this.left = left; this.right = right
		}
    }
}

export class TE_Product extends Node {
	//these two only used during rotation phase, can ignore thereafter
	left!: TE;
	right!: TE;

	children!: TE[];
	
	constructor(parent: Node, children?: TE[]) {
        super(1, ASTKinds.TE_Product, parent);
		if(children != null){
			this.children = children
		}
    }
}

export class TE_Any extends Node {

	constructor(parent: Node) {
        super(0, ASTKinds.TE_Any, parent);
    }
}

export class Variable extends Node {
    name: string
	typeExpr!: TE

	typeDeclaredFirst: boolean = false //needed for syntax highlighting
	posS: PosInfo //before the name
	posE: PosInfo //after the name

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(10, ASTKinds.Variable, parent)
		this.name = name
		this.posS = posS; this.posE = posE
    }
}

export class Constant extends Node {
    name: string	
	typeExpr!: TE

	typeDeclaredFirst: boolean = false //needed for syntax highlighting
	posS: PosInfo //before the name
	posE: PosInfo //after the name

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(10, ASTKinds.Constant, parent)
		this.name = name
		this.posS = posS; this.posE = posE
    }
}

export class Function extends Node {
    name: string;

	type!: TE //the type given during syntax checking phase

	sigType!: TE_Product
	outType!: TE

	posS: PosInfo //before the name
	posE: PosInfo //after the name

	constructor(precedence: number, kind: ASTKinds, parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(precedence, kind, parent);
        this.name = name;
        this.posS = posS; this.posE = posE
    }

	get isBinary(): boolean {return this.sigType.children.length == 2}
}

export class Function_Prefix extends Function {
    constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(10, ASTKinds.Function_Prefix, parent, name, posS, posE);
    }
}

export class Function_Infix extends Function {
    constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(10, ASTKinds.Function_Infix, parent, name, posS, posE);
    }
}

export class Process extends Node {
    name: string;
	argInfo: ProcArg[] = []
	args: Variable[] = []
    proc!: SPE;

	posS: PosInfo //before the name
	posE: PosInfo //after the name

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(10, ASTKinds.Process, parent);
		this.name = name;
		this.posS = posS; this.posE = posE
    }
}

export class ProcArg extends Node {
	proc: Process
	name: string
	posS: PosInfo; posE: PosInfo
	argType!: ASTKinds

	constructor(parent: Process, name: string, posS: PosInfo, posE: PosInfo){
		super(10, ASTKinds.ProcArgs, parent)
		this.proc = parent
		this.name = name
		this.posS = posS; this.posE = posE
	}
}
export type Alias = Alias_List | Alias_Data
export class Alias_List extends Node {
	name: string;
	argNames!: string[]

	args: (Variable | Alias_List)[] = []

	posS: PosInfo; posE: PosInfo
	argsPosS: PosInfo[] = []; argsPosE: PosInfo[] = []

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(10, ASTKinds.Alias_List, parent);
		this.name = name;
		this.posS = posS; this.posE = posE
    }
}

export class Alias_Data extends Node {
	name: string;

	dataExp!: DE;

	posS: PosInfo; posE: PosInfo

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(10, ASTKinds.Alias_Data, parent);
		this.name = name;
		this.posS = posS; this.posE = posE
    }
}

export type SPEs = SPE_Assign | SPE_Brack | SPE_Broadcast | SPE_Call | SPE_Choice | SPE_Deliver | SPE_Groupcast | SPE_Guard | SPE_Receive | SPE_Send | SPE_Unicast

export class SPE extends Node {
	curProcIn: Process;
	boundArgs: string[] = [];

	constructor(precedence: number, kind: ASTKinds, parent: Node, curProcIn: Process){
		super(precedence, kind, parent)
		this.curProcIn = curProcIn;
	}
}

export class SPE_Guard extends SPE {
	dataExp!: DE;
	DEStart: PosInfo; DEEnd: PosInfo
	nextproc!: SPE;

	constructor(parent: Node, curProcIn: Process, DEStart: PosInfo, DEEnd: PosInfo) {
        super(9, ASTKinds.SPE_Guard, parent, curProcIn)
		this.DEStart = DEStart
		this.DEEnd = DEEnd
    }
}

export class SPE_Assign extends SPE {
	name: string;
	variable!: Variable
	dataExpAssign!: DE;
	nextproc!: SPE;
	nameStart: PosInfo; varStart: PosInfo; assignExpStart: PosInfo; end: PosInfo

	constructor(parent: Node, curProcIn: Process, name: string, nameStart: PosInfo, varStart: PosInfo, assignExpStart: PosInfo, end: PosInfo) {
        super(9, ASTKinds.SPE_Assign, parent, curProcIn);
		this.name = name
		this.nameStart = nameStart
		this.varStart = varStart
		this.assignExpStart = assignExpStart
		this.end = end
    }
}

export class SPE_Unicast extends SPE {
	dataExpL!: DE;
    dataExpR!: DE;
    procA!: SPE;
	procB!: SPE;

	start: PosInfo; DELstart: PosInfo; DELend: PosInfo; DERend: PosInfo

	constructor(parent: Node, curProcIn: Process, start: PosInfo, DELstart: PosInfo, DELend: PosInfo, DERend: PosInfo) {
        super(9, ASTKinds.SPE_Unicast, parent, curProcIn);
		this.DELstart = DELstart
		this.DELend = DELend
		this.DERend = DERend
		this.start = start
    }
}

export class SPE_Broadcast extends SPE {
	dataExp!: DE;
	nextproc!: SPE;
	
	start: PosInfo; DEstart: PosInfo; DEend: PosInfo

	constructor(parent: Node, curProcIn: Process, start: PosInfo, DEstart: PosInfo, DEend: PosInfo) {
        super(9, ASTKinds.SPE_Broadcast, parent, curProcIn);
		this.DEstart = DEstart
		this.DEend = DEend
		this.start = start
    }
}

export class SPE_Groupcast extends SPE {
	dataExpL!: DE;
    dataExpR!: DE;
	nextproc!: SPE;
	
	start: PosInfo; DELstart: PosInfo; DELend: PosInfo; DERend: PosInfo

	constructor(parent: Node, curProcIn: Process, start: PosInfo, DELstart: PosInfo, DELend: PosInfo, DERend: PosInfo) {
        super(9, ASTKinds.SPE_Groupcast, parent, curProcIn);
		this.DELstart = DELstart
		this.DELend = DELend
		this.DERend = DERend
		this.start = start
    }
}

export class SPE_Send extends SPE {
	dataExp!: DE;
	nextproc!: SPE;
	
	start: PosInfo; DEstart: PosInfo; DEend: PosInfo

	constructor(parent: Node, curProcIn: Process, start: PosInfo, DEstart: PosInfo, DEend: PosInfo) {
        super(9, ASTKinds.SPE_Send, parent, curProcIn);
		this.DEstart = DEstart
		this.DEend = DEend
		this.start = start
    }
}

export class SPE_Deliver extends SPE {
	dataExp!: DE;
	nextproc!: SPE;
	
	start: PosInfo; DEstart: PosInfo; DEend: PosInfo

	constructor(parent: Node, curProcIn: Process, start: PosInfo, DEstart: PosInfo, DEend: PosInfo) {
        super(9, ASTKinds.SPE_Deliver, parent, curProcIn);
		this.DEstart = DEstart
		this.DEend = DEend
		this.start = start
    }
}

export class SPE_Receive extends SPE {
	name: string;
	variable!: Variable;
	dataExps!: DE[];
	nextproc!: SPE;

	start: PosInfo; namePos: PosInfo; nameEnd: PosInfo

	constructor(parent: Node, curProcIn: Process, start: PosInfo, name: string, namePos: PosInfo, nameEnd: PosInfo) {
        super(9, ASTKinds.SPE_Receive, parent, curProcIn);
		this.name = name;
		this.namePos = namePos;
		this.nameEnd = nameEnd;
		this.start = start
    }
}

export class SPE_Call extends SPE {
	name: string;

	proc!: Process
	args!: DE[];

	posS: PosInfo //before the name
	posE: PosInfo //after the name

	constructor(parent: Node, curProcIn: Process, name: string, posS: PosInfo, posE: PosInfo) {
        super(9, ASTKinds.SPE_Call, parent, curProcIn);
		this.name = name;
		this.posS = posS; this.posE = posE
    }
}

export class SPE_Choice extends SPE {
	left!: SPE;
	right!: SPE;

	constructor(parent: Node, curProcIn: Process) {
        super(10, ASTKinds.SPE_Choice, parent, curProcIn);
    }
}

export class SPE_Brack extends SPE {
	proc!: SPE;

	constructor(parent: Node, curProcIn: Process) {
        super(10, ASTKinds.SPE_Brack, parent, curProcIn);
    }
}

export class DE extends Node{
	type!: TE

	constructor(precedence: number, kind: ASTKinds, parent: Node){
		super(precedence, kind, parent)
	}
}

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

export class DE_Singleton extends DE {
	dataExp!: DE;

	constructor(parent: Node) {
        super(0, ASTKinds.DE_Singleton, parent);
    }
}

export class DE_Set extends DE {
	name: string;

	dataExp!: DE;

	posS: PosInfo
	posE: PosInfo

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(0, ASTKinds.DE_Set, parent);
		this.name = name;
		this.posS = posS; this.posE = posE
    }
}

export class DE_Partial extends DE {
	name: string;

	//{(Name, DE) | DE} <- to explain what left and right refer to, as idk what this construction actually is lmao
	left!: DE; 
	right!: DE;

	posS: PosInfo
	posE: PosInfo

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(0, ASTKinds.DE_Partial, parent);
		this.name = name;
		this.posS = posS; this.posE = posE
    }
}

export class DE_Lambda extends DE {
	name: string
	startPos: PosInfo
	namePos: PosInfo

	dataExp!: DE;
	variable!: Variable //will be null if the "name" field does not refer to a variable

	constructor(parent: Node, name: string, namePos: PosInfo, startPos: PosInfo) {
        super(6, ASTKinds.DE_Lambda, parent);
		this.name = name;
		this.namePos = namePos;
		this.startPos = startPos;
    }
}

export class DE_Forall extends DE {
	name: string;
	startPos: PosInfo
	namePos: PosInfo

	variable!: Variable //will be null if the "name" field does not refer to a variable
	dataExp!: DE;

	constructor(parent: Node, name: string, namePos: PosInfo, startPos: PosInfo) {
        super(6, ASTKinds.DE_Forall, parent);
		this.name = name;
		this.namePos = namePos;
		this.startPos = startPos;
    }
}

export class DE_Exists extends DE {
	name: string;
	startPos: PosInfo
	namePos: PosInfo
	
	variable!: Variable //will be null if the "name" field does not refer to a variable
	dataExp!: DE;

	constructor(parent: Node, name: string, namePos: PosInfo, startPos: PosInfo) {
        super(6, ASTKinds.DE_Exists, parent);
		this.name = name;
		this.namePos = namePos;
		this.startPos = startPos;
    }
}

export class DE_Brack extends DE {
	dataExp!: DE;

	constructor(parent: Node) {
        super(10, ASTKinds.DE_Brack, parent);
    }
}

export class DE_Name extends DE {
	name: string;
	refersTo: ASTKinds = ASTKinds.AWNRoot //what kind of object the DE_Name refers to - note this is different to what type it is
										  //needed for semantic tokens
	posS: PosInfo
	posE: PosInfo

	constructor(parent: Node, name: string, posS: PosInfo, posE: PosInfo) {
        super(0, ASTKinds.DE_Name, parent);
		this.name = name;
		this.posS = posS; this.posE = posE
    }
}

export class DE_Tuple extends DE {
	override type!: TE_Product; //type of DE_Tuple is always TE_Product

	left!: DE //leftover from rotation
	right!: DE //leftover from rotation

	dataExps!: DE[]

	constructor(parent: Node) {
        super(7, ASTKinds.DE_Tuple, parent);
		
    }
}

//DE_Function is Name(DE)
//DE is eventually converted to DE_Tuple - if it is not a tuple, it becomes one with 1 element
export class DE_Function_Prefix extends DE {
	name: string
	dataExp!: DE //original DE before semantic checking

	function!: Function_Prefix
	arguments!: DE_Tuple

	sigStart: PosInfo; sigEnd: PosInfo; argPos: PosInfo; endPos: PosInfo
	
	constructor(parent: Node, name: string, sigStart: PosInfo, sigEnd: PosInfo, argPos: PosInfo, endPos: PosInfo) {
        super(10, ASTKinds.DE_Function, parent);
		this.name = name
		this.sigStart= sigStart
		this.sigEnd = sigEnd
		this.argPos = argPos
		this.endPos = endPos
    }
}

export class DE_Function_Infix extends DE {
	function!: Function_Infix;
	left!: DE;
	right!: DE;

	sigStart: PosInfo; sigEnd: PosInfo

	constructor(parent: Node, precedence: number, sigStart: PosInfo, sigEnd: PosInfo) {
        super(precedence, ASTKinds.DE_Infix, parent);
		this.sigStart = sigStart
		this.sigEnd = sigEnd
    }
}

function convertToTEProduct(typeExp: TE): TE_Product | null {
	switch(typeExp.kind){
		case ASTKinds.TE_Brack: return convertToTEProduct((typeExp as TE_Brack).typeExpr)
		case ASTKinds.TE_Array: return new TE_Product(typeExp.parent, [(typeExp as TE_Array).typeExpr])
		case ASTKinds.TE_Pow: return new TE_Product(typeExp.parent, [(typeExp as TE_Pow).typeExpr])
		case ASTKinds.TE_Name: return new TE_Product(typeExp.parent, [typeExp])
		case ASTKinds.TE_Product: return (typeExp as TE_Product)
		default: return null
	}
}