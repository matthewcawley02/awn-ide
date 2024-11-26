import { Position } from 'vscode-languageserver';
import { PosInfo } from './parser';
import { DESTRUCTION } from 'dns';

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
    Function_Generic = "Function_Generic",
    Function_Infix = "Function_Infix",
    Process = "Process",
	Alias_List = "Alias_List",
	Alias_Data = "Alias_Data",
    TE_Brack = "TE_Brack",
    TE_Pow = "TE_Pow",
    TE_List = "TE_List",
    TE_Name = "TE_Name",
    TE_Function = "TE_Function",
    TE_Partial = "TE_Partial",
    TE_Product = "TE_Product",
    BTE_Partial = "BTE_Partial",
    BTE_Function = "BTE_Function",
    BTE_Pow = "BTE_Pow",
    BTE_Name = "BTE_Name",
    BTE_List = "BTE_List",
    BTE_Brack = "BTE_Brack",
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
	DE_Binary = "DE_Binary",
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
	return x === ASTKinds.TE_Brack || x === ASTKinds.TE_List || x === ASTKinds.TE_Pow || x === ASTKinds.DE_Brack || x === ASTKinds.SPE_Brack
}

export class Node {
    parent: Node;
    precedence: number;
	kind: ASTKinds

    constructor(precedence: number, kind: ASTKinds, parent: Node, position?: PosInfo) {
        this.parent = parent;
        this.precedence = precedence;
		this.kind = kind;
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

export type Block = Block_Include | Block_Type | Block_Constant | Block_Variable | Block_Function | Block_Process | Block_Alias
export class Block_Include extends Node {
    includes: Include[] = [];

	constructor(parent: Node) {
        super(10, ASTKinds.Block_Include, parent);
    }
}

export class Block_Type extends Node {
    types: Type[] = [];

	constructor(parent: Node) {
        super(10, ASTKinds.Block_Type, parent);
    }
}

export class Block_Variable extends Node {
    vars: Variable[] = [];

	constructor(parent: Node) {
        super(10, ASTKinds.Block_Variable, parent);
    }
}

export class Block_Constant extends Node {
    consts: Constant[] = [];

	constructor(parent: Node) {
        super(10, ASTKinds.Block_Constant, parent);
    }
}

export class Block_Function extends Node {
    funcs: Function[] = [];

	constructor(parent: Node) {
        super(10, ASTKinds.Block_Function, parent);
    }
}

export class Block_Process extends Node {
    procs: Process[] = [];

	constructor(parent: Node) {
        super(10, ASTKinds.Block_Process, parent);
    }
}

export class Block_Alias extends Node {
	aliases: Alias[] = [];

	constructor(parent: Node) {
        super(10, ASTKinds.Block_Alias, parent);
    }
}

export class Include extends Node {
    name: string;

	constructor(parent: Node, name: string) {
        super(0, ASTKinds.Include, parent);
		this.name = name;
    }
}

export class Type extends Node {
    typeName: string;
    typeExpr!: TE; //empty type declarations are given the TE_Name typeExpr, so this can't be null
	pos: PosInfo

	constructor(parent: Node, typeName: string, position: PosInfo) {
        super(10, ASTKinds.Type, parent);
		this.typeName = typeName;
		this.pos = position
    }
}

export class TE extends Node{
	children: TE[] = [];

	constructor(parent: Node, precedence: number, kind: ASTKinds){
		super(precedence, kind, parent)
	}
}

export class TE_Brack extends TE {
	typeExpr!: TE;

	constructor(parent: Node) {
        super(parent, 4, ASTKinds.TE_Brack);
    }
}

export class TE_Pow extends TE {
	typeExpr!: TE;

	constructor(parent: Node, typeExpr?: TE) {
        super(parent, 4, ASTKinds.TE_Pow);
		if(typeExpr != null){
			this.typeExpr = typeExpr
		}
    }
}

export class TE_List extends TE {
	typeExpr!: TE;

	constructor(parent: Node) {
        super(parent, 4, ASTKinds.TE_List);
    }
}

export class TE_Name extends TE {
	typename: string;
	pos: PosInfo

	constructor(parent: Node, typename: string, position: PosInfo) {
        super(parent, 0, ASTKinds.TE_Name);
		this.typename = typename;
		this.pos = position
    }
}

export class TE_Function extends TE {
	left!: TE;
	right!: TE;

	constructor(parent: Node, left?: TE, right?: TE) {
        super(parent, 3, ASTKinds.TE_Function);
		if(left != null && right != null){
			this.left = left; this.right = right
		}
    }
}

export class TE_Partial extends TE {
	left!: TE;
	right!: TE;

	constructor(parent: Node, left?: TE, right?: TE) {
        super(parent, 2, ASTKinds.TE_Function);
		if(left != null && right != null){
			this.left = left; this.right = right
		}
    }
}

export class TE_Product extends TE {
	left!: TE;
	right!: TE;

	constructor(parent: Node) {
        super(parent, 1, ASTKinds.TE_Product);
    }
}

export type BTE = BTE_Function | BTE_Partial

export class BTE_Function extends TE {
	left!: BTE_AUX;
	right!: BTE_AUX;
	output!: TE;

	constructor(parent: Node) {
        super(parent, 10, ASTKinds.BTE_Function);
    }
}

export class BTE_Partial extends TE {
	left!: BTE_AUX;
	right!: BTE_AUX;
	output!: TE;

	constructor(parent: Node) {
        super(parent, 10, ASTKinds.BTE_Partial);
    }
}
export type BTE_AUX = TE_Brack | TE_Pow | TE_List | TE_Name


export class Variable extends Node {
    typeExpr!: TE;
    name: string;
	namePos: PosInfo

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(10, ASTKinds.Variable, parent);
		this.name = name;
		this.namePos = namePos
    }
}

export class Constant extends Node {
    typeExpr!: TE;
    name: string;
	namePos: PosInfo

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(10, ASTKinds.Constant, parent);
		this.name = name;
		this.namePos = namePos
    }
}

export type Function = Function_Generic | Function_Infix
export class Function_Generic extends Node {
    name: string;
	namePos: PosInfo
    signature!: TE;

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(10, ASTKinds.Function_Generic, parent);
		this.name = name;
		this.namePos = namePos
    }
}

export class Function_Infix extends Node {
    name: string;
	namePos: PosInfo;
    signature!: BTE;

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(10, ASTKinds.Function_Infix, parent);
		this.name = name;
		this.namePos = namePos
    }
}

export class Process extends Node {
    name: string;
	namePos: PosInfo
	args!: Variable[];
    proc!: SPE;

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(10, ASTKinds.Process, parent);
		this.name = name;
		this.namePos = namePos
    }
}

export type Alias = Alias_List | Alias_Data
export class Alias_List extends Node {
	name: string;
	args!: string[];

	constructor(parent: Node, name: string) {
        super(10, ASTKinds.Alias_List, parent);
		this.name = name;
    }
}

export class Alias_Data extends Node {
	name: string;
	dataExp!: DE;

	constructor(parent: Node, name: string) {
        super(10, ASTKinds.Alias_Data, parent);
		this.name = name;
    }
}

export type SPE = SPE_Guard | SPE_Assign | SPE_Unicast | SPE_Broadcast | SPE_Groupcast | SPE_Send | SPE_Deliver | SPE_Receive | SPE_Call | SPE_Choice | SPE_Name;
export class SPE_Guard extends Node {
	dataExp!: DE;
	DEStart: PosInfo; DEEnd: PosInfo
	nextproc!: SPE;

	constructor(parent: Node, DEStart: PosInfo, DEEnd: PosInfo) {
        super(10, ASTKinds.SPE_Guard, parent);
		this.DEStart = DEStart
		this.DEEnd = DEEnd
    }
}

export class SPE_Assign extends Node {
	name: string;
	variable!: Variable
	dataExpList!: DE[];
	dataExpAssign!: DE;
	nextproc!: SPE;
	nameStart: PosInfo; varStart: PosInfo; listExpStart: PosInfo; listExpEnd: PosInfo; assignExpStart: PosInfo; end: PosInfo

	constructor(parent: Node, name: string, nameStart: PosInfo, varStart: PosInfo, listExpStart: PosInfo, listExpEnd: PosInfo, assignExpStart: PosInfo, end: PosInfo) {
        super(10, ASTKinds.SPE_Assign, parent);
		this.name = name
		this.nameStart = nameStart
		this.varStart = varStart
		this.listExpStart = listExpStart
		this.listExpEnd = listExpEnd
		this.assignExpStart = assignExpStart
		this.end = end
    }
}

export class SPE_Unicast extends Node {
	dataExpL!: DE;
    dataExpR!: DE;
    procA!: SPE;
	procB!: SPE;
	DELstart: PosInfo; DELend: PosInfo; DERend: PosInfo

	constructor(parent: Node, DELstart: PosInfo, DELend: PosInfo, DERend: PosInfo) {
        super(10, ASTKinds.SPE_Unicast, parent);
		this.DELstart = DELstart
		this.DELend = DELend
		this.DERend = DERend
    }
}

export class SPE_Broadcast extends Node {
	dataExp!: DE;
	nextproc!: SPE;
	DEstart: PosInfo; DEend: PosInfo

	constructor(parent: Node, DEstart: PosInfo, DEend: PosInfo) {
        super(10, ASTKinds.SPE_Broadcast, parent);
		this.DEstart = DEstart
		this.DEend = DEend
    }
}

export class SPE_Groupcast extends Node {
	dataExpL!: DE;
    dataExpR!: DE;
	nextproc!: SPE;
	DELstart: PosInfo; DELend: PosInfo; DERend: PosInfo

	constructor(parent: Node, DELstart: PosInfo, DELend: PosInfo, DERend: PosInfo) {
        super(10, ASTKinds.SPE_Groupcast, parent);
		this.DELstart = DELstart
		this.DELend = DELend
		this.DERend = DERend
    }
}

export class SPE_Send extends Node {
	dataExp!: DE;
	nextproc!: SPE;
	DEstart: PosInfo; DEend: PosInfo

	constructor(parent: Node, DEstart: PosInfo, DEend: PosInfo) {
        super(10, ASTKinds.SPE_Send, parent);
		this.DEstart = DEstart
		this.DEend = DEend
    }
}

export class SPE_Deliver extends Node {
	dataExp!: DE;
	nextproc!: SPE;
	DEstart: PosInfo; DEend: PosInfo

	constructor(parent: Node, DEstart: PosInfo, DEend: PosInfo) {
        super(10, ASTKinds.SPE_Deliver, parent);
		this.DEstart = DEstart
		this.DEend = DEend
    }
}

export class SPE_Receive extends Node {
	name: string;
	namePos: PosInfo; nameEnd: PosInfo
	variable!: Variable;
	dataExps!: DE[];
	nextproc!: SPE;

	constructor(parent: Node, name: string, namePos: PosInfo, nameEnd: PosInfo) {
        super(10, ASTKinds.SPE_Receive, parent);
		this.name = name;
		this.namePos = namePos;
		this.nameEnd = nameEnd;
    }
}

export class SPE_Call extends Node {
	name: string;
	namePos: PosInfo
	args!: DE[];

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(10, ASTKinds.SPE_Call, parent);
		this.name = name;
		this.namePos = namePos;
    }
}

export class SPE_Name extends Node {
	name: string;
	namePos: PosInfo

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(10, ASTKinds.SPE_Name, parent);
		this.name = name;
		this.namePos = namePos
    }
}

export class SPE_Choice extends Node {
	left!: SPE;
	right!: SPE;

	constructor(parent: Node) {
        super(10, ASTKinds.SPE_Choice, parent);
    }
}

export class DE extends Node{
	children: DE[] = [];
	type!: TE

	constructor(precedence: number, kind: ASTKinds, parent: Node){
		super(precedence, kind, parent)
	}
}

export class DE_Singleton extends DE {
	dataExp!: DE;

	constructor(parent: Node) {
        super(0, ASTKinds.DE_Singleton, parent);
    }
}

export class DE_Partial extends DE {
	name: string;
	namePos: PosInfo
	left!: DE;
	right!: DE;

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(0, ASTKinds.DE_Partial, parent);
		this.name = name;
		this.namePos = namePos;
    }
}

export class DE_Set extends DE {
	name: string;
	namePos: PosInfo
	dataExp!: DE;

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(0, ASTKinds.DE_Set, parent);
		this.name = name;
		this.namePos = namePos;
    }
}

export class DE_Lambda extends DE {
	name: string;
	namePos: PosInfo
	dataExp!: DE;

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(6, ASTKinds.DE_Lambda, parent);
		this.name = name;
		this.namePos = namePos;
    }
}

export class DE_Forall extends DE {
	name: string;
	namePos: PosInfo
	dataExp!: DE;

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(6, ASTKinds.DE_Forall, parent);
		this.name = name;
		this.namePos = namePos;
    }
}

export class DE_Exists extends DE {
	name: string;
	namePos: PosInfo
	dataExp!: DE;

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(6, ASTKinds.DE_Exists, parent);
		this.name = name;
		this.namePos = namePos;
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
	namePos: PosInfo

	constructor(parent: Node, name: string, namePos: PosInfo) {
        super(0, ASTKinds.DE_Name, parent);
		this.name = name;
		this.namePos = namePos
    }
}

export class DE_Function extends DE {
	signature!: DE;
	arguments!: DE;
	sigPos: PosInfo; argPos: PosInfo; endPos: PosInfo

	constructor(parent: Node, sigPos: PosInfo, argPos: PosInfo, endPos: PosInfo) {
        super(1, ASTKinds.DE_Function, parent);
		this.sigPos = sigPos
		this.argPos = argPos
		this.endPos = endPos
    }
}

export class DE_Tuple extends DE {
	dataExps!: DE[];

	constructor(parent: Node) {
        super(5, ASTKinds.DE_Tuple, parent);
    }
}

export class DE_Binary extends DE {
	function!: Function_Infix;
	left!: DE;
	right!: DE;

	constructor(parent: Node, precedence: number) {
        super(precedence, ASTKinds.DE_Binary, parent);
    }
}