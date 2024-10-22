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

export interface AWNRoot {
    kind: ASTKinds.AWNRoot;
    blocks: Block[];
}

export type Block = Block_Include | Block_Type | Block_ConVar | Block_Function | Block_Process
export interface Block_Include {
    kind: ASTKinds.Block_Include;
    include: [Include, ...Include[]];
}

export interface Block_Type {
    kind: ASTKinds.Block_Type;
    type: [Type, ...Type[]];
}

export interface Block_ConVar {
    kind: ASTKinds.Block_ConVar;
    var: [ConVar, ...ConVar[]];
}

export interface Block_Function {
    kind: ASTKinds.Block_Function;
    func: [Function, ...Function[]];
}

export interface Block_Process {
    kind: ASTKinds.Block_Process;
    proc: [Process, ...Process[]];
}

export interface Include {
    kind: ASTKinds.Include;
    name: string;
}

export interface Type {
    kind: ASTKinds.Type;
    typeName: string;
    typeExpr: TE;
}

export interface ConVar {
    kind: ASTKinds.ConVar;
    typeExpr: TE;
    names: [string, ... string[]];
}

export type Function = Function_Generic | Function_Infix
export interface Function_Generic {
    kind: ASTKinds.Function_Generic;
    name: string;
    signature: TE;
}

export interface Function_Infix {
    kind: ASTKinds.Function_Infix;
    name: string;
    signature: BTE;
}

export interface Process {
    kind: ASTKinds.Process;
    name: string;
	args: string[];
    proc: SPE;
}

export type TE = TE_Brack | TE_Pow | TE_List | TE_Name | TE_Function | TE_Partial | TE_Product
export interface TE_Brack {
	kind: ASTKinds.TE_Brack;
	typeExpr: TE;
}

export interface TE_Pow {
	kind: ASTKinds.TE_Pow;
	typeExpr: TE;
}

export interface TE_List {
	kind: ASTKinds.TE_List;
	typeExpr: TE;
}

export interface TE_Name {
	kind: ASTKinds.TE_Name;
	typename: string;
}

export interface TE_Function {
	kind: ASTKinds.TE_Function;
	left: TE;
	right: TE;
}

export interface TE_Partial {
	kind: ASTKinds.TE_Partial;
	left: TE;
	right: TE;
}

export interface TE_Product {
	kind: ASTKinds.TE_Product;
	left: TE;
	right: TE;
}

export type BTE = BTE_Function | BTE_Partial
export interface BTE_Function {
    kind: ASTKinds.BTE_Function;
    left: BTE_AUX;
    right: BTE_AUX;
    typeExpr: TE;
}
export interface BTE_Partial {
    kind: ASTKinds.BTE_Partial;
    left: BTE_AUX;
    right: BTE_AUX;
    typeExpr: TE;
}

export type BTE_AUX = BTE_Brack | BTE_Pow | BTE_List | BTE_Name
export interface BTE_Brack {
	kind: ASTKinds.BTE_Brack;
	typeExpr: TE;
}

export interface BTE_Pow {
	kind: ASTKinds.BTE_Pow;
	typeExpr: TE;
}

export interface BTE_List {
	kind: ASTKinds.BTE_List;
	typeExpr: TE;
}

export interface BTE_Name {
	kind: ASTKinds.BTE_Name;
	typename: string;
}

export type SPE = SPE_Guard | SPE_Assign | SPE_Unicast | SPE_Broadcast | SPE_Groupcast | SPE_Send | SPE_Deliver | SPE_Receive | SPE_Brack | SPE_Call | SPE_Name;
export interface SPE_Guard {
	kind: ASTKinds.SPE_Guard;
	dataExp: DE;
	nextproc: SPE;
}

export interface SPE_Assign {
	kind: ASTKinds.SPE_Assign;
	name: string;
	dataExpList: DE[];
	dataExpAssign: DE;
	nextproc: SPE;
}

export interface SPE_Unicast {
	kind: ASTKinds.SPE_Unicast;
	dataExpL: DE;
    dataExpR: DE;
    proc: SPE;
	nextproc: SPE;
}

export interface SPE_Broadcast {
	kind: ASTKinds.SPE_Broadcast;
	dataExp: DE;
    proc: SPE;
    procR: SPE
	nextproc: SPE;
}

export interface SPE_Groupcast {
	kind: ASTKinds.SPE_Groupcast;
	dataExpL: DE;
    dataExpR: DE;
	proc: SPE;
	nextproc: SPE;
}

export interface SPE_Send {
	kind: ASTKinds.SPE_Send;
	dataExp: DE;
    proc: SPE;
	nextproc: SPE;
}

export interface SPE_Deliver {
	kind: ASTKinds.SPE_Deliver;
	dataExp: DE;
    proc: SPE;
	nextproc: SPE;
}

export interface SPE_Receive {
	kind: ASTKinds.SPE_Receive;
	name: string;
	dataExps: DE[];
    proc: SPE;
	nextproc: SPE;
}

export interface SPE_Brack {
	kind: ASTKinds.SPE_Brack;
	proc: SPE;
}

export interface SPE_Call {
	kind: ASTKinds.SPE_Call;
	name: string;
	args: DE[];
}

export interface SPE_Name {
	kind: ASTKinds.SPE_Name;
	name: string;
}

export interface SPE_Choice {
	kind: ASTKinds.SPE_Choice;
	left: SPE;
	right: SPE;
}

export type DE = DE_Singleton | DE_Partial | DE_Set | DE_Lambda | DE_Forall | DE_Exists | DE_Brack | DE_Name | DE_Function | DE_Tuple | DE_Binary;
export interface DE_Singleton {
	kind: ASTKinds.DE_Singleton;
	dataExp: DE;
}

export interface DE_Partial {
	kind: ASTKinds.DE_Partial;
	name: string;
	left: DE;
	right: DE;
}

export interface DE_Set {
	kind: ASTKinds.DE_Set;
	name: string;
	dataExp: DE;
}

export interface DE_Lambda {
	kind: ASTKinds.DE_Lambda;
	name: string;
	dataExp: DE;
}

export interface DE_Forall {
	kind: ASTKinds.DE_Forall;
	name: string;
	dataExp: DE;
}

export interface DE_Exists {
	kind: ASTKinds.DE_Exists;
	name: string;
	dataExp: DE;
}

export interface DE_Brack {
	kind: ASTKinds.DE_Brack;
	dataExp: DE;
}

export interface DE_Name {
	kind: ASTKinds.DE_Name;
	name: string;
}

export interface DE_Function {
	kind: ASTKinds.DE_Function;
	left: DE;
	right: DE;
}

export interface DE_Tuple {
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

export interface DE_Binary {
	kind: ASTKinds.DE_Binary;
	bin: binExprs;
	left: DE;
	right: DE;
}