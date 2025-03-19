import * as ast from "./ast";
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { PosInfo } from './parser';
import * as fs from "fs"
import { removeComments } from './server';
import { ParseResult, parse } from './parser';
import { convertNewToOldAST } from './convertAST';

//I'd rather use the same AST nodes, but everything requires a parent. Use a dummy parent when the parent isn't actually necessary.
const dpar = new ast.AWNRoot();
const dpos = {overallPos: 10000, line: 1000, offset: 0};

var types: ast.Type[] = []
var variables: ast.Variable[] = []
var constants: ast.Constant[] = []
var functions: ast.Function[] = []
var processes: ast.Process[] = []
var aliasesSingle: ast.Alias_Data[] = []
var aliasesList: ast.Alias_List[] = []

//objects which have been declared, but are invalid in some way. (so further references to them aren't marked as errors)
var invalidTypes: string[] = []
var invalidVariables: string[] = []
var invalidConstants: string[] = []
var invalidFunctions: string[] = []
var invalidProcesses: string[] = []
var invalidAliasesSingle: string[] = []
var invalidAliasesList: string[] = []

var errors: Diagnostic[] = []
var warnings: Diagnostic[] = []

//default objects
const boolType = new ast.Type(dpar, "Bool", dpos, dpos); boolType.typeExpr = new ast.TE_RootType(boolType, "Bool")
const dataType = new ast.Type(dpar, "DATA", dpos, dpos); dataType.typeExpr = new ast.TE_RootType(boolType, "DATA")
const msgType = new ast.Type(dpar, "MESSAGE", dpos, dpos); msgType.typeExpr = new ast.TE_RootType(boolType, "MESSAGE")
const ipType = new ast.Type(dpar, "IP", dpos, dpos); ipType.typeExpr = new ast.TE_RootType(boolType, "IP")
const timeType = new ast.Type(dpar, "TIME", dpos, dpos); timeType.typeExpr = new ast.TE_RootType(boolType, "TIME")

const nowVar = new ast.Variable(dpar, "now", dpos, dpos); nowVar.typeExpr = timeType.typeExpr

const trueCon = new ast.Constant(dpar, "true", dpos, dpos); trueCon.typeExpr = boolType.typeExpr
const falseCon = new ast.Constant(dpar, "false", dpos, dpos); trueCon.typeExpr = boolType.typeExpr

const not = new ast.Function_Prefix(dpar, "!", dpos, dpos); not.sigType = new ast.TE_Product(not, [boolType.typeExpr]); not.outType = boolType.typeExpr

const and = new ast.Function_Infix(dpar, "&", dpos, dpos); and.sigType = new ast.TE_Product(and, [boolType.typeExpr, boolType.typeExpr]); and.outType = boolType.typeExpr
const or = new ast.Function_Infix(dpar, "|", dpos, dpos); or.sigType = new ast.TE_Product(or, [boolType.typeExpr, boolType.typeExpr]); or.outType = boolType.typeExpr
const imp = new ast.Function_Infix(dpar, "->", dpos, dpos); imp.sigType = new ast.TE_Product(imp, [boolType.typeExpr, boolType.typeExpr]); imp.outType = boolType.typeExpr
const iff = new ast.Function_Infix(dpar, "<->", dpos, dpos); iff.sigType = new ast.TE_Product(iff, [boolType.typeExpr, boolType.typeExpr]); iff.outType = boolType.typeExpr
const newpkt = new ast.Function_Prefix(dpar, "newpkt", dpos, dpos); newpkt.sigType = new ast.TE_Product(newpkt, [dataType.typeExpr, ipType.typeExpr]); newpkt.outType = msgType.typeExpr

const eq = new ast.Function_Infix(dpar, "=", dpos, dpos); eq.sigType = new ast.TE_Product(eq, [new ast.TE_Any(eq.sigType), new ast.TE_Any(eq.sigType)]); eq.outType = boolType.typeExpr
const neq = new ast.Function_Infix(dpar, "!=", dpos, dpos); neq.sigType = new ast.TE_Product(neq, [new ast.TE_Any(neq.sigType), new ast.TE_Any(neq.sigType)]); neq.outType = boolType.typeExpr
const iselem = new ast.Function_Prefix(dpar, "isElem", dpos, dpos); iselem.sigType = new ast.TE_Product(iselem, [new ast.TE_Any(iselem.sigType), new ast.TE_Pow(iselem.sigType, dpos, new ast.TE_Any(iselem.sigType))]); iselem.outType = boolType.typeExpr

export function Initialise(): void{ //sets up default objects
	types.push(...[boolType, dataType, msgType, ipType, timeType])
	variables.push(nowVar)
	constants.push(...[trueCon, falseCon])
	functions.push(...[not, or, and, imp, iff, newpkt, eq, neq, iselem])
	return
}

export function InitialiseCheck(): void{
	//reset to only default objects
	types = types.slice(0, 5); variables = variables.slice(0, 1); constants = constants.slice(0, 2); functions = functions.slice(0, 9); processes = []; aliasesSingle = []; aliasesList = []; invalidTypes = []; invalidVariables = []; invalidConstants = []; invalidFunctions = []; invalidProcesses = []; invalidAliasesSingle = []; invalidAliasesList = []
	errors = []; warnings = []
}

export function getHoverInformation(word: string): string | null {
	console.log(word)
	const t = getType(word, false, dpos)
	if(t != null){
		return `\`\`\`typescript\n${word}: ${TypeAsString(t)}`
	}
	const v = getVariable(word, false, dpos)
	if(v != null){
		return `\`\`\`typescript\n${word}: ${TypeAsString(v.typeExpr)}`
	}
	const c = getConstant(word, false, dpos)
	if(c != null){
		return `\`\`\`typescript\n${word}: ${TypeAsString(c.typeExpr)}`
	}
	const f = getFunction(word, false, dpos)
	if(f != null){
		return `\`\`\`typescript\n${word}: ${TypeAsString(f.sigType)} -> ${TypeAsString(f.outType)}`
	}
	const p = getProcess(word, false, dpos)
	if(p != null){
		var arglist = ''
		for(const arg of p.args){
			arglist += arg.name + ', '
		}
		return `\`\`\`typescript\n${word}(${arglist})`
	}
	//todo aliases
	return null
}

export function Check(root: ast.AWNRoot, printOutput: boolean): Diagnostic[]{

	for(const Block of root.blocks){
		switch(Block.kind){
			
			case ast.ASTKinds.Block_Include: { const block = Block as ast.Block_Include
				for(const include of block.includes){
					if (!fs.existsSync("./" + include.name)) {
						createErrorMessage(`Could not find "${include.name}".`, include.posS.line, include.posS.offset)
						continue
					}
					var file = fs.readFileSync("./" + include.name, "utf-8")
					file = removeComments(file)
					const parseResult: ParseResult = parse(file)

					if(parseResult.ast == null){
						createErrorMessage(`"${include.name}" could not be syntactically parsed.`, include.posS.line, include.posS.offset)
						continue
					}
					const newast: ast.AWNRoot = convertNewToOldAST(parseResult.ast)
					Check(newast, false) //don't use diagnostics from this, i reckon we don't need to print them out
					errors = []; warnings = []
				}
				break
			}

			case ast.ASTKinds.Block_Type: { const block = Block as ast.Block_Type //this seems to be necessary annoyingly
				for(const typedec of block.types){
					//empty type declarations (those given without an accompanying TE) are given rootType
					if(typedec.typeExpr == null){
						if(["Bool", "DATA", "MESSAGE", "IP", "TIME"].includes(typedec.typeName)){
							createWarningMessage(`"${typedec.typeName}" is a predefined type. This declaration is unnecessary.`, typedec.posS.line, typedec.posS.offset)
						}
						else{
							const newType = new ast.Type(dpar, typedec.typeName, dpos, dpos); newType.typeExpr = new ast.TE_RootType(boolType, typedec.typeName)
							types.push(newType)
						}
						continue
					}
					
					//type declaration with accompanying TE
					if(usedNames().includes(typedec.typeName)){
						createErrorMessage(`Name "${typedec.typeName}" already defined previously.`, typedec.posS.line, typedec.posS.offset)
						continue
					}
					const newTE = expandTypeExpression(typedec.typeExpr, typedec.typeName)
					if(newTE != null){
						typedec.typeExpr = newTE
						types.push(typedec)
					} //note: the above function handles adding to invalidTypes
				}
				break
			}

			case ast.ASTKinds.Block_Variable: { const block = Block as ast.Block_Variable
				for(var vari of block.vars){
					if(usedNames().includes(vari.name)){
						createErrorMessage( `Name "${vari.name}" already defined previously.`, vari.posS.line, vari.posS.offset)
						continue
					}
					const newTE = expandTypeExpression(vari.typeExpr)
					if(newTE != null){
						vari.typeExpr = newTE
						variables.push(vari)
					}else{
						invalidVariables.push(vari.name)
					}
				}
				break
			}

			case ast.ASTKinds.Block_Constant: { const block = Block as ast.Block_Constant
				for(var con of block.consts){
					if(usedNames().includes(con.name)){
						createErrorMessage( `Name "${con.name}" already defined previously.`, con.posS.line, con.posS.offset)
						continue
					}
					const newTE = expandTypeExpression(con.typeExpr)
					if(newTE != null){
						con.typeExpr = newTE
						constants.push(con)
					}else{
						invalidConstants.push(con.name)
					}
				}
				break
			}

			case ast.ASTKinds.Block_Function: { const block = Block as ast.Block_Function
				for(var func of block.funcs){
					//TODO allow functions of the same name with different types
					if(functions.map(x => x.name).concat(invalidFunctions).includes(func.name)){
						createErrorMessage( `Name "${func.name}" already defined as another function.`, func.posS.line, func.posS.offset)
						continue
					}
					const expTE = expandTypeExpression(func.type)
					if(expTE != null){
						if([ast.ASTKinds.TE_FuncFull, ast.ASTKinds.TE_FuncPart].includes(expTE.kind)){
							const sigType = (expTE as ast.TE_Function).sigType
							func.outType = (expTE as ast.TE_Function).outType
							if(sigType != null){
								func.sigType = sigType
								if(func.kind == ast.ASTKinds.Function_Infix && !func.isBinary){
									createErrorMessage(`Infix functions require a binary signature. Instead got ${TypeAsString(func.sigType)}`, func.posS.line, func.posS.offset)
									invalidFunctions.push(func.name); continue
								}
								else{
									functions.push(func)
								}
							}
							else{
								createErrorMessage(`Cannot have a function as the signature of a function.`, func.posS.line, func.posS.offset)
								invalidFunctions.push(func.name); continue
							}							
						}
						else{
							createErrorMessage(`Type of function declaration is not a function. Got type ${TypeAsString(expTE)}`, func.posS.line, func.posS.offset)
							invalidFunctions.push(func.name); continue
						}
					}else{
						invalidFunctions.push(func.name); continue
					}
				}
				break
			}

			case ast.ASTKinds.Block_Alias: { const block = Block as ast.Block_Alias
				for (const alias of block.aliases){
					switch(alias.kind){
						case ast.ASTKinds.Alias_Data: { const Alias = alias as ast.Alias_Data
							if(CheckDataExpression(Alias.dataExp)){
								aliasesSingle.push(Alias)
							}else{
								invalidAliasesSingle.push(Alias.name)
							}
							break
						}

						case ast.ASTKinds.Alias_List: { const Alias = alias as ast.Alias_List
							CheckListAlias(Alias)
							break
						}
					}
				}
				break
			}

			case ast.ASTKinds.Block_Process: { const block = Block as ast.Block_Process
				for (const proc of block.procs){
					if(usedNames().includes(proc.name)){
						createErrorMessage(`Name "${proc.name}" already defined previously.`, proc.posS.line, proc.posS.offset)
						continue
					}
					//TODO expand out list aliases and check for duplicated
					for(const vari of proc.args){
						if(!(variables.map(x=>x.name)).concat(invalidVariables).includes(vari.name) && !(aliasesList.map(x=>x.name)).concat(invalidAliasesList).includes(vari.name) ){
							createErrorMessage(`Invalid variable/list alias "${vari.name}" referenced.`, vari.posS.line, vari.posS.offset)
						}
					}
					if(CheckSPE(proc.proc, proc)){
						processes.push(proc)
					}else{
						invalidProcesses.push(proc.name)
					}
				}
				break
			}
		}
	}
	if(printOutput){
		console.log("Semantic Information:", types, variables, constants, functions, processes, aliasesSingle, aliasesList, invalidTypes, invalidVariables, invalidConstants, invalidFunctions, invalidProcesses, invalidAliasesSingle, invalidAliasesList)
	}
	return warnings.concat(errors)
}

//Given a type name, returns its type definition.
//If the type has been declared but is invalid, returns 1.
//If the type doesn't exist, returns 0.
function getType(typeName: string, produceError: boolean, pos: PosInfo): ast.TE | null{
	for(const type of types){
		if(type.typeName == typeName){
			return type.typeExpr
		}
	}
	for(const type of invalidTypes){
		if(type == typeName){
			return null
		}
	}
	if(produceError){
		createErrorMessage( `Nonexistent type "${typeName}" referenced.`, pos.line, pos.offset)
	}
	return null
}

function getConstant(constantName: string, produceError: boolean, pos: PosInfo): ast.Constant | null{
	for(const con of constants){
		if(con.name == constantName){
			return con
		}
	}
	for(const con of invalidConstants){
		if(con == constantName){
			return null
		}
	}
	if(produceError){
		createErrorMessage( `Nonexistent constant "${constantName}" referenced.`, pos.line, pos.offset)
	}
	return null
}

function getVariable(variableName: string, produceError: boolean, pos: PosInfo): ast.Variable | null{
	for(const vari of variables){
		if(vari.name == variableName){
			return vari
		}
	}
	for(const vari of invalidVariables){
		if(vari == variableName){
			return null
		}
	}
	if(produceError){
		createErrorMessage( `Nonexistent variable "${variableName}" referenced.`, pos.line, pos.offset)
	}
	return null
}

function getFunction(functionName: string, produceError: boolean, pos: PosInfo): ast.Function | null{
	for(const func of functions){
		if(func.name == functionName){
			return func
		}
	}
	for(const func of invalidFunctions){
		if(func == functionName){
			return null
		}
	}
	if(produceError){
		createErrorMessage(`Nonexistent function "${functionName}" referenced.`, pos.line, pos.offset)
	}
	return null
}

function getProcess(procName: string, produceError: boolean, pos: PosInfo): ast.Process | null{
	for(const proc of processes){
		if(proc.name == procName){
			return proc
		}
	}
	for(const proc of invalidProcesses){
		if(proc == procName){
			return null
		}
	}
	if(produceError){
		createErrorMessage(`Nonexistent process "${procName}" referenced.`, pos.line, pos.offset)
	}
	return null
}

function getAliasSingle(aliasName: string, produceError: boolean, pos: PosInfo): ast.Alias_Data | null{
	for(const alias of aliasesSingle){
		if(alias.name == aliasName){
			return alias
		}
	}
	for(const alias of invalidAliasesSingle){
		if(alias == aliasName){
			return null
		}
	}
	if(produceError){
		createErrorMessage( `Nonexistent data alias "${aliasName}" referenced.`, pos.line, pos.offset)
	}
	return null
}

function getAliasList(aliasName: string, produceError: boolean, pos: PosInfo): ast.Alias_List | null{
	for(const alias of aliasesList){
		if(alias.name == aliasName){
			return alias
		}
	}
	for(const alias of invalidAliasesList){
		if(alias == aliasName){
			return null
		}
	}
	if(produceError){
		createErrorMessage( `Nonexistent list alias "${aliasName}" referenced.`, pos.line, pos.offset)
	}
	return null
}

//Expands out a TE by replacing typenames with equivalents.
//If processing Type nodes (those found in a type block), include typeName so we can
//check for circular definitions.
//If any circular or undefined typenames are found, returns null.
function expandTypeExpression(typeExp: ast.TE, typeName?: string): ast.TE | null{
	if(expandTypeExpressionHelper(typeExp, typeName)){
		return typeExp
	}
	else{
		return null
	}
}

//Helper for expandTypeExpression, expands out the given typeExp and returns
//a boolean signifying if any errors occurred.
function expandTypeExpressionHelper(typeExp: ast.TE, typeName?: string): boolean {

	if(typeExp.kind == ast.ASTKinds.TE_RootType) {return true}

	//if a name, set typeExp field to equivalent
	if(typeExp.kind == ast.ASTKinds.TE_Name){ var TypeExp = typeExp as ast.TE_Name
		//ensure no circular definition if we're checking for that
		if(typeName != null){
			if(TypeExp.typename == typeName){
				//circular definition
				invalidTypes.push(typeName)
				createErrorMessage( `"${typeName}" contains a circular type definition.`, TypeExp.posS.line, TypeExp.posS.offset)
				return false
			}
		}

		const result = getType(TypeExp.typename, true, TypeExp.posS) //retrieve the equivalent
		if(result == null){
			//nonexistent type referenced
			if(typeName != null){invalidTypes.push(typeName)}
			return false
		}
		else{
			//if the replacement was not root, also expand out the replacement
			if(result.kind != ast.ASTKinds.TE_RootType){
				TypeExp.typeExpr = result
				return expandTypeExpressionHelper(result, typeName)
			}
			else{
				TypeExp.typeExpr = result
				return true
			}
		}
	}

	else{ //move on to children if not typename or type_root
		var failure = false
		for(var childTE of getTypeExpChildren(typeExp)){
			const childResult = expandTypeExpressionHelper(childTE, typeName)
			if(childResult == false){
				failure = true
			}
		}
		if(failure){ //we check for failure afterwards rather than returning immediately so that this function can possibly find other errors further down the tree.
			return false
		}else{
			return true
		}
	}
}

//Checks an SPE - more accurately, a sequence of SPEs - as this includes any other SPEs attached to it.
function CheckSPE(proc: ast.SPE, curProcIn: ast.Process): boolean{
	switch(proc.kind){

		case ast.ASTKinds.SPE_Guard: { const Proc = (proc as ast.SPE_Guard)
			if(!CheckDEFull(Proc.dataExp)){CheckSPE(Proc.nextproc, curProcIn); return false}
			const DEType = Proc.dataExp.type
			//guard DE must be bool
			if(!(AreIdenticalTypes(DEType, boolType.typeExpr))){
				createErrorMessage(`Guard requires type "Bool" but got "${TypeAsString(DEType)}" instead.`, Proc.DEStart.line, Proc.DEStart.offset, Proc.DEEnd.line, Proc.DEEnd.offset)
				CheckSPE(Proc.nextproc, curProcIn); return false
			}
			return CheckSPE(Proc.nextproc, curProcIn)
		}

		case ast.ASTKinds.SPE_Assign: { const Proc = (proc as ast.SPE_Assign)
			const v = getVariable(Proc.name, true, Proc.nameStart)
			if(v == null){CheckSPE(Proc.nextproc, curProcIn); return false}
			else{
				Proc.variable = (v as ast.Variable)
			}
			if(!CheckDEFull(Proc.dataExpAssign)){ CheckSPE(Proc.nextproc, curProcIn); return false}
			if(!AreIdenticalTypes(Proc.variable.typeExpr, Proc.dataExpAssign.type)){
				createErrorMessage(`Data expression and variable must have the same type. DE has type "${TypeAsString(Proc.dataExpAssign.type)}", var has type "${TypeAsString(Proc.variable.typeExpr)}"`, Proc.nameStart.line, Proc.nameStart.offset, Proc.end.line, Proc.end.offset)
				CheckSPE(Proc.nextproc, curProcIn); return false
			}
			return CheckSPE(Proc.nextproc, curProcIn)
		}

		case ast.ASTKinds.SPE_Unicast: { const Proc = (proc as ast.SPE_Unicast)
			if(!CheckDEFull(Proc.dataExpL)){CheckSPE(Proc.procA, curProcIn); CheckSPE(Proc.procB, curProcIn); return false}
			if(!CheckDEFull(Proc.dataExpR)){CheckSPE(Proc.procA, curProcIn); CheckSPE(Proc.procB, curProcIn); return false}
			const DELType = Proc.dataExpL.type; const DERType = Proc.dataExpR.type

			if(!AreIdenticalTypes(DELType, ipType.typeExpr)){
				createErrorMessage(`Expected type "IP" but got "${TypeAsString(DELType)}" instead.`, Proc.DELstart.line, Proc.DELstart.offset, Proc.DELend.line, Proc.DELend.offset)
				CheckSPE(Proc.procA, curProcIn); CheckSPE(Proc.procB, curProcIn); return false
			}
			if(!AreIdenticalTypes(DERType, msgType.typeExpr)){
				createErrorMessage(`Expected type "MSG" but got "${TypeAsString(DERType)}" instead.`, Proc.DELend.line, Proc.DELend.offset+2, Proc.DERend.line, Proc.DERend.offset)
				CheckSPE(Proc.procA, curProcIn); CheckSPE(Proc.procB, curProcIn); return false
			}
			return CheckSPE(Proc.procA, curProcIn) && CheckSPE(Proc.procB, curProcIn)
		}

		case ast.ASTKinds.SPE_Groupcast: { const Proc = (proc as ast.SPE_Groupcast)
			if(!CheckDEFull(Proc.dataExpL)){CheckSPE(Proc.nextproc, curProcIn); return false}
			if(!CheckDEFull(Proc.dataExpR)){CheckSPE(Proc.nextproc, curProcIn); return false}
			const DELType = Proc.dataExpL.type; const DERType = Proc.dataExpR.type
			const powIPType = new ast.TE_Pow(dpar, dpos, ipType.typeExpr)

			if(!AreIdenticalTypes(DELType, powIPType)){
				createErrorMessage(`Expected type "Pow(IP)" but got "${TypeAsString(DELType)}" instead.`, Proc.DELstart.line, Proc.DELstart.offset, Proc.DELend.line, Proc.DELend.offset)
				CheckSPE(Proc.nextproc, curProcIn); return false
			}
			if(!AreIdenticalTypes(DERType, msgType.typeExpr)){	
				createErrorMessage(`Expected type "MSG" but got "${TypeAsString(DERType)}" instead.`, Proc.DELend.line, Proc.DELend.offset+2, Proc.DERend.line, Proc.DERend.offset)
				CheckSPE(Proc.nextproc, curProcIn); return false
			}
			return CheckSPE(Proc.nextproc, curProcIn)
		}

		case ast.ASTKinds.SPE_Broadcast: { const Proc = (proc as ast.SPE_Broadcast)
			if(!CheckDEFull(Proc.dataExp)){CheckSPE(Proc.nextproc, curProcIn); return false}
			const DEType = Proc.dataExp.type

			if(!AreIdenticalTypes(DEType, msgType.typeExpr)){
				createErrorMessage(`Expected type "MSG" but got "${TypeAsString(DEType)}" instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset)
				CheckSPE(Proc.nextproc, curProcIn); return false
			}
			return CheckSPE(Proc.nextproc, curProcIn)
		}

		case ast.ASTKinds.SPE_Send: { const Proc = (proc as ast.SPE_Send)
			if(!CheckDEFull(Proc.dataExp)){CheckSPE(Proc.nextproc, curProcIn); return false}
			const DEType = Proc.dataExp.type

			if(!AreIdenticalTypes(DEType, msgType.typeExpr)){
				createErrorMessage(`Expected type "MSG" but got "${TypeAsString(DEType)}" instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset)
				CheckSPE(Proc.nextproc, curProcIn); return false
			}
			return CheckSPE(Proc.nextproc, curProcIn)
		}

		case ast.ASTKinds.SPE_Deliver: { const Proc = (proc as ast.SPE_Deliver)
			if(!CheckDEFull(Proc.dataExp)){CheckSPE(Proc.nextproc, curProcIn); return false}
			const DEType = Proc.dataExp.type

			if(!AreIdenticalTypes(DEType, dataType.typeExpr)){
				createErrorMessage(`Expected type "DATA" but got "${TypeAsString(DEType)}" instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset)
				CheckSPE(Proc.nextproc, curProcIn); return false
			}
			return CheckSPE(Proc.nextproc, curProcIn)
		}

		case ast.ASTKinds.SPE_Receive: { const Proc = (proc as ast.SPE_Receive)
			const v = getVariable(Proc.name, true, Proc.namePos)
			if(v == null){CheckSPE(Proc.nextproc, curProcIn); return false}
			else{
				Proc.variable = (v as ast.Variable)
			}
			const varitype = Proc.variable.typeExpr

			if(!AreIdenticalTypes(varitype, msgType.typeExpr)){
				createErrorMessage(`Expected type "MSG" but got "${TypeAsString(varitype)}" instead.`, Proc.namePos.line, Proc.namePos.offset, Proc.nameEnd.line, Proc.nameEnd.offset)
				CheckSPE(Proc.nextproc, curProcIn); return false
			}
			return CheckSPE(Proc.nextproc, curProcIn)
		}

		case ast.ASTKinds.SPE_Choice: { const Proc = (proc as ast.SPE_Choice)
			var l = CheckSPE(Proc.left, curProcIn)
			var r = CheckSPE(Proc.right, curProcIn)
			return l && r
		}

		case ast.ASTKinds.SPE_Call: { const Proc = (proc as ast.SPE_Call)
			var success = true
			if(Proc.name == curProcIn.name){
				Proc.proc = curProcIn
			}else{
				var p = getProcess(Proc.name, true, Proc.posS)
				if(p != null){
					Proc.proc = p
				}else{
					success = false
				}
			}
			
			for(var arg of Proc.args){
				if (!CheckDEFull(arg)){success = false}
			}

			return success
		}
		case ast.ASTKinds.SPE_Name: {const Proc = (proc as ast.SPE_Name)
			if(Proc.name == curProcIn.name){
				Proc.proc = curProcIn
			}else{
				var p = getProcess(Proc.name, true, Proc.posS)
				if(p != null){
					Proc.proc = p
				}else{
					return false
				}
			}

			return true
		}

		default: return false
	}
}

//Expands out then checks a DE
function CheckDEFull(de: ast.DE): boolean {
	var d = expandDataExpression(de)
	if(d == null){
		return false
	}else{
		de = d
	}
	if(CheckDataExpression(de) == false){return false}
	return true
}


//Copy of expandTypeExpression but for data expressions.
//Expands out a DE by replacing aliases with equivalents.
//If processing data alias blocks, include the alias name so we can
//check for circular definitions.
//If any circular or undefined typenames are found, returns null.
function expandDataExpression(dataExp: ast.DE, aliasName?: string): ast.DE | null{
	if(expandDataExpressionHelper(dataExp, aliasName)){
		return dataExp
	}
	else{
		return null
	}
}

//Expands out a dataExp recursively and returns false if there were any errors in doing so.
function expandDataExpressionHelper(dataExp: ast.DE, aliasName?: string): boolean {

	//only require (possible) expanding on names - if the name refers to a data alias
	if(dataExp.kind == ast.ASTKinds.DE_Name){
		//ensure no circular definition if we're checking for that
		if(aliasName != null){
			if((dataExp as ast.DE_Name).name == aliasName){
				//circular definition
				invalidAliasesSingle.push(aliasName)
				createErrorMessage( `"${dataExp}" contains a circular alias definition.`, (dataExp as ast.DE_Name).posS.line, (dataExp as ast.DE_Name).posS.offset)
				return false
			}
		}

		const result = getAliasSingle((dataExp as ast.DE_Name).name, false, dpos) //retrieve the equivalent
		if(result == null){
			//do nothing, the name could refer to something else.
			return true
		}
		else{
			//valid expansion returned; replace the dataExp with it
			dataExp = result.dataExp
			if(dataExp.kind != ast.ASTKinds.DE_Name){ //if the replacement was not just another DE_Name, keep going
				return expandDataExpressionHelper(dataExp, aliasName)
			}else{
				return true
			}
		}
	}
	else{ //move on to children if not DE_Name
		var failure = false
		for(var childDE of getDataExpChildren(dataExp)){
			const childResult = expandDataExpressionHelper(childDE, aliasName)
			if(childResult == false){
				failure = true
			}
		}
		if(failure){ //we check for failure afterwards rather than returning immediately so that this function can possibly find other errors further down the tree.
			return false
		}else{
			return true
		}
	}
}

//Evaluates and checks the data expression from the bottom up.
//Also sets the type of the data expression.
//Assumes that all data aliases have already been expanded out.
function CheckDataExpression(de: ast.DE): boolean{
	switch(de.kind){
		
		case ast.ASTKinds.DE_Singleton: { const DE = (de as ast.DE_Singleton)
			// {DE}
			if(CheckDataExpression(DE.dataExp) == false){return false}
			DE.type = new ast.TE_Pow(dpar, dpos, DE.dataExp.type)
			return true
		}

		case ast.ASTKinds.DE_Set: { const DE = (de as ast.DE_Set)
			// {Name | DE}
			if(CheckDataExpression(DE.dataExp) == false){return false}
			const v = getVariable(DE.name, true, DE.posS)
			if(v == null){return false}
			if(!AreIdenticalTypes(DE.dataExp.type, boolType.typeExpr)){
				createErrorMessage( `Expected type "Bool" but got "${TypeAsString(DE.dataExp.type)}".`, DE.posS.line, DE.posS.offset)
				return false
			}
			DE.type = new ast.TE_Pow(DE, v.posS, v.typeExpr)
			return true
		}

		case ast.ASTKinds.DE_Partial: { const DE = (de as ast.DE_Partial)
			// {(Name, DE), DE}
			if(CheckDataExpression(DE.left) == false || CheckDataExpression(DE.right) == false){return false}
			const v = getVariable(DE.name, true, DE.posS)
			if(v == null){return false}
			if(!AreIdenticalTypes(DE.right.type, boolType.typeExpr)){
				createErrorMessage( `Expected type "Bool" but got "${TypeAsString(DE.right.type)}".`, DE.posS.line, DE.posS.offset)
				return false
			}
			DE.type = new ast.TE_FuncPart(DE, v.typeExpr, DE.left.type)
			return false
		}

		case ast.ASTKinds.DE_Lambda: {const DE = (de as ast.DE_Lambda)
			// lambda Name . DE
			var success = true
			if(CheckDataExpression(DE.dataExp) == false){success = false}

			const v = getVariable(DE.name, true, DE.namePos)
			if(v == null){
				success = false
			}else{
				DE.variable = v
			}
			if(!success){return false}

			DE.type = new ast.TE_FuncFull(DE, DE.variable.typeExpr, DE.dataExp.type)
			return true
		}

		case ast.ASTKinds.DE_Forall: {const DE = (de as ast.DE_Forall)
			// forall Name . DE
			var success = true
			if(CheckDataExpression(DE.dataExp) == false){success = false}

			const v = getVariable(DE.name, true, DE.namePos)
			if(v == null){
				success = false
			}else{
				DE.variable = v
			}
			if(!success){return false}

			if(!AreIdenticalTypes(DE.dataExp.type, boolType.typeExpr)){
				createErrorMessage( `Expected type "Bool" but got "${TypeAsString(DE.dataExp.type)}".`, DE.namePos.line, DE.namePos.offset)
				return false
			}

			DE.type = new ast.TE_Name(DE, "Bool", (DE.dataExp.type as ast.TE_Name).posS, (DE.dataExp.type as ast.TE_Name).posE)
			var t = (DE.type as ast.TE_Name); t.typeExpr = boolType.typeExpr
			return true
		}

		case ast.ASTKinds.DE_Exists: {const DE = (de as ast.DE_Exists)
			// exists Name . DE
			success = true
			if(CheckDataExpression(DE.dataExp) == false){success = false}

			const v = getVariable(DE.name, true, DE.namePos)
			if(v == null){
				success = false
			}else{
				DE.variable = v
			}
			if(!success){return false}

			if(!AreIdenticalTypes(DE.dataExp.type, boolType.typeExpr)){
				createErrorMessage( `Expected type "Bool" but got "${TypeAsString(DE.dataExp.type)}".`, DE.namePos.line, DE.namePos.offset)
				return false
			}

			DE.type = new ast.TE_Name(DE, "Bool", (DE.dataExp.type as ast.TE_Name).posS, (DE.dataExp.type as ast.TE_Name).posE)
			var t = (DE.type as ast.TE_Name); t.typeExpr = boolType.typeExpr
			return true
		}

		case ast.ASTKinds.DE_Brack: {const DE = (de as ast.DE_Brack)
			if(CheckDataExpression(DE.dataExp) == false){return false}
			DE.type = DE.dataExp.type
			return true
		}

		case ast.ASTKinds.DE_Name: {const DE = (de as ast.DE_Name)
			//all this does is set the type and what it refers to, which is all is needed
			const c = getConstant(DE.name, false, DE.posS)
			if(c != null){
				DE.type = c.typeExpr
				DE.refersTo = ast.ASTKinds.Constant
				return true
			}
			const v = getVariable(DE.name, false, DE.posS)
			if(v != null){
				DE.type = v.typeExpr
				DE.refersTo = ast.ASTKinds.Variable
				return true
			}
			const f = getFunction(DE.name, false, DE.posS)
			if(f != null){
				DE.type = f.type
				DE.refersTo = ast.ASTKinds.Function_Prefix
				return true
			}
			const asi = getAliasSingle(DE.name, false, DE.posS)
			if(asi != null){
				DE.type = asi.dataExp.type
				DE.refersTo = ast.ASTKinds.Alias_Data
				return true
			}
			const ali = getAliasList(DE.name, false, DE.posS)
			if(ali != null){
				DE.refersTo = ast.ASTKinds.Alias_List
				return true
			}
			
			createErrorMessage(`Nonexistent identifier "${DE.name}" referenced.`, DE.posS.line, DE.posS.offset)
			return false
		}
		
		case ast.ASTKinds.DE_Function: {const DE = (de as ast.DE_Function_Prefix)
			// Name(DE)
			success = true
			//make sure name refers to a function
			const f = getFunction(DE.name, true, DE.sigStart)
			if(f != null){
				DE.function = f
			}else{
				createErrorMessage(`Function "${DE.name}" not found`, DE.sigStart.line, DE.sigStart.offset)
				success = false
			}

			//if the arguments aren't a DE_tuple, make it a DE_tuple with one element
			if(CheckDataExpression(DE.dataExp) == false){
				success = false
			}else{
				if(DE.dataExp.kind == ast.ASTKinds.DE_Tuple){
					DE.arguments = DE.dataExp as ast.DE_Tuple
				}
				else{
					var tuple = new ast.DE_Tuple(DE)
					tuple.dataExps = [DE.dataExp]
					DE.arguments = tuple
	
					var argtype = new ast.TE_Product(DE)
					argtype.children = [DE.dataExp.type]
					DE.arguments.type = argtype
				}
			}
			if(!success){return false}			

			//check that arguments match signature
			if(!AreIdenticalTypes(DE.function.sigType, DE.arguments.type)){
				createErrorMessage(`Function ${DE.name}'s signature has type "${TypeAsString(DE.function.sigType)}" while its arguments have type "${TypeAsString(DE.arguments.type)}".`, DE.sigStart.line, DE.sigStart.offset)
				return false
			}
			DE.type = DE.function.outType
			return true
		}

		case ast.ASTKinds.DE_Infix: {const DE = (de as ast.DE_Function_Infix)
			//DE Infix DE
			var l = CheckDataExpression(DE.left)
			var r = CheckDataExpression(DE.right)
			if(!(l && r)){return false}

			//retrieve function
			const f = getFunction(DE.function.name, true, DE.sigStart)
			if(f != null){
				DE.function = f
			}else{
				createErrorMessage(`Function "${DE.function.name}" not found`, DE.sigStart.line, DE.sigStart.offset)
				return false
			}
			//TODO improvement because i should probably separate function_infix from function_prefix arrays so this can't happen
			if(DE.function.kind != ast.ASTKinds.Function_Infix){
				createErrorMessage(`Retrieved function not infix (TODO improvement honestly)`, DE.sigStart.line, DE.sigStart.offset)
				return false
			}

			//ensure function signature matches
			DE.function = DE.function as ast.Function_Infix
			if(!AreIdenticalTypes(DE.function.sigType.children[0], DE.left.type) || !AreIdenticalTypes(DE.function.sigType.children[1], DE.right.type)){
				createErrorMessage(`Function "${DE.function.name}" requires type ${TypeAsString(DE.function.sigType)}, got ${TypeAsString(DE.left.type)} x ${TypeAsString(DE.right.type)}`, DE.sigStart.line, DE.sigStart.offset)
				return false
			}

			//for special predefined ones (=, !=, isElem), make sure arguments match each other in the right way
			if(DE.function.name == "=" || DE.function.name == "!="){
				if(!AreIdenticalTypes(DE.left.type, DE.right.type)){
					createErrorMessage(`"${DE.function.name}" requires that left and right types are identical. Got ${TypeAsString(DE.left.type)} x ${TypeAsString(DE.right.type)}`, DE.sigStart.line, DE.sigStart.offset)
					return false
				}
			}
			if(DE.function.name == "isElem"){
				const powofleft = new ast.TE_Pow(dpar, dpos, DE.left.type)
				if(!AreIdenticalTypes(powofleft, DE.right.type)){
					createErrorMessage(`"${DE.function.name}" requires a type signature of style T x Pow(T). Got ${TypeAsString(DE.left.type)} x ${TypeAsString(DE.right.type)}`, DE.sigStart.line, DE.sigStart.offset)
					return false
				}
			}

			DE.type = f.outType
			return true
		}

		case ast.ASTKinds.DE_Tuple: { const DE = (de as ast.DE_Tuple)
			var success = true
			var childtypes: ast.TE[] = []
			for(const child of DE.dataExps){
				if(CheckDataExpression(child)){
					childtypes.push(child.type)
				}else{
					success = false
				}
			}
			if(success){
				DE.type = new ast.TE_Product(DE, childtypes)
				return true
			}
			return false
		}
	}
	return false
}

function CheckListAlias(alias: ast.Alias_List): boolean{
	var success = true
	var argsSoFar: string[] = []; var i = 0
	for(const vari of alias.argNames){
		if(argsSoFar.includes(vari)){
			createErrorMessage(`"${vari}" is duplicated in this list alias.`, alias.argsPosS[i].line, alias.argsPosS[i].offset)
			success = false;
			i++; continue;
		}
		argsSoFar.push(vari)
		var v = getVariable(vari, true, alias.argsPosS[i])
		if(v == null){success = false; i++; continue}
		alias.args.push(v); i++
	}
	if(success){
		aliasesList.push(alias); return true
	}else{
		invalidAliasesList.push(alias.name); return false
	}
}

function getTypeExpChildren(typeExp: ast.TE): ast.TE[]{
	switch(typeExp.kind){
		case ast.ASTKinds.TE_RootType: return []
		case ast.ASTKinds.TE_Name: return [(typeExp as ast.TE_Name).typeExpr]
		case ast.ASTKinds.TE_Brack: return [(typeExp as ast.TE_Brack).typeExpr]
		case ast.ASTKinds.TE_Pow: return [(typeExp as ast.TE_Pow).typeExpr]
		case ast.ASTKinds.TE_Array: return [(typeExp as ast.TE_Array).typeExpr]
		case ast.ASTKinds.TE_FuncFull: return [(typeExp as ast.TE_FuncFull).left, (typeExp as ast.TE_FuncFull).right]
		case ast.ASTKinds.TE_FuncPart: return [(typeExp as ast.TE_FuncPart).left, (typeExp as ast.TE_FuncPart).right]
		case ast.ASTKinds.TE_Product: return (typeExp as ast.TE_Product).children
		default: return []
	}
}

function getDataExpChildren(dataExp: ast.DE): ast.DE[]{
	switch(dataExp.kind){
		case ast.ASTKinds.DE_Brack: return [(dataExp as ast.DE_Brack).dataExp]
		case ast.ASTKinds.DE_Exists: return [(dataExp as ast.DE_Exists).dataExp]
		case ast.ASTKinds.DE_Forall: return [(dataExp as ast.DE_Forall).dataExp]
		case ast.ASTKinds.DE_Lambda: return [(dataExp as ast.DE_Lambda).dataExp]
		case ast.ASTKinds.DE_Singleton: return [(dataExp as ast.DE_Singleton).dataExp]
		case ast.ASTKinds.DE_Set: return [(dataExp as ast.DE_Set).dataExp]
		case ast.ASTKinds.DE_Partial: return [(dataExp as ast.DE_Partial).left, (dataExp as ast.DE_Partial).right]
		case ast.ASTKinds.DE_Name: return []
		case ast.ASTKinds.DE_Tuple: return (dataExp as ast.DE_Tuple).dataExps
		case ast.ASTKinds.DE_Function: return [(dataExp as ast.DE_Function_Prefix).dataExp]
		case ast.ASTKinds.DE_Infix: return [(dataExp as ast.DE_Function_Infix).left, (dataExp as ast.DE_Function_Infix).right]
		default: return []
	}
}

//Note that this function takes TEs and not Types
function AreIdenticalTypes(type1: ast.TE, type2: ast.TE): boolean{
	if(type1 == null || type2 == null){console.log("AreIdenticalTypes encountered a null type"); return false}

	if(type1.kind == ast.ASTKinds.TE_Any || type2.kind == ast.ASTKinds.TE_Any){return true}

	//firstly, replace names with expansions
	if(type1.kind == ast.ASTKinds.TE_Name){
		return AreIdenticalTypes((type1 as ast.TE_Name).typeExpr, type2)
	}
	if(type2.kind == ast.ASTKinds.TE_Name){
		return AreIdenticalTypes(type1, (type2 as ast.TE_Name).typeExpr)
	}

	if(type1.kind != type2.kind){
		return false
	}

	if(type1.kind == ast.ASTKinds.TE_RootType){
		return (type1 as ast.TE_RootType).typename == (type2 as ast.TE_RootType).typename
	}

	var areIdentical = true
	const type1children = getTypeExpChildren(type1); const type2children = getTypeExpChildren(type2)
	if(type1children.length != type2children.length){return false}
	for (let i = 0; i < type1children.length; i++) {
		if(!AreIdenticalTypes(type1children[i], type2children[i])){
			areIdentical = false
		}
	}
	return areIdentical
}

//Prints out a TE as a well-formatted string, useful for error messages.
function TypeAsString(type: ast.TE): string{
	if(type == null){ return "null"}
	switch(type.kind){
		case ast.ASTKinds.TE_Name: { const Type = type as ast.TE_Name
			return Type.typename
		}

		case ast.ASTKinds.TE_Array: { const Type = type as ast.TE_Array
			return "[" + TypeAsString(Type.typeExpr) + "]"
		}

		case ast.ASTKinds.TE_Brack: { const Type = type as ast.TE_Brack
			return "(" + TypeAsString(Type.typeExpr) + ")"
		}

		case ast.ASTKinds.TE_FuncFull: { const Type = type as ast.TE_FuncFull
			return TypeAsString(Type.left) + "->" + TypeAsString(Type.right)
		}

		case ast.ASTKinds.TE_FuncPart: { const Type = type as ast.TE_FuncPart
			return TypeAsString(Type.left) + "+->" + TypeAsString(Type.right)
		}

		case ast.ASTKinds.TE_Pow: { const Type = type as ast.TE_Pow
			return "Pow(" + TypeAsString(Type.typeExpr) + ")"
		}

		case ast.ASTKinds.TE_Product: { const Type = type as ast.TE_Product
			var out = TypeAsString(Type.children[0])
			for(let i = 1; i < Type.children.length; i++){
				out = out.concat(" x ").concat(TypeAsString(Type.children[i]))
			}
			return out
		}

		case ast.ASTKinds.TE_RootType: { const Type = type as ast.TE_RootType
			return Type.typename
		}

		case ast.ASTKinds.TE_Any: {const Type = type as ast.TE_Any
			return "Any"
		}

		default: return ""
	}
}

//TODO consider innocent overloading
function usedNames(): string[]{
	return types.map(x=>x.typeName).concat(invalidTypes)
	.concat(variables.map(x=>x.name)).concat(invalidVariables)
	.concat(constants.map(x=>x.name)).concat(invalidConstants)
	.concat(functions.map(x=>x.name)).concat(invalidFunctions)
	.concat(processes.map(x=>x.name)).concat(invalidProcesses)
	.concat(aliasesSingle.map(x=>x.name)).concat(invalidAliasesSingle)
	.concat(aliasesList.map(x=>x.name)).concat(invalidAliasesList)
}

export function createErrorMessage(message: string, line: number, char: number, lineE?: number, charE?: number): void{
	errors.push({
		severity: DiagnosticSeverity.Error,
		range: {
			start: {line: line-1, character: char},
			end: {line: lineE == null? line-1 : lineE-1, character: charE == null? char : charE}
		},
		message: message
	});
}

export function createWarningMessage(message: string, line: number, char: number, lineE?: number, charE?: number): void{
	warnings.push({
		severity: DiagnosticSeverity.Warning,
		range: {
			start: {line: line-1, character: char},
			end: {line: lineE == null? line-1 : lineE-1, character: charE == null? char : charE}
		},
		message: message
	});
}