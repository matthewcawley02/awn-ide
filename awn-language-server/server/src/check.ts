import * as ast from "./ast";
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { PosInfo } from './parser';

var dummyParent: ast.Node //I'd rather use the same AST nodes, but everything requires a parent. Use a dummy parent when the parent isn't actually necessary.
const dummyPos = {
    overallPos: 0,
    line: 0,
    offset: 0
};

var types: ast.Type[] = []
var variables: ast.Variable[] = []
var constants: ast.Constant[] = []
var functions: ast.Function[] = []
var processes: ast.Process[] = []
var aliases: ast.Alias[] = []

//objects which have been declared, but are invalid in some way. (so further references to them aren't marked as errors)
var invalidTypes: string[] = []
var invalidVariables: string[] = []
var invalidConstants: string[] = []
var invalidFunctions: string[] = []
var invalidProcesses: string[] = []
var invalidAliases: string[] = []

var errors: Diagnostic[] = []

export function InitialiseCheck(): void{ //sets up default objects
	
	return
}

export function Check(root: ast.AWNRoot): Diagnostic[]{
	errors = []
	dummyParent = root
	//set up default objects (move to initialise later)
	types = []; variables = []; constants = []; functions = []; processes = []; aliases = []; invalidTypes = []; invalidVariables = []; invalidConstants = []; invalidFunctions = []; invalidProcesses = []; invalidAliases = []
	const t1 = new ast.Type(dummyParent, "Bool", dummyPos); t1.typeExpr = new ast.TE_Name(t1, "Bool", dummyPos); types.push(t1)
	const t2 = new ast.Type(dummyParent, "DATA", dummyPos); t2.typeExpr = new ast.TE_Name(t2, "DATA", dummyPos); types.push(t2)
	const t3 = new ast.Type(dummyParent, "MSG", dummyPos); t3.typeExpr = new ast.TE_Name(t3, "MSG", dummyPos); types.push(t3)
	const t4 = new ast.Type(dummyParent, "IP", dummyPos); t4.typeExpr = new ast.TE_Name(t4, "IP", dummyPos); types.push(t4)
	const t5 = new ast.Type(dummyParent, "TIME", dummyPos); t5.typeExpr = new ast.TE_Name(t5, "TIME", dummyPos); types.push(t5)
	
	const v = new ast.Variable(dummyParent, "now", dummyPos); v.typeExpr = t5.typeExpr; variables.push(v)

	const c1 = new ast.Constant(dummyParent, "true", dummyPos); c1.typeExpr = t1.typeExpr; constants.push(c1)
	const c2 = new ast.Constant(dummyParent, "false", dummyPos); c1.typeExpr = t1.typeExpr; constants.push(c2)

	const booleanfunc = new ast.BTE_Function(dummyParent); booleanfunc.left = new ast.TE_Name(booleanfunc, "Bool", dummyPos); booleanfunc.right = new ast.TE_Name(booleanfunc, "Bool", dummyPos); booleanfunc.output = new ast.TE_Name(booleanfunc, "Bool", dummyPos)
	const f1 = new ast.Function_Infix(dummyParent, "&", dummyPos); f1.signature = booleanfunc; functions.push(f1)
	const f2 = new ast.Function_Infix(dummyParent, "|", dummyPos); f2.signature = booleanfunc; functions.push(f2)
	const f3 = new ast.Function_Infix(dummyParent, "->", dummyPos); f3.signature = booleanfunc; functions.push(f3)
	const f4 = new ast.Function_Infix(dummyParent, "<->", dummyPos); f4.signature = booleanfunc; functions.push(f4)
	const f5 = new ast.Function_Infix(dummyParent, "newpkt", dummyPos); f5.signature = new ast.BTE_Function(f5); booleanfunc.left = new ast.TE_Name(booleanfunc, "Data", dummyPos); booleanfunc.right = new ast.TE_Name(booleanfunc, "IP", dummyPos); booleanfunc.output = new ast.TE_Name(booleanfunc, "MSG", dummyPos); functions.push(f5)
	
	for(const block of root.blocks){
		switch(block.kind){
			
			case ast.ASTKinds.Block_Include: { //TODO
				break;
			}

			case ast.ASTKinds.Block_Type: {
				for(const typedec of (block as ast.Block_Type).types){
					if(usedNames().includes(typedec.typeName)){
						errors.push(createErrorMessage(`Name "${typedec.typeName}" already defined previously.`, typedec.pos.line, typedec.pos.offset))
						continue
					}
					const newTE = expandTypeExpression(typedec.typeExpr, typedec.typeName)
					if(newTE != null){
						typedec.typeExpr = newTE
						types.push(typedec)
					} //note: the above function handles adding to invalidTypes
				}
				break;
			}

			case ast.ASTKinds.Block_Variable: {
				for(var vari of (block as ast.Block_Variable).vars){
					if(usedNames().includes(vari.name)){
						errors.push(createErrorMessage( `Name "${vari.name}" already defined previously.`, vari.namePos.line, vari.namePos.offset))
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

			case ast.ASTKinds.Block_Constant: {
				for(var con of (block as ast.Block_Constant).consts){
					if(usedNames().includes(con.name)){
						errors.push(createErrorMessage( `Name "${con.name}" already defined previously.`, con.namePos.line, con.namePos.offset))
						continue
					}
					const newTE = expandTypeExpression(con.typeExpr)
					if(newTE != null){
						con.typeExpr = newTE
						constants.push(con)
					}else{
						invalidVariables.push(con.name)
					}
				}
				break
			}

			case ast.ASTKinds.Block_Function: {
				for(var func of (block as ast.Block_Function).funcs){
					if(usedNames().includes(func.name)){
						errors.push(createErrorMessage( `Name "${func.name}" already defined previously.`, func.namePos.line, func.namePos.offset))
						continue
					}
					const newTE = expandTypeExpression(func.signature)
					if(newTE != null){
						func.signature = newTE
						functions.push(func)
					}else{
						invalidVariables.push(func.name)
					}
				}
				break
			}

			case ast.ASTKinds.Block_Alias: {
				for (const alias of (block as ast.Block_Alias).aliases){
					switch(alias.kind){
						case ast.ASTKinds.Alias_Data: {

						}
					}
				}
				break
			}

			case ast.ASTKinds.Block_Process: {
				for (const proc of (block as ast.Block_Process).procs){
					if(usedNames().includes(proc.name)){
						errors.push(createErrorMessage(`Name "${proc.name}" already defined previously.`, proc.namePos.line, proc.namePos.offset))
						continue
					}
					//TODO binding rules for process variables
					for(const vari of proc.args){
						if(!usedNames().includes(vari.name)){
							errors.push(createErrorMessage(`"Nonexistent variable ${vari.name}" referenced.`, vari.namePos.line, vari.namePos.offset))
						}
					}
					if(CheckSPE(proc.proc)){
						processes.push(proc)
					}else{
						invalidProcesses.push(proc.name)
					}
				}
				break
			}
		}
	}
	console.log("Semantic Information:", types, variables, constants, functions, processes, aliases, invalidTypes, invalidVariables, invalidConstants, invalidFunctions, invalidProcesses, invalidAliases)
	return errors
}

//Expands out typeExp by replacing typenames with equivalents.
//If processing Type nodes (those found in a type block), include typeName so we can
//check circular definitions and add to invalidTypes if necessary.
//If any circular or undefined typenames are found, aborts and returns false.
//Otherwise, returns true (meaning success).
function expandTypeExpression(typeExp: ast.TE | ast.BTE, typeName?: string): ast.TE | null{
	//if a name, replace with equivalent
	if(typeExp.kind == ast.ASTKinds.TE_Name){
		//ensure no circular definition (only possible when typeName != null)
		if(typeName != null){
			if((typeExp as ast.TE_Name).typename == typeName){
				//circular definition
				invalidTypes.push(typeName)
				errors.push(createErrorMessage( `"${typeName}" contains a circular type definition.`, (typeExp as ast.TE_Name).pos.line, (typeExp as ast.TE_Name).pos.offset))
				return null
			}
		}

		const result = getTypeDefinition((typeExp as ast.TE_Name).typename, (typeExp as ast.TE_Name).pos) //retrieve the equivalent
		if(result == null){
			//nonexistent type referenced
			if(typeName != null){invalidTypes.push(typeName)}
			return null
		}
		else{
			//valid expansion returned; replace the typeExp with it
			typeExp = result as ast.TE
			if(typeExp.kind != ast.ASTKinds.TE_Name){ //if the replacement was not just another typename, keep going
				for(var childTE of typeExp.children){
					const childResult = expandTypeExpression(childTE, typeName)
					if(childResult == null){
						return null;
					}else{
						childTE = childResult
					}
				}
			}
			return typeExp
		}
	}
	else{ //move on to children if not typename (there will be children if not typename, so don't need to check)
		var failure = false
		for(var childTE of typeExp.children){
			const childResult = expandTypeExpression(childTE, typeName)
			if(childResult == null){
				failure = true
			}else{
				childTE = childResult
			}
		}
		if(failure){ //we check for failure afterwards rather than returning immediately so that this function can possibly find other errors further down the tree.
			return null
		}else{
			return typeExp
		}
	}
}

//Given a type name, returns its type definition.
//If the type has been declared but is invalid, returns 1.
//If the type doesn't exist, returns 0.
function getTypeDefinition(typeName: string, pos: PosInfo): ast.TE | null{
	var result: ast.TE
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
	errors.push(createErrorMessage( `Nonexistent type "${typeName}" referenced.`, pos.line, pos.offset))
	return null
}

function getConstant(constantName: string, produceError: boolean, pos: PosInfo): ast.Constant | null{
	var result: ast.Constant
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
		errors.push(createErrorMessage( `Nonexistent variable "${constantName}" referenced.`, pos.line, pos.offset))
	}
	return null
}

//TODO add case of VE[DE]
function getVariable(variableName: string, produceError: boolean, pos: PosInfo): ast.Variable | null{
	var result: ast.Variable
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
		errors.push(createErrorMessage( `Nonexistent variable "${variableName}" referenced.`, pos.line, pos.offset))
	}
	return null
}

function getFunction(functionName: string, produceError: boolean, pos: PosInfo): ast.Function | null{
	var result: ast.Function
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
		errors.push(createErrorMessage(`Nonexistent function "${functionName}" referenced.`, pos.line, pos.offset))
	}
	return null
}

//Evaluates and checks the data expression from the bottom up.
//Returns true if it is free of errors.
function CheckDataExpression(de: ast.DE): boolean{
	switch(de.kind){
		
		case ast.ASTKinds.DE_Singleton: { const DE = (de as ast.DE_Singleton)
			if(CheckDataExpression(DE.dataExp) == false){return false}
			DE.type = new ast.TE_Pow(dummyParent, DE.dataExp.type)
			return true
		}

		case ast.ASTKinds.DE_Set: { const DE = (de as ast.DE_Set)
			if(CheckDataExpression(DE.dataExp) == false){return false}
			const v = getVariable(DE.name, true, DE.namePos)
			if(v == null){return false}
			if(DE.dataExp.type.kind == ast.ASTKinds.TE_Name){
				if((DE.dataExp.type as ast.TE_Name).typename == "Bool"){
					DE.type = new ast.TE_Pow(dummyParent, v.typeExpr)
					return true
				}
			}
			errors.push(createErrorMessage( `Expected type "Bool" but got TODO.`, DE.namePos.line, DE.namePos.offset))
			return false
		}

		case ast.ASTKinds.DE_Partial: { const DE = (de as ast.DE_Partial)
			if(CheckDataExpression(DE.left) == false || CheckDataExpression(DE.right) == false){return false}
			const v = getVariable(DE.name, true, DE.namePos)
			if(v == null){return false}
			if(DE.right.type.kind == ast.ASTKinds.TE_Name){
				if((DE.right.type as ast.TE_Name).typename == "Bool"){
					DE.type = new ast.TE_Partial(dummyParent, v.typeExpr, DE.left.type)
					return true
				}
			}
			errors.push(createErrorMessage(`Expected type "Bool" but got TODO.`, DE.namePos.line, DE.namePos.offset))
			return false
		}

		case ast.ASTKinds.DE_Lambda: {const DE = (de as ast.DE_Lambda)
			if(CheckDataExpression(DE.dataExp) == false){return false}
			const v = getVariable(DE.name, true, DE.namePos)
			if(v == null){return false}
			DE.type = new ast.TE_Function(dummyParent, v.typeExpr, DE.type)
		}

		case ast.ASTKinds.DE_Forall: {const DE = (de as ast.DE_Forall)
			if(CheckDataExpression(DE.dataExp) == false){return false}
			const v = getVariable(DE.name, true, DE.namePos)
			if(v == null){return false}
			if(DE.dataExp.type.kind == ast.ASTKinds.TE_Name){
				if((DE.dataExp.type as ast.TE_Name).typename == "Bool"){
					DE.type = new ast.TE_Name(dummyParent, "Bool", (DE.dataExp.type as ast.TE_Name).pos)
					return true
				}
			}
			errors.push(createErrorMessage(`Expected type "Bool" but got TODO.`, DE.namePos.line, DE.namePos.offset))
			return false
		}

		case ast.ASTKinds.DE_Exists: {const DE = (de as ast.DE_Exists)
			if(CheckDataExpression(DE.dataExp) == false){return false}
			const v = getVariable(DE.name, true, DE.namePos)
			if(v == null){return false}
			if(DE.dataExp.type.kind == ast.ASTKinds.TE_Name){
				if((DE.dataExp.type as ast.TE_Name).typename == "Bool"){
					DE.type = new ast.TE_Name(dummyParent, "Bool", (DE.dataExp.type as ast.TE_Name).pos)
					return true
				}
			}
			errors.push(createErrorMessage( `Expected type "Bool" but got TODO.`, DE.namePos.line, DE.namePos.offset))
			return false
		}

		case ast.ASTKinds.DE_Brack: {const DE = (de as ast.DE_Brack)
			if(CheckDataExpression(DE.dataExp) == false){return false}
			DE.type = DE.dataExp.type
			return true
		}

		case ast.ASTKinds.DE_Name: {const DE = (de as ast.DE_Name)
			const c = getConstant(DE.name, false, DE.namePos)
			if(c != null){
				DE.type = c.typeExpr
				return true
			}
			const v = getVariable(DE.name, false, DE.namePos)
			if(v != null){
				DE.type = v.typeExpr
				return true
			}
			const f = getFunction(DE.name, false, DE.namePos)
			if(f != null){
				DE.type = f.signature
				return true
			}
			
			errors.push(createErrorMessage(`Nonexistent identifier "${DE.name}" referenced.`, DE.namePos.line, DE.namePos.offset))
			return false
		}

		case ast.ASTKinds.DE_Tuple: return true //TODO
		
		case ast.ASTKinds.DE_Function: {const DE = (de as ast.DE_Function)
			if(CheckDataExpression(DE.signature) == false){return false}
			if(CheckDataExpression(DE.arguments) == false){return false}
			//ensure signature DE actually is of function type
			console.log("hello", DE)
			if(![ast.ASTKinds.TE_Function, ast.ASTKinds.TE_Partial].includes(DE.signature.type.kind)){
				errors.push(createErrorMessage(`Expected functional type but got TODO.`, DE.sigPos.line, DE.sigPos.offset))
				return false
			}
			//check that arguments match signature
			switch(DE.signature.type.kind){
				case ast.ASTKinds.TE_Function:{
					if(!AreIdenticalTypes((DE.signature.type as ast.TE_Function).left, DE.arguments.type)){
						errors.push(createErrorMessage(`Function arguments don't match signature.`, DE.argPos.line, DE.argPos.offset))
						return false
					}
					break
				}
				case ast.ASTKinds.TE_Partial:{
					if(!AreIdenticalTypes((DE.signature.type as ast.TE_Partial).left, DE.arguments.type)){
						errors.push(createErrorMessage(`Function arguments don't match signature.`, DE.argPos.line, DE.argPos.offset))
						return false
					}
					break
				}
				default: return false
			}
			DE.type = (DE.signature.type as ast.TE_Function).right
			return true
		}

		case ast.ASTKinds.DE_Binary: {const DE = (de as ast.DE_Binary)
			return true;
			if(CheckDataExpression(DE.left) == false){return false}
			if(CheckDataExpression(DE.right) == false){return false}
		//	const f = getFunction(DE.)
		//	if(f == null){return false}
		//	DE.type = (f as ast.Function).signature
		}
	}
	return false
}

function CheckSPE(proc: ast.SPE): boolean{
	switch(proc.kind){

		case ast.ASTKinds.SPE_Guard: { const Proc = (proc as ast.SPE_Guard)
			if(!CheckDataExpression(Proc.dataExp)){return false}
			const DEType = Proc.dataExp.type
			if(DEType.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "Bool" but got TODO instead.`, Proc.DEStart.line, Proc.DEStart.offset, Proc.DEEnd.line, Proc.DEEnd.offset))
				CheckSPE(Proc.nextproc); return false
			}
			if((DEType as ast.TE_Name).typename != "Bool"){
				errors.push(createErrorMessage(`Expected type "Bool" but got TODO instead.`, Proc.DEStart.line, Proc.DEStart.offset, Proc.DEEnd.line, Proc.DEEnd.offset))
				CheckSPE(Proc.nextproc); return false
			}
			return CheckSPE(Proc.nextproc)
		}

		case ast.ASTKinds.SPE_Assign: { const Proc = (proc as ast.SPE_Assign)
			const result = getVariable(Proc.name, true, Proc.nameStart)
			if(result == null){CheckSPE(Proc.nextproc); return false}
			else{
				Proc.variable = (result as ast.Variable)
			}
			if(!AreIdenticalTypes(Proc.variable.typeExpr, Proc.dataExpAssign.type)){
				errors.push(createErrorMessage(`Data expression and variable must have the same type.`, Proc.nameStart.line, Proc.nameStart.offset, Proc.end.line, Proc.end.offset))
				CheckSPE(Proc.nextproc); return false
			}
			return CheckSPE(Proc.nextproc)
		}

		case ast.ASTKinds.SPE_Unicast: { const Proc = (proc as ast.SPE_Unicast)
			if(!CheckDataExpression(Proc.dataExpL)){CheckSPE(Proc.procA); CheckSPE(Proc.procB); return false}
			if(!CheckDataExpression(Proc.dataExpR)){CheckSPE(Proc.procA); CheckSPE(Proc.procB); return false}
			const DELType = Proc.dataExpL.type; const DERType = Proc.dataExpR.type
			if(DELType.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "IP" but got TODO instead.`, Proc.DELstart.line, Proc.DELstart.offset, Proc.DELend.line, Proc.DELend.offset))
				CheckSPE(Proc.procA); CheckSPE(Proc.procB); return false
			}
			if((DELType as ast.TE_Name).typename != "IP"){
				errors.push(createErrorMessage(`Expected type "IP" but got TODO instead.`, Proc.DELstart.line, Proc.DELstart.offset, Proc.DELend.line, Proc.DELend.offset))
				CheckSPE(Proc.procA); CheckSPE(Proc.procB); return false
			}
			if(DERType.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.DELend.line, Proc.DELend.offset+2, Proc.DERend.line, Proc.DERend.offset))
				CheckSPE(Proc.procA); CheckSPE(Proc.procB); return false
			}
			if((DERType as ast.TE_Name).typename != "MSG"){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.DELend.line, Proc.DELend.offset+2, Proc.DERend.line, Proc.DERend.offset))
				CheckSPE(Proc.procA); CheckSPE(Proc.procB); return false
			}
			return CheckSPE(Proc.procA) && CheckSPE(Proc.procB)
		}

		case ast.ASTKinds.SPE_Groupcast: { const Proc = (proc as ast.SPE_Groupcast)
			if(!CheckDataExpression(Proc.dataExpL)){CheckSPE(Proc.nextproc); return false}
			if(!CheckDataExpression(Proc.dataExpR)){CheckSPE(Proc.nextproc); return false}
			const DELType = Proc.dataExpL.type; const DERType = Proc.dataExpR.type
			if(DELType.kind != ast.ASTKinds.TE_Pow){
				errors.push(createErrorMessage(`Expected type "Pow(IP)" but got TODO instead.`, Proc.DELstart.line, Proc.DELstart.offset, Proc.DELend.line, Proc.DELend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			const deltype = DELType as ast.TE_Pow
			if(deltype.typeExpr.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "Pow(IP)" but got TODO instead.`, Proc.DELstart.line, Proc.DELstart.offset, Proc.DELend.line, Proc.DELend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			if((deltype.typeExpr as ast.TE_Name).typename != "IP"){
				errors.push(createErrorMessage(`Expected type "Pow(IP)" but got TODO instead.`, Proc.DELstart.line, Proc.DELstart.offset, Proc.DELend.line, Proc.DELend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			if(DERType.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.DELend.line, Proc.DELend.offset+2, Proc.DERend.line, Proc.DERend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			if((DERType as ast.TE_Name).typename != "MSG"){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.DELend.line, Proc.DELend.offset+2, Proc.DERend.line, Proc.DERend.offset))
				CheckSPE(Proc.nextproc); return false
			}

			return CheckSPE(Proc.nextproc)
		}

		case ast.ASTKinds.SPE_Broadcast: { const Proc = (proc as ast.SPE_Broadcast)
			if(!CheckDataExpression(Proc.dataExp)){CheckSPE(Proc.nextproc); return false}
			const DEType = Proc.dataExp.type
			if(DEType.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			if((DEType as ast.TE_Name).typename != "MSG"){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			return CheckSPE(Proc.nextproc)
		}

		case ast.ASTKinds.SPE_Send: { const Proc = (proc as ast.SPE_Send)
			if(!CheckDataExpression(Proc.dataExp)){CheckSPE(Proc.nextproc); return false}
			const DEType = Proc.dataExp.type
			if(DEType.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			if((DEType as ast.TE_Name).typename != "MSG"){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			return CheckSPE(Proc.nextproc)
		}

		case ast.ASTKinds.SPE_Deliver: { const Proc = (proc as ast.SPE_Deliver)
			if(!CheckDataExpression(Proc.dataExp)){CheckSPE(Proc.nextproc); return false}
			const DEType = Proc.dataExp.type
			if(DEType.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "DATA" but got TODO instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			if((DEType as ast.TE_Name).typename != "DATA"){
				errors.push(createErrorMessage(`Expected type "DATA" but got TODO instead.`, Proc.DEstart.line, Proc.DEstart.offset, Proc.DEend.line, Proc.DEend.offset))
				CheckSPE(Proc.nextproc); return false
			}
			return CheckSPE(Proc.nextproc)
		}

		case ast.ASTKinds.SPE_Receive: { const Proc = (proc as ast.SPE_Receive)
			const result = getVariable(Proc.name, true, Proc.namePos)
			if(result == null){CheckSPE(Proc.nextproc); return false}
			else{
				Proc.variable = (result as ast.Variable)
			}
			const varitype = Proc.variable.typeExpr
			if(varitype.kind != ast.ASTKinds.TE_Name){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.namePos.line, Proc.namePos.offset, Proc.nameEnd.line, Proc.nameEnd.offset))
				CheckSPE(Proc.nextproc); return false
			}
			if((varitype as ast.TE_Name).typename != "MSG"){
				errors.push(createErrorMessage(`Expected type "MSG" but got TODO instead.`, Proc.namePos.line, Proc.namePos.offset, Proc.nameEnd.line, Proc.nameEnd.offset))
				CheckSPE(Proc.nextproc); return false
			}
			return CheckSPE(Proc.nextproc)
		}

		case ast.ASTKinds.SPE_Choice: { const Proc = (proc as ast.SPE_Choice)
			return CheckSPE(Proc.left) && CheckSPE(Proc.right)
		}

		default: return true //TODO are SPE_Name and SPE_Call
	}
}

function AreIdenticalTypes(type1: ast.TE, type2: ast.TE): boolean{
	if(type1.kind != type2.kind){
		return false
	}
	if(type1.kind == ast.ASTKinds.TE_Name){
		if((type1 as ast.TE_Name).typename != (type2 as ast.TE_Name).typename){
			return false
		}
	}
	var areIdentical = true
	for (let i = 0; i < type1.children.length; i++) { //if kind matches, they have the same # of children, so this is safe
		if(!AreIdenticalTypes(type1.children[i], type2.children[i])){
			areIdentical = false
		}
	}
	return areIdentical
}

//TODO consider innocent overloading
function usedNames(): string[]{
	return types.map(x=>x.typeName).concat(invalidTypes)
	.concat(variables.map(x=>x.name)).concat(invalidVariables)
	.concat(constants.map(x=>x.name)).concat(invalidConstants)
	.concat(functions.map(x=>x.name)).concat(invalidFunctions)
	.concat(processes.map(x=>x.name)).concat(invalidProcesses)
	.concat(aliases.map(x=>x.name)).concat(invalidAliases)
}

function createErrorMessage(message: string, line: number, char: number, lineE?: number, charE?: number): Diagnostic{
	return {
		severity: DiagnosticSeverity.Error,
		range: {
			start: {line: line-1, character: char},
			end: {line: lineE == null? line-1 : lineE-1, character: charE == null? char : charE}
		},
		message: message
	};
}