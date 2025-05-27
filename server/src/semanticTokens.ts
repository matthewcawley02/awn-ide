import * as ast from "./ast"
import { PosInfo } from './parser';

//LSP defines semantic tokens relatively: [deltaLine, deltaStartChar, length, tokenType, tokenModifiers].
//Two usage requirements of note:
//	1. Tokens must be sequential in position - the deltas cannot be negative (on a newline, deltachar is 0)
//	2. One token cannot span multiple lines. If that's required, you must split it into multiple tokens.
//
//	https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_semanticTokens

var tokensAbsolute: number[][] = []; // [line, char, length, type, modifiers]

export function resetSemanticTokens(){
	tokensAbsolute = []
}

//colours defined in "onInitialize" in server.ts
enum Colours {
	Keyword = 0, 	//purple
	Type = 1,		//teal
	Function = 2,	//light yellow
	Constant = 3,	//dark blue
	Variable = 4,	//light blue
	String = 5,		//orange
	Process = 6,	//light green
	Alias = 7,		//orange
	Comment = 8		//comment green
}

//Pushes a token to tokensAbsolute, given a starting position and a length
export function pushAbsGivenLength(pos: PosInfo, length: number, tokenType: number, tokenMods: number){
	tokensAbsolute.push([pos.line, pos.offset, length, tokenType, tokenMods])
}

//Pushes a token to tokensAbsolute, given a position range
function pushAbsGivenRange(startPos: PosInfo, endPos: PosInfo, tokenType: number, tokenMods: number){
	const length = endPos.offset - startPos.offset
	tokensAbsolute.push([startPos.line, startPos.offset, length, tokenType, tokenMods])
}

// tokensabs: [line, char, length, type, modifiers]
// tokensrel: [deltaLine, deltaStartChar, length, tokenType, tokenModifiers]

function convertAbstoRelTokens(): number[][]{
	tokensAbsolute = [...tokensAbsolute].sort((x, y) => sortPosition(x, y)); //sort by position
	var tokensRelative: number[][] = []
	tokensRelative[0] = tokensAbsolute[0].slice(0); tokensRelative[0][0] = 0 //it requires we start on line "0"
	for(var i = 1; i < tokensAbsolute.length; i++){
		const isNewline = tokensAbsolute[i][0] != tokensAbsolute[i-1][0]
		const deltaLine = tokensAbsolute[i][0] - tokensAbsolute[i-1][0]
		const deltaChar = isNewline ? tokensAbsolute[i][1] : tokensAbsolute[i][1] - tokensAbsolute[i-1][1]
		tokensRelative[i] = [deltaLine, deltaChar, tokensAbsolute[i][2], tokensAbsolute[i][3], tokensAbsolute[i][4]]
	}
	return tokensRelative;
}

//Gets the semantic tokens for a semantically-checked .awn AST.
//(Does not get tokens for comments as they aren't part of the AST)
export function getSemanticTokens(node: ast.AWNRoot): number[][]{
	calculateSemantTokens(node)
	return convertAbstoRelTokens()
}

//Used to sort tokensAbsolute
function sortPosition(t1: number[], t2: number[]): number{
	if(t1[0] < t2[0]){
		return -1
	}else if(t1[0] > t2[0]){
		return 1
	}else if(t1[1] < t2[1]){
		return -1
	}else if(t1[1] > t2[1]){
		return 1
	}
	return 0
}

//Calculate the semantic tokens from an .awn file (with comments removed) and puts them in tokensAbsolute
//This should be called after semantic checking is complete
function calculateSemantTokens(node: ast.AWNRoot){
	for(const block of node.blocks){
		if(block.kind == null) {continue}
		switch(block.kind){

			case ast.ASTKinds.Block_Include: { const Block = block as ast.Block_Include
				pushAbsGivenLength(Block.pos["keywordPos"], 8, Colours.Keyword, 0)
				for(const include of Block.includes){
					pushAbsGivenRange(include.pos["posS"], include.pos["posE"], Colours.String, 0)
				}
				break;
			}

			case ast.ASTKinds.Block_Type: { const Block = block as ast.Block_Type
				pushAbsGivenLength(Block.pos["keywordPos"], 5, Colours.Keyword, 0)
				for(const type of Block.types){
					parseType(type)
				}
				break;
			}
			case ast.ASTKinds.Block_Variable: { const Block = block as ast.Block_Variable
				pushAbsGivenLength(Block.pos["keywordPos"], 9, Colours.Keyword, 0)
				for(const vari of Block.vars){
					parseVariable(vari)
				}
				break;
			}
			case ast.ASTKinds.Block_Constant: { const Block = block as ast.Block_Constant
				pushAbsGivenLength(Block.pos["keywordPos"], 9, Colours.Keyword, 0)
				for(const con of Block.consts){
					parseConstant(con)
				}
				break;
			}
			case ast.ASTKinds.Block_Function: { const Block = block as ast.Block_Function
				pushAbsGivenLength(Block.pos["keywordPos"], 9, Colours.Keyword, 0)
				for(const func of Block.funcs){
					parseFunction(func)
				}
				break;
			}
			case ast.ASTKinds.Block_Process: { const Block = block as ast.Block_Process
				if(Block.definedAsProc){
					pushAbsGivenLength(Block.pos["keywordPos"], 4, Colours.Keyword, 0)
				}else{
					pushAbsGivenLength(Block.pos["keywordPos"], 9, Colours.Keyword, 0)
				}
				for(const proc of Block.procs){
					parseProcess(proc)
				}
				break;
			}

			case ast.ASTKinds.Block_Alias: {const Block = block as ast.Block_Alias
				pushAbsGivenLength(Block.pos["keywordPos"], 7, Colours.Keyword, 0)
				for(const alias of Block.aliases){
					switch(alias.kind){
						case ast.ASTKinds.Alias_Data: { const Alias = alias as ast.Alias_Data
							parseAliasData(Alias)
							break
						}
						case ast.ASTKinds.Alias_List: { const Alias = alias as ast.Alias_List
							parseAliasList(Alias)
							break
						}
					}
				}
				break
			}
		}
	}
}

function parseType(node: ast.Type){
	pushAbsGivenRange(node.pos["posS"], node.pos["posE"], Colours.Type, 0)
	parseTypeExpr(node.typeExpr)
}

function parseTypeExpr(te: ast.TE){
	if(te == null){return}
	switch(te.kind){

		case ast.ASTKinds.TE_Brack: { const TE = te as ast.TE_Brack
			parseTypeExpr(TE.typeExpr)
			break;
		}

		case ast.ASTKinds.TE_Pow: { const TE = te as ast.TE_Pow
			pushAbsGivenLength(TE.pos["powPos"], 3, Colours.Type, 0)
			parseTypeExpr(TE.typeExpr)
			break;
		}

		case ast.ASTKinds.TE_Array: { const TE = te as ast.TE_Array
			parseTypeExpr(TE.typeExpr)
			break;
		}

		case ast.ASTKinds.TE_Name: { const TE = te as ast.TE_Name
			pushAbsGivenRange(TE.pos["posS"], TE.pos["posE"], Colours.Type, 0)
			break;
		}

		case ast.ASTKinds.TE_FuncFull: { const TE = te as ast.TE_FuncFull
			parseTypeExpr(TE.left); parseTypeExpr(TE.right)
			break;
		}

		case ast.ASTKinds.TE_FuncPart: { const TE = te as ast.TE_FuncPart
			parseTypeExpr(TE.left); parseTypeExpr(TE.right)
			break;
		}

		case ast.ASTKinds.TE_Product: { const TE = te as ast.TE_Product
			for(const child of TE.children){
				parseTypeExpr(child)
			}
			break;
		}
	}
}

function parseConstant(con: ast.Constant){
	if(con.typeDeclaredFirst){
		parseTypeExpr(con.typeExpr)
		pushAbsGivenRange(con.pos["posS"], con.pos["posE"], Colours.Constant, 0)
	} else {
		pushAbsGivenRange(con.pos["posS"], con.pos["posE"], Colours.Constant, 0)
		parseTypeExpr(con.typeExpr)
	}
}

function parseVariable(vari: ast.Variable){
	if(vari.typeDeclaredFirst){
		parseTypeExpr(vari.typeExpr)
		pushAbsGivenRange(vari.pos["posS"], vari.pos["posE"], Colours.Variable, 0)
	} else {
		pushAbsGivenRange(vari.pos["posS"], vari.pos["posE"], Colours.Variable, 0)
		parseTypeExpr(vari.typeExpr)
	}	
}

function parseFunction(func: ast.Function){
	pushAbsGivenRange(func.pos["posS"], func.pos["posE"], Colours.Function, 0)
	parseTypeExpr(func.sigType); 
	parseTypeExpr(func.outType)
}

function parseProcess(proc: ast.Process){
	pushAbsGivenRange(proc.pos["posS"], proc.pos["posE"], Colours.Process, 0)
	for(const arg of proc.argInfo){
		parseProcArg(arg)
	}
	parseProcExp(proc.proc)
}

function parseProcArg(procarg: ast.ProcArg){
	switch(procarg.argType){
		case ast.ASTKinds.Variable: {
			pushAbsGivenRange(procarg.pos["posS"], procarg.pos["posE"], Colours.Variable, 0)
			break
		}
		case ast.ASTKinds.Alias_List: {
			pushAbsGivenRange(procarg.pos["posS"], procarg.pos["posE"], Colours.Alias, 0)
			break
		}
	}
}

function parseProcExp(procexp: ast.SPE){
	if(procexp.kind == null){return}
	switch(procexp.kind){

		case ast.ASTKinds.SPE_Guard: { const Procexp = procexp as ast.SPE_Guard
			parseDataExp(Procexp.dataExp)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Assign: { const Procexp = procexp as ast.SPE_Assign
			parseVariableExp(Procexp.variableExp)
			parseDataExp(Procexp.dataExpAssign)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Unicast: { const Procexp = procexp as ast.SPE_Unicast
			pushAbsGivenLength(Procexp.pos["start"], 7, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExpL)
			parseDataExp(Procexp.dataExpR)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Broadcast: { const Procexp = procexp as ast.SPE_Broadcast
			pushAbsGivenLength(Procexp.pos["start"], 9, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExp)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Groupcast: { const Procexp = procexp as ast.SPE_Groupcast
			pushAbsGivenLength(Procexp.pos["start"], 9, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExpL)
			parseDataExp(Procexp.dataExpR)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Send: { const Procexp = procexp as ast.SPE_Send
			pushAbsGivenLength(Procexp.pos["start"], 4, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExp)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Deliver: { const Procexp = procexp as ast.SPE_Deliver
			pushAbsGivenLength(Procexp.pos["start"], 7, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExp)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Receive: { const Procexp = procexp as ast.SPE_Receive
			pushAbsGivenLength(Procexp.pos["start"], 7, Colours.Keyword, 0)
			pushAbsGivenRange(Procexp.pos["namePos"], Procexp.pos["nameEnd"], Colours.Process, 0)
			for (const de of Procexp.dataExps){
				parseDataExp(de)
			}
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Call: { const Procexp = procexp as ast.SPE_Call;
			pushAbsGivenRange(Procexp.pos["posS"], Procexp.pos["posE"], Colours.Process, 0)
			if(Procexp.args == null){return}
			for (const de of Procexp.args){
				parseDataExp(de)
			}
			break;
		}

		case ast.ASTKinds.SPE_Choice: { const Procexp = procexp as ast.SPE_Choice;
			parseProcExp(Procexp.left); parseProcExp(Procexp.right)
			break;
		}

		case ast.ASTKinds.SPE_Brack: { const Procexp = procexp as ast.SPE_Brack;
			parseProcExp(Procexp.proc)
			break
		}
	}
}

function parseVariableExp(varexp: ast.VariableExp){
	pushAbsGivenRange(varexp.pos["posS"], varexp.pos["posE"], Colours.Variable, 0)
	for(const de of varexp.des){
		parseDataExp(de)
	}
}

function parseDataExp(de: ast.DE){
	//what this would be now is - if name then give colour based on type, else recursive call
	if(de.kind == null){return}
	switch(de.kind){
		case ast.ASTKinds.DE_Singleton: { const DE = de as ast.DE_Singleton
			parseDataExp(DE.dataExp)
			break;
		}

		case ast.ASTKinds.DE_Partial: { const DE = de as ast.DE_Partial
			pushAbsGivenRange(DE.pos["posS"], DE.pos["posE"], Colours.Variable, 0)
			parseDataExp(DE.left)
			parseDataExp(DE.right)
			break;
		}

		case ast.ASTKinds.DE_Set: { const DE = de as ast.DE_Set
			pushAbsGivenRange(DE.pos["posS"], DE.pos["posE"], Colours.Variable, 0)
			parseDataExp(DE.dataExp)
			break;
		}

		case ast.ASTKinds.DE_Lambda: { const DE = de as ast.DE_Lambda
			pushAbsGivenLength(DE.pos["startPos"], 6, Colours.Keyword, 0)
			pushAbsGivenLength(DE.pos["namePos"], DE.name.length, Colours.Variable, 0)
			parseDataExp(DE.dataExp)
			break;
		}
		case ast.ASTKinds.DE_Forall: { const DE = de as ast.DE_Forall
			pushAbsGivenLength(DE.pos["startPos"], 6, Colours.Keyword, 0)
			pushAbsGivenLength(DE.pos["namePos"], DE.name.length, Colours.Variable, 0)
			parseDataExp(DE.dataExp)
			break;
		}
		case ast.ASTKinds.DE_Exists: { const DE = de as ast.DE_Exists
			pushAbsGivenLength(DE.pos["startPos"], 6, Colours.Keyword, 0)
			pushAbsGivenLength(DE.pos["namePos"], DE.name.length, Colours.Variable, 0)
			parseDataExp(DE.dataExp)
			break;
		}
		case ast.ASTKinds.DE_Brack: { const DE = de as ast.DE_Brack
			parseDataExp(DE.dataExp)
			break;
		}

		case ast.ASTKinds.DE_Function: { const DE = de as ast.DE_Function_Prefix
			pushAbsGivenRange(DE.pos["sigStart"], DE.pos["sigEnd"], Colours.Function, 0)
			if(DE.arguments != null){
				parseDataExp(DE.arguments)
			}else{ //if there was a problem in parsing, use DE.dataExp as a backup
				parseDataExp(DE.dataExp)
			}
			break
		}

		case ast.ASTKinds.DE_Tuple: { const DE = de as ast.DE_Tuple
			if(DE.dataExps == null){return}
			for(const param of DE.dataExps){
				parseDataExp(param)
			}
			break
		}

		case ast.ASTKinds.DE_Infix: { const DE = de as ast.DE_Function_Infix
			parseDataExp(DE.left); parseDataExp(DE.right)
			break
		}

		case ast.ASTKinds.DE_Name: { const DE = de as ast.DE_Name
			if(DE.refersTo == null){break}
			switch(DE.refersTo){
				case ast.ASTKinds.Constant: pushAbsGivenRange(DE.pos["posS"], DE.pos["posE"], Colours.Constant, 0); break
				case ast.ASTKinds.Variable: pushAbsGivenRange(DE.pos["posS"], DE.pos["posE"], Colours.Variable, 0); break
				case ast.ASTKinds.Function_Infix:
				case ast.ASTKinds.Function_Prefix: pushAbsGivenRange(DE.pos["posS"], DE.pos["posE"], Colours.Function, 0); break
				case ast.ASTKinds.Alias_Data:
				case ast.ASTKinds.Alias_List: pushAbsGivenRange(DE.pos["posS"], DE.pos["posE"], Colours.Alias, 0); break
			}
		}
	}
}

function parseAliasData(alias: ast.Alias_Data){
	pushAbsGivenRange(alias.pos["posS"], alias.pos["posE"], Colours.Alias, 0)
	parseDataExp(alias.dataExp)
}

function parseAliasList(alias: ast.Alias_List){
	pushAbsGivenRange(alias.pos["posS"], alias.pos["posE"], Colours.Alias, 0)
	for(var i = 0; i < alias.argsPosE.length; i++){
		pushAbsGivenRange(alias.argsPosS[i], alias.argsPosE[i], Colours.Variable, 0)
	}
}