import { PosInfo } from './parser';

export enum ASTKinds {
	Dummy = "AWN_Dummy",
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
	VariableExp = "VariableExp",
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
export class Node {
    precedence: number 	//Lower numbers have more precedence (i.e. they bind stronger). 
					   	//This is because nodes with higher numbers "escape out", becoming 
						//higher on the AST, which mean they actually have less precedence/binding power.
	kind: ASTKinds
	parent: Node

	pos: Record<string, PosInfo>

    constructor(precedence: number, kind: ASTKinds, parent?: Node, poses?: Record<string, PosInfo>) {
		this.precedence = precedence
		this.kind = kind
		if(kind == ASTKinds.Dummy){
			this.parent = this //avoid infinite loop on dummy instantiation
		}else{
			this.parent = parent ?? getdpar();
		}
		this.pos = poses ?? {} //don't think i ever pass this as null anyway, but i want it after the parent argument for consistency w/ the nodes :)
    }
}

//avoid nullchecks by using a DummyNode as the parent of 
//nodes where the parent is never relevant, also as the parent of AWNRoot
export class DummyNode extends Node {
	constructor() {
		super(10, ASTKinds.Dummy, null as any);
		this.parent = this; //immediately overwrite "null as any"
	}
}

//dpar and dpos are dummy parent and position respectively
let dpar!: Node
function getdpar(): Node{
	if(dpar == null){
		dpar = new DummyNode()
	}
	return dpar
}
const dpos = {overallPos: 10000, line: 1000, offset: 0};

//Given a set of string-pos pairs which may include undefined poses,
//turns the undefined ones into dummypos.
function buildPoses(poses: Record<string, PosInfo | undefined>): Record<string, PosInfo> {
	var out: Record<string, PosInfo> = {}
	for(const [name, p] of Object.entries(poses)){
		out[name] = p ?? dpos
	}
	return out
}

//Used when moving nodes up the tree to know whether a node is allowed to move upwards, as brackets act as barriers.
export function isBracketType(x: ASTKinds): boolean {
	return x === ASTKinds.TE_Brack || x === ASTKinds.TE_Array || x === ASTKinds.TE_Pow || x === ASTKinds.DE_Brack || x === ASTKinds.SPE_Brack || x === ASTKinds.DE_Function
}

//======= AST STARTS HERE =======
//Each node has its (simplified) grammar definition as a comment above it,
//with positions represented by @ symbols for reference.
//For the full unsimplified version, see awn-grammar.peg.
//The definitions won't precisely correspond to the actual grammar
//because the grammar needed to be edited to remove left-recursion.

export class AWNRoot extends Node {
    blocks: Block[] = [];

	constructor() {
        super(10, ASTKinds.AWNRoot, new DummyNode());
    }
}

export type Block = Block_Include | Block_Type | Block_Constant | Block_Variable | Block_Function | Block_Process | Block_Alias

//	 keywordPos=@ 'INCLUDES:' Include+
export class Block_Include extends Node {
    includes: Include[] = []

	constructor(parent?: Node, keywordPos?: PosInfo) {
		const poses = buildPoses({keywordPos})
        super(10, ASTKinds.Block_Include, parent, poses)
	}
}

//	 keywordPos=@ 'TYPES:' Type+
export class Block_Type extends Node {
    types: Type[] = []

	constructor(parent?: Node, keywordPos?: PosInfo) {
        const poses = buildPoses({keywordPos})
        super(10, ASTKinds.Block_Type, parent, poses)
    }
}

//	 keywordPos=@ 'VARIABLES:' Variable+
export class Block_Variable extends Node {
    vars: Variable[] = []

	constructor(parent?: Node, keywordPos?: PosInfo) {
        const poses = buildPoses({keywordPos})
        super(10, ASTKinds.Block_Variable, parent, poses)
    }
}

//	 keywordPos=@ 'CONSTANTS:' Constant+
export class Block_Constant extends Node {
    consts: Constant[] = []

	constructor(parent?: Node, keywordPos?: PosInfo) {
        const poses = buildPoses({keywordPos})
        super(10, ASTKinds.Block_Constant, parent, poses)
    }
}

//	 keywordPos=@ 'FUNCTIONS:' Function+
export class Block_Function extends Node {
    funcs: Function[] = []

	constructor(parent?: Node, keywordPos?: PosInfo) {
        const poses = buildPoses({keywordPos})
        super(10, ASTKinds.Block_Function, parent, poses)
    }
}

//	 keywordPos=@ 'PROCESSES:' Process+
//	|keywordPos=@ 'proc:' Process
export class Block_Process extends Node {
    procs: Process[] = []

	definedAsProc: Boolean //necessary for syntax highlighting, it's whether it was defined under "proc" or "PROCESSES:"

	constructor(definedAsProc: boolean, parent?: Node, keywordPos?: PosInfo) {
		const poses = buildPoses({keywordPos})
        super(10, ASTKinds.Block_Process, parent, poses)
		this.definedAsProc = definedAsProc
    }
}

//	 keywordPos=@ 'ALIASES:' Alias+
export class Block_Alias extends Node {
	aliases: Alias[] = []

	constructor(parent?: Node, keywordPos?: PosInfo) {
		const poses = buildPoses({keywordPos})
        super(10, ASTKinds.Block_Alias, parent, poses)
    }
}

//	 posS=@ name posE=@
export class Include extends Node {
    name: string

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
        const poses = buildPoses({posS, posE})
        super(10, ASTKinds.Include, parent, poses)
		this.name = name
    }
}

//For type defs declared in a TYPES block
//	posS=@ typeName posE=@ '=' typeExpr
export class Type extends Node {
    typeName: string
    typeExpr!: TE //associated TE; type decs without a TE are given TE_RootType of their name.

	constructor(typeName: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(10, ASTKinds.Type, parent, poses)
		this.typeName = typeName
    }
}

export type TE = TE_Brack | TE_Pow | TE_Array | TE_Name | TE_Function | TE_Product | TE_RootType | TE_Any

// 	'(' typeExpr ')'
export class TE_Brack extends Node {
	typeExpr!: TE

	constructor(parent?: Node) {
        super(4, ASTKinds.TE_Brack, parent)
    }
}

//	 powPos=@ 'Pow' '(' typeExpr ')'
export class TE_Pow extends Node {
	typeExpr!: TE

	constructor(typeExpr?: TE, parent?: Node, powPos?: PosInfo) {
		const poses = buildPoses({powPos})
        super(4, ASTKinds.TE_Pow, parent, poses)
		if(typeExpr != null){
			this.typeExpr = typeExpr
		}
    }
}

//	'[' typeExpr ']'
export class TE_Array extends Node {
	typeExpr!: TE

	constructor(parent?: Node) {
        super(4, ASTKinds.TE_Array, parent);
    }
}

//	posS=@ typename posE=@
export class TE_Name extends Node {
	typename: string

	typeExpr!: TE //what the TE_Name refers to, set during check.ts

	constructor(typename: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(0, ASTKinds.TE_Name, parent, poses) 
		this.typename = typename
    }
}

export class TE_RootType extends Node {
	typename: string

	constructor(typename: string, parent?: Node) {
        super(0, ASTKinds.TE_RootType, parent)
		this.typename = typename
    }
}

//used for both full & partial funcs
export class TE_Function extends Node {
	left!: TE; // (after rotation) signature type
	right!: TE; // (after rotation) output type

	get sigType(): TE_Product{
		return convertToTEProduct(this.left);
	}

	get outType(): TE {
		return this.right
	}

	get isBTE(): boolean {
		const sig = this.sigType;
		if(sig == null){return false}
		return sig.children.length == 2
	}
}

//	left '->' right
export class TE_FuncFull extends TE_Function {
	constructor(parent?: Node, left?: TE, right?: TE) {
        super(2, ASTKinds.TE_FuncFull, parent);
		if(left != null && right != null){
			this.left = left; this.right = right
		}
    }
}

// 	left '+->' right
export class TE_FuncPart extends TE_Function {
	constructor(parent?: Node, left?: TE, right?: TE) {
        super(3, ASTKinds.TE_FuncPart, parent);
		if(left != null && right != null){
			this.left = left; this.right = right
		}
    }
}

// 	children = (x-delimited typeExprs)
export class TE_Product extends Node {
	//these two only used during rotation phase, can ignore thereafter
	left!: TE;
	right!: TE;

	children!: TE[];
	
	constructor(children?: TE[], parent?: Node) {
        super(1, ASTKinds.TE_Product, parent);
		if(children != null){
			this.children = children
		}
    }
}

//TE_Any is used as the type of some functions, such as "=", which take any arguments.
//Typematches with everything.
export class TE_Any extends Node {
	constructor(parent?: Node) {
        super(0, ASTKinds.TE_Any, parent);
    }
}

//	typeExpr posS=@ name posE=@
// |posS=@ name posE=@ ':' typeExpr
export class Constant extends Node {
    name: string	
	typeExpr!: TE

	typeDeclaredFirst: boolean = false //needed for syntax highlighting (which format the const was declared with)

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(10, ASTKinds.Constant, parent, poses)
		this.name = name
    }
}

//	typeExpr posS=@ name posE=@
// |posS=@ name posE=@ ':' typeExpr
export class Variable extends Node {
    name: string
	typeExpr!: TE

	typeDeclaredFirst: boolean = false //needed for syntax highlighting (which format the var was declared with)

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(10, ASTKinds.Variable, parent, poses)
		this.name = name
    }
}

//  posS=@ name (referring to var) posE=@ {[DE]}*
export class VariableExp extends Node {
	name: string
	var!: Variable
	type?: TE

	des: DE[] = []

	DEPosS: PosInfo[] = []; DEPosE: PosInfo[] = []

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(10, ASTKinds.VariableExp, parent, poses)
		this.name = name
    }
}

//see Function_Prefix/Infix
export class Function extends Node {
    name: string;

	type!: TE_Function

	sigType!: TE_Product
	outType!: TE

	constructor(precedence: number, kind: ASTKinds, name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(precedence, kind, parent, poses)
        this.name = name;
    }

	get isBinary(): boolean {return this.sigType.children.length == 2}
}

//	posS=@ name posE=@ ':' typeExpr
export class Function_Prefix extends Function {
    constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
        super(10, ASTKinds.Function_Prefix, name, parent, posS, posE);
    }
}

//	posS=@ infixname posE=@ ':' typeExpr
export class Function_Infix extends Function {
    constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
        super(10, ASTKinds.Function_Infix, name, parent, posS, posE);
    }
}

//	posS=@ name posE@ '(' (comma-delimited arguments, held in args/argInfo) ')' ':=' lb proc
export class Process extends Node {
    name: string;
	argInfo: ProcArg[] = []
	args: Variable[] = []
    proc!: SPE;

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(10, ASTKinds.Process, parent, poses)
		this.name = name;
    }
}

//Exists separately to variable for syntax highlighing.
//	posS=@ name posE=@
export class ProcArg extends Node {
	proc: Process
	name: string
	argType!: ASTKinds

	constructor(name: string, parent: Process, posS?: PosInfo, posE?: PosInfo){
		const poses = buildPoses({posS, posE})
        super(10, ASTKinds.ProcArgs, parent, poses)
		this.proc = parent
		this.name = name
	}
}

export type Alias = Alias_List | Alias_Data

//	posS=@ name posE@ ':=' (comma-delimited argument list, held in argNames etc.)
export class Alias_List extends Node {
	name: string;
	argNames!: string[]

	args: (Variable | Alias_List)[] = []

	argsPosS: PosInfo[] = []; argsPosE: PosInfo[] = []

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(10, ASTKinds.Alias_List, parent, poses)
		this.name = name;
    }
}

// posS=@ name posE=@ ':=' dataExp
export class Alias_Data extends Node {
	name: string;

	dataExp!: DE;

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(10, ASTKinds.Alias_Data, parent, poses)
		this.name = name;
    }
}

export type SPEs = SPE_Assign | SPE_Brack | SPE_Broadcast | SPE_Call | SPE_Choice | SPE_Deliver | SPE_Groupcast | SPE_Guard | SPE_Receive | SPE_Send | SPE_Unicast

export class SPE extends Node {
	curProcIn: Process;

	constructor(precedence: number, kind: ASTKinds, curProcIn: Process, parent?: Node, poses?: Record<string, PosInfo>){
		super(precedence, kind, parent, poses)
		this.curProcIn = curProcIn
	}
}

//	'[' DEStart=@ dataExp DEEnd=@ ']' lb nextproc
export class SPE_Guard extends SPE {
	dataExp!: DE;
	nextproc!: SPE;

	constructor(curProcIn: Process, parent?: Node, DEStart?: PosInfo, DEEnd?: PosInfo) {
		const poses = buildPoses({DEStart, DEEnd})
        super(9, ASTKinds.SPE_Guard, curProcIn, parent, poses)
    }
}

//	'[[' nameStart=@ name varStart=@ ':=' assignExpStart=@ dataExpAssign end=@ ']]' lb nextproc
export class SPE_Assign extends SPE {
	variableExp!: VariableExp
	dataExpAssign!: DE;
	nextproc!: SPE;

	constructor(curProcIn: Process, parent?: Node, assignExpStart?: PosInfo, end?: PosInfo) {
		const poses = buildPoses({assignExpStart, end})
        super(9, ASTKinds.SPE_Assign, curProcIn, parent, poses);
    }
}

//	start=@ 'unicast' '(' DELstart=@ dataExpL DELend=@ ';' dataExpR DERend=@ '\)' '.' procA '>' procB
export class SPE_Unicast extends SPE {
	dataExpL!: DE;
    dataExpR!: DE;
	nextproc!: SPE;

	constructor(curProcIn: Process, parent?: Node, start?: PosInfo, DELstart?: PosInfo, DELend?: PosInfo, DERend?: PosInfo) {
		const poses = buildPoses({start, DELstart, DELend, DERend})
        super(9, ASTKinds.SPE_Unicast, curProcIn, parent, poses);
    }
}

//	start=@ 'broadcast' '(' DEstart=@ dataExp DEend=@ '\)' '.' nextproc
export class SPE_Broadcast extends SPE {
	dataExp!: DE;
	nextproc!: SPE;
	
	constructor(curProcIn: Process, parent?: Node, start?: PosInfo, DEstart?: PosInfo, DEend?: PosInfo) {
		const poses = buildPoses({start, DEstart, DEend})
        super(9, ASTKinds.SPE_Broadcast, curProcIn, parent, poses);
    }
}

//	start=@ 'groupcast' '(' DELstart=@ dataExpL DELend=@ ';' dataExpR=DE DERend=@ ')' '.' nextproc
export class SPE_Groupcast extends SPE {
	dataExpL!: DE;
    dataExpR!: DE;
	nextproc!: SPE;
	
	constructor(curProcIn: Process, parent?: Node, start?: PosInfo, DELstart?: PosInfo, DELend?: PosInfo, DERend?: PosInfo) {
		const poses = buildPoses({start, DELstart, DELend, DERend})
        super(9, ASTKinds.SPE_Groupcast, curProcIn, parent, poses);
    }
}

//	start=@ 'send' '(' DEstart=@ dataExp DEend=@ ')' '.' nextproc
export class SPE_Send extends SPE {
	dataExp!: DE;
	nextproc!: SPE;
	
	constructor(curProcIn: Process, parent?: Node, start?: PosInfo, DEstart?: PosInfo, DEend?: PosInfo) {
		const poses = buildPoses({start, DEstart, DEend})
        super(9, ASTKinds.SPE_Send, curProcIn, parent, poses);
    }
}

//	start=@ 'deliver' '(' DEstart=@ dataExp DEend=@ ')' '.' nextproc
export class SPE_Deliver extends SPE {
	dataExp!: DE;
	nextproc!: SPE;
	
	constructor(curProcIn: Process, parent?: Node, start?: PosInfo, DEstart?: PosInfo, DEend?: PosInfo) {
		const poses = buildPoses({start, DEstart, DEend})
        super(9, ASTKinds.SPE_Deliver, curProcIn, parent, poses);
    }
}

//	start=@ 'receive' '(' namePos=@ name=Name nameEnd=@ dataExps ')' '.' nextproc
export class SPE_Receive extends SPE {
	name: string;
	variable!: Variable;
	dataExps!: DE[];
	nextproc!: SPE;

	constructor(name: string, curProcIn: Process, parent?: Node, start?: PosInfo, namePos?: PosInfo, nameEnd?: PosInfo) {
		const poses = buildPoses({start, namePos, nameEnd})
        super(9, ASTKinds.SPE_Receive, curProcIn, parent, poses);
		this.name = name;
    }
}

//	posS=@ name posE=@ '(' (args) ')'
export class SPE_Call extends SPE {
	name: string;

	proc!: Process
	args!: DE[];

	constructor(name: string, curProcIn: Process, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(9, ASTKinds.SPE_Call, curProcIn, parent, poses);
		this.name = name;
    }
}

//	left '+' right
export class SPE_Choice extends SPE {
	left!: SPE;
	right!: SPE;

	constructor(curProcIn: Process, parent?: Node) {
        super(10, ASTKinds.SPE_Choice, curProcIn, parent);
    }
}

//	'(' proc ')'
export class SPE_Brack extends SPE {
	proc!: SPE;

	constructor(curProcIn: Process, parent?: Node) {
        super(10, ASTKinds.SPE_Brack, curProcIn, parent);
    }
}

export class DE extends Node{
	type!: TE

	constructor(precedence: number, kind: ASTKinds, parent?: Node, poses?: Record<string, PosInfo>){
		super(precedence, kind, parent, poses)
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

//	'{' dataExp '}'
export class DE_Singleton extends DE {
	dataExp!: DE;

	constructor(parent?: Node) {
        super(0, ASTKinds.DE_Singleton, parent);
    }
}

//	'{' posS=@ name posE=@ '|' DEPosS=@ dataExp DEPosE=@ '}
export class DE_Set extends DE {
	name: string;

	dataExp!: DE;

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo, DEPosS?: PosInfo, DEPosE?: PosInfo) {
		const poses = buildPoses({posS, posE, DEPosS, DEPosE})
        super(0, ASTKinds.DE_Set, parent, poses);
		this.name = name;
    }
}

//	'{' '(' posS=@ name posE=@ ',' left ')' '|' DEPosS=@ right DEPosE=@ '}'
export class DE_Partial extends DE {
	name: string;

	left!: DE; 
	right!: DE;

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo, DEPosS?: PosInfo, DEPosE?: PosInfo) {
		const poses = buildPoses({posS, posE, DEPosS, DEPosE})
        super(0, ASTKinds.DE_Partial, parent, poses);
		this.name = name;
    }
}

//	startPos=@ 'lambda ' namePos=@ name '. ' dataExp
export class DE_Lambda extends DE {
	name: string

	dataExp!: DE;
	variable!: Variable //will be null if the "name" field does not refer to a variable

	constructor(name: string, parent?: Node, namePos?: PosInfo, startPos?: PosInfo) {
		const poses = buildPoses({namePos, startPos})
        super(6, ASTKinds.DE_Lambda, parent, poses);
		this.name = name;
    }
}

//	startPos=@ 'forall ' namePos=@ name '. ' dataExp
export class DE_Forall extends DE {
	name: string;
	variable!: Variable //will be null if the "name" field does not refer to a variable
	dataExp!: DE;

	constructor(name: string, parent?: Node, namePos?: PosInfo, startPos?: PosInfo) {
		const poses = buildPoses({namePos, startPos})
        super(6, ASTKinds.DE_Forall, parent, poses);
		this.name = name;
    }
}

//	startPos=@ 'exists ' namePos=@ name '. ' dataExp
export class DE_Exists extends DE {
	name: string;
	
	variable!: Variable //will be null if the "name" field does not refer to a variable
	dataExp!: DE;

	constructor(name: string, parent?: Node, namePos?: PosInfo, startPos?: PosInfo) {
		const poses = buildPoses({namePos, startPos})
        super(6, ASTKinds.DE_Exists, parent, poses);
		this.name = name;
    }
}

//	'(' dataExp ')'
export class DE_Brack extends DE {
	dataExp!: DE;

	constructor(parent?: Node) {
        super(10, ASTKinds.DE_Brack, parent);
    }
}

//	posS=@ name posE=@
export class DE_Name extends DE {
	name: string;
	refersTo: ASTKinds = ASTKinds.AWNRoot //what kind of object the DE_Name refers to - note this is different to what type it is
										  //needed for semantic tokens

	constructor(name: string, parent?: Node, posS?: PosInfo, posE?: PosInfo) {
		const poses = buildPoses({posS, posE})
        super(0, ASTKinds.DE_Name, parent, poses);
		this.name = name;
    }
}

//	dataExps are comma separated DEs
export class DE_Tuple extends DE {
	override type!: TE_Product; //type of DE_Tuple is always TE_Product

	left!: DE //leftover from rotation
	right!: DE //leftover from rotation

	dataExps!: DE[]

	constructor(parent?: Node) {
        super(7, ASTKinds.DE_Tuple, parent);
		
    }
}

//DE_Function_Prefix is Name(DE)
//	
export class DE_Function_Prefix extends DE {
	name: string
	dataExp!: DE //DE is eventually converted to arguments, a DE_Tuple - if it is not a tuple, it becomes one with 1 element

	function!: Function_Prefix
	arguments!: DE_Tuple
	
	constructor(name: string, parent?: Node, sigStart?: PosInfo, sigEnd?: PosInfo, argPos?: PosInfo, endPos?: PosInfo) {
		const poses = buildPoses({sigStart, sigEnd, argPos, endPos})
        super(10, ASTKinds.DE_Function, parent, poses);
		this.name = name
    }
}

//	left sigStart=@ infixfunc sigEnd=@ right
export class DE_Function_Infix extends DE {
	function!: Function_Infix;
	left!: DE;
	right!: DE;

	constructor(precedence: number, parent?: Node, sigStart?: PosInfo, sigEnd?: PosInfo) {
		const poses = buildPoses({sigStart, sigEnd})
        super(precedence, ASTKinds.DE_Infix, parent, poses);
    }
}

function convertToTEProduct(typeExp: TE): TE_Product {
	switch(typeExp.kind){
		case ASTKinds.TE_Brack: return convertToTEProduct((typeExp as TE_Brack).typeExpr)
		case ASTKinds.TE_Array: return new TE_Product([(typeExp as TE_Array).typeExpr], typeExp.parent)
		case ASTKinds.TE_Pow: return new TE_Product([(typeExp as TE_Pow).typeExpr], typeExp.parent)
		case ASTKinds.TE_Product: return (typeExp as TE_Product)
		default: return new TE_Product([typeExp], typeExp.parent)
	}
}