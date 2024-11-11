export enum ASTKinds {
    AWNRoot = "AWNRoot",
    Block_Include = "Block_Include",
    Block_Type = "Block_Type",
    Block_ConVar = "Block_ConVar",  //having these combined means we can't have a const and a var with the same name, can change this if wanted
    Block_Function = "Block_Function",
    Block_Process = "Block_Process",
    Include = "Include",
    Type = "Type",
    ConVar = "ConVar",
    Function_Generic = "Function_Generic",
    Function_Infix = "Function_Infix",
    Process = "Process",
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

export class Node {
    parent: Node | null = null;
    precedence: number;

    constructor(precedence: number, parent?: Node) {
        if (parent) this.parent = parent;
        this.precedence = precedence;
    }
}

//Nodes have children properties as non-nullable (or empty list). This is so 
//when constructing the AST, we can define all other properties 
//of the node first, then define the child immediately after.
//(Otherwise [defining the child] will execute before the rest
//of the node is built, and we can't have that or rotating
//won't work as the parents won't exist.)
export class AWNRoot extends Node {
    kind = ASTKinds.AWNRoot;
    blocks: Block[] = [];

	constructor() {
        super(0, undefined);
    }
}

export type Block = Block_Include | Block_Type | Block_ConVar | Block_Function | Block_Process
export class Block_Include extends Node {
    kind = ASTKinds.Block_Include;
    includes: Include[] = [];

	constructor(parent: Node) {
        super(0, parent);
    }
}

export class Block_Type extends Node {
    kind = ASTKinds.Block_Type;
    types: Type[] = [];

	constructor(parent: Node) {
        super(0, parent);
    }
}

export class Block_ConVar extends Node {
    kind = ASTKinds.Block_ConVar;
    vars: ConVar[] = [];

	constructor(parent: Node) {
        super(0, parent);
    }
}

export class Block_Function extends Node {
    kind = ASTKinds.Block_Function;
    funcs: Function[] = [];

	constructor(parent: Node) {
        super(0, parent);
    }
}

export class Block_Process extends Node {
    kind = ASTKinds.Block_Process;
    procs: Process[] = [];

	constructor(parent: Node) {
        super(0, parent);
    }
}

export class Include extends Node {
    kind = ASTKinds.Include;
    name: string;

	constructor(parent: Node, name: string) {
        super(0, parent);
		this.name = name;
    }
}

export class Type extends Node {
    kind = ASTKinds.Type;
    typeName: string;
    typeExpr?: TE;

	constructor(parent: Node, typeName: string) {
        super(0, parent);
		this.typeName = typeName;
    }
}

export interface ConVar extends Node {
    kind: ASTKinds.ConVar;
    typeExpr: TE;
    names: [string, ... string[]];
}

export type Function = Function_Generic | Function_Infix
export interface Function_Generic extends Node {
    kind: ASTKinds.Function_Generic;
    name: string;
    signature: TE;
}

export interface Function_Infix extends Node {
    kind: ASTKinds.Function_Infix;
    name: string;
    signature: BTE;
}

export interface Process extends Node {
    kind: ASTKinds.Process;
    name: string;
	args: string[];
    proc: SPE;
}

export type TE = TE_Brack | TE_Pow | TE_List | TE_Name | TE_Function | TE_Partial | TE_Product
export class TE_Brack extends Node {
	kind = ASTKinds.TE_Brack;
	typeExpr!: TE;

	constructor(parent: Node) {
        super(4, parent);
    }
}

export class TE_Pow extends Node {
	kind = ASTKinds.TE_Pow;
	typeExpr!: TE;

	constructor(parent: Node) {
        super(4, parent);
    }
}

export class TE_List extends Node {
	kind = ASTKinds.TE_List;
	typeExpr!: TE;

	constructor(parent: Node) {
        super(4, parent);
    }
}

export class TE_Name extends Node {
	kind = ASTKinds.TE_Name;
	typename: string;

	constructor(parent: Node, typename: string) {
        super(4, parent);
		this.typename = typename;
    }
}

export class TE_Function extends Node {
	kind = ASTKinds.TE_Function;
	left!: TE;
	right!: TE;

	constructor(parent: Node) {
        super(2, parent);
    }
}

export class TE_Partial extends Node {
	kind = ASTKinds.TE_Partial;
	left!: TE;
	right!: TE;

	constructor(parent: Node) {
        super(1, parent);
    }
}

export class TE_Product extends Node {
	kind = ASTKinds.TE_Product;
	left!: TE;
	right!: TE;

	constructor(parent: Node) {
        super(3, parent);
    }
}

export type BTE = BTE_Function | BTE_Partial
export interface BTE_Function extends Node {
    kind: ASTKinds.BTE_Function;
    left: BTE_AUX;
    right: BTE_AUX;
    typeExpr: TE;
}
export interface BTE_Partial extends Node {
    kind: ASTKinds.BTE_Partial;
    left: BTE_AUX;
    right: BTE_AUX;
    typeExpr: TE;
}

export type BTE_AUX = BTE_Brack | BTE_Pow | BTE_List | BTE_Name
export interface BTE_Brack extends Node {
	kind: ASTKinds.BTE_Brack;
	typeExpr: TE;
}

export interface BTE_Pow extends Node {
	kind: ASTKinds.BTE_Pow;
	typeExpr: TE;
}

export interface BTE_List extends Node {
	kind: ASTKinds.BTE_List;
	typeExpr: TE;
}

export interface BTE_Name extends Node {
	kind: ASTKinds.BTE_Name;
	typename: string;
}

export type SPE = SPE_Guard | SPE_Assign | SPE_Unicast | SPE_Broadcast | SPE_Groupcast | SPE_Send | SPE_Deliver | SPE_Receive | SPE_Brack | SPE_Call | SPE_Name;
export interface SPE_Guard extends Node {
	kind: ASTKinds.SPE_Guard;
	dataExp: DE;
	nextproc: SPE;
}

export interface SPE_Assign extends Node {
	kind: ASTKinds.SPE_Assign;
	name: string;
	dataExpList: DE[];
	dataExpAssign: DE;
	nextproc: SPE;
}

export interface SPE_Unicast extends Node {
	kind: ASTKinds.SPE_Unicast;
	dataExpL: DE;
    dataExpR: DE;
    proc: SPE;
	nextproc: SPE;
}

export interface SPE_Broadcast extends Node {
	kind: ASTKinds.SPE_Broadcast;
	dataExp: DE;
    proc: SPE;
    procR: SPE
	nextproc: SPE;
}

export interface SPE_Groupcast extends Node {
	kind: ASTKinds.SPE_Groupcast;
	dataExpL: DE;
    dataExpR: DE;
	proc: SPE;
	nextproc: SPE;
}

export interface SPE_Send extends Node {
	kind: ASTKinds.SPE_Send;
	dataExp: DE;
    proc: SPE;
	nextproc: SPE;
}

export interface SPE_Deliver extends Node {
	kind: ASTKinds.SPE_Deliver;
	dataExp: DE;
    proc: SPE;
	nextproc: SPE;
}

export interface SPE_Receive extends Node {
	kind: ASTKinds.SPE_Receive;
	name: string;
	dataExps: DE[];
    proc: SPE;
	nextproc: SPE;
}

export interface SPE_Brack extends Node {
	kind: ASTKinds.SPE_Brack;
	proc: SPE;
}

export interface SPE_Call extends Node {
	kind: ASTKinds.SPE_Call;
	name: string;
	args: DE[];
}

export interface SPE_Name extends Node {
	kind: ASTKinds.SPE_Name;
	name: string;
}

export interface SPE_Choice extends Node {
	kind: ASTKinds.SPE_Choice;
	left: SPE;
	right: SPE;
}

export type DE = DE_Singleton | DE_Partial | DE_Set | DE_Lambda | DE_Forall | DE_Exists | DE_Brack | DE_Name | DE_Function | DE_Tuple | DE_Binary;
export interface DE_Singleton extends Node {
	kind: ASTKinds.DE_Singleton;
	dataExp: DE;
}

export interface DE_Partial extends Node {
	kind: ASTKinds.DE_Partial;
	name: string;
	left: DE;
	right: DE;
}

export interface DE_Set extends Node {
	kind: ASTKinds.DE_Set;
	name: string;
	dataExp: DE;
}

export interface DE_Lambda extends Node {
	kind: ASTKinds.DE_Lambda;
	name: string;
	dataExp: DE;
}

export interface DE_Forall extends Node {
	kind: ASTKinds.DE_Forall;
	name: string;
	dataExp: DE;
}

export interface DE_Exists extends Node {
	kind: ASTKinds.DE_Exists;
	name: string;
	dataExp: DE;
}

export interface DE_Brack extends Node {
	kind: ASTKinds.DE_Brack;
	dataExp: DE;
}

export interface DE_Name extends Node {
	kind: ASTKinds.DE_Name;
	name: string;
}

export interface DE_Function extends Node {
	kind: ASTKinds.DE_Function;
	left: DE;
	right: DE;
}

export interface DE_Tuple extends Node {
	kind: ASTKinds.DE_Tuple;
	dataExps: DE[];
}

export enum binExprs {
	Implicates = "->",
	Iff = "<->",
	And = "&",
	Or = "|",
	Eq = "=",
	Neq = "!=",
	Gtreq = ">=",
	Lsreq = "<=",
	Gtr = ">",
	Les = "<",
}

export interface DE_Binary extends Node {
	kind: ASTKinds.DE_Binary;
	bin: binExprs;
	left: DE;
	right: DE;
}