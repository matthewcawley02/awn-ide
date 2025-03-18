import * as ast from "./ast"
import { PosInfo } from './parser';

var tokens: number[][] = []

var curLine = 0; var curOffset = 0;

//node both pushAndUpdate functions only work properly if the highlighting remains on one line
//push and update, given a start and end position
export function pushAndUpdate(startPos: PosInfo, endPos: PosInfo, tokenType: number, tokenMods: number){
	const absoluteLine = startPos.line; const absolutePos = startPos.offset
	const length = endPos.offset - startPos.offset
	const isNewline = (absoluteLine-1-curLine !== 0)
	const token = [absoluteLine-1-curLine, isNewline? absolutePos: absolutePos-curOffset, length, tokenType, tokenMods]
	tokens.push(token)
	curLine = absoluteLine-1; curOffset = absolutePos
}

//push and update, given a start position and a highlighting length
export function pushAndUpdateGivenLength(startPos: PosInfo, length: number, tokenType: number, tokenMods: number){
	const absoluteLine = startPos.line; const absolutePos = startPos.offset
	const isNewline = (absoluteLine-1-curLine !== 0)
	const token = [absoluteLine-1-curLine, isNewline? absolutePos: absolutePos-curOffset, length, tokenType, tokenMods]
	tokens.push(token)
	curLine = absoluteLine-1; curOffset = absolutePos
}

export function resetSemanticTokens(){
	tokens = []; curOffset = 0; curLine = 0
}

//colours defined in "onInitialize" in server.ts
enum Colours {
	Keyword = 0, 	//purple
	Type = 1,		//teal
	Function = 2,	//light yellow
	Constant = 3,	//light blue
	Variable = 4,	//light blue
	String = 5,		//orange
	Process = 6,	//green
	Alias = 7		//orange
}

//semantic tokens documentation:
//[deltaLine, deltaStartChar, length, tokenType, tokenModifiers]

//NOTES:
//the correct offset may be +/- 1 from block.pos.offset, have to experiment bc idk what block.pos.offset's behaviour is

export function getSemantTokens(node: ast.AWNRoot): number[][]{
	for(const block of node.blocks){
		if(block.kind == null) {continue}
		switch(block.kind){

			case ast.ASTKinds.Block_Include: { const Block = block as ast.Block_Include
				pushAndUpdateGivenLength(Block.keywordPos, 8, Colours.Keyword, 0)
				for(const include of Block.includes){
					pushAndUpdate(include.posS, include.posE, Colours.String, 0)
				}
				break;
			}

			case ast.ASTKinds.Block_Type: { const Block = block as ast.Block_Type
				pushAndUpdateGivenLength(Block.keywordPos, 5, Colours.Keyword, 0)
				for(const type of Block.types){
					parseType(type)
				}
				break;
			}
			case ast.ASTKinds.Block_Variable: { const Block = block as ast.Block_Variable
				pushAndUpdateGivenLength(Block.keywordPos, 9, Colours.Keyword, 0)
				for(const vari of Block.vars){
					parseVariable(vari)
				}
				break;
			}
			case ast.ASTKinds.Block_Constant: { const Block = block as ast.Block_Constant
				pushAndUpdateGivenLength(Block.keywordPos, 9, Colours.Keyword, 0)
				for(const con of Block.consts){
					parseConstant(con)
				}
				break;
			}
			case ast.ASTKinds.Block_Function: { const Block = block as ast.Block_Function
				pushAndUpdateGivenLength(Block.keywordPos, 9, Colours.Keyword, 0)
				for(const func of Block.funcs){
					parseFunction(func)
				}
				break;
			}
			case ast.ASTKinds.Block_Process: { const Block = block as ast.Block_Process
				if(Block.definedAsProc){
					pushAndUpdateGivenLength(Block.keywordPos, 4, Colours.Keyword, 0)
				}else{
					pushAndUpdateGivenLength(Block.keywordPos, 9, Colours.Keyword, 0)
				}
				for(const proc of Block.procs){
					parseProcess(proc)
				}
				break;
			}

			case ast.ASTKinds.Block_Alias: {const Block = block as ast.Block_Alias
				pushAndUpdateGivenLength(Block.keywordPos, 7, Colours.Keyword, 0)
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
	return tokens
}

function parseType(node: ast.Type){
	pushAndUpdate(node.posS, node.posE, Colours.Type, 0)
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
			pushAndUpdateGivenLength(TE.pos, 3, Colours.Type, 0)
			parseTypeExpr(TE.typeExpr)
			break;
		}

		case ast.ASTKinds.TE_Array: { const TE = te as ast.TE_Array
			parseTypeExpr(TE.typeExpr)
			break;
		}

		case ast.ASTKinds.TE_Name: { const TE = te as ast.TE_Name
			pushAndUpdate(TE.posS, TE.posE, Colours.Type, 0)
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
		pushAndUpdate(con.posS, con.posE, Colours.Constant, 0)
	} else {
		pushAndUpdate(con.posS, con.posE, Colours.Constant, 0)
		parseTypeExpr(con.typeExpr)
	}
}

function parseVariable(vari: ast.Variable){
	if(vari.typeDeclaredFirst){
		parseTypeExpr(vari.typeExpr)
		pushAndUpdate(vari.posS, vari.posE, Colours.Variable, 0)
	} else {
		pushAndUpdate(vari.posS, vari.posE, Colours.Variable, 0)
		parseTypeExpr(vari.typeExpr)
	}	
}

function parseFunction(func: ast.Function){
	pushAndUpdate(func.posS, func.posE, Colours.Function, 0)
	parseTypeExpr(func.sigType); 
	parseTypeExpr(func.outType)
}

function parseProcess(proc: ast.Process){
	pushAndUpdate(proc.posS, proc.posE, Colours.Process, 0)
	for(const arg of proc.args){
		pushAndUpdate(arg.posS, arg.posE, Colours.Variable, 0)
	}
	parseProcExp(proc.proc)
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
			pushAndUpdate(Procexp.nameStart, Procexp.varStart, Colours.Variable, 0)
			parseDataExp(Procexp.dataExpAssign)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Unicast: { const Procexp = procexp as ast.SPE_Unicast
			pushAndUpdateGivenLength(Procexp.start, 7, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExpL)
			parseDataExp(Procexp.dataExpR)
			parseProcExp(Procexp.procA)
			parseProcExp(Procexp.procB)
			break;
		}

		case ast.ASTKinds.SPE_Broadcast: { const Procexp = procexp as ast.SPE_Broadcast
			pushAndUpdateGivenLength(Procexp.start, 9, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExp)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Groupcast: { const Procexp = procexp as ast.SPE_Groupcast
			pushAndUpdateGivenLength(Procexp.start, 9, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExpL)
			parseDataExp(Procexp.dataExpR)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Send: { const Procexp = procexp as ast.SPE_Send
			pushAndUpdateGivenLength(Procexp.start, 4, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExp)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Deliver: { const Procexp = procexp as ast.SPE_Deliver
			pushAndUpdateGivenLength(Procexp.start, 7, Colours.Keyword, 0)
			parseDataExp(Procexp.dataExp)
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Receive: { const Procexp = procexp as ast.SPE_Receive
			pushAndUpdateGivenLength(Procexp.start, 7, Colours.Keyword, 0)
			pushAndUpdate(Procexp.namePos, Procexp.nameEnd, Colours.Process, 0)
			for (const de of Procexp.dataExps){
				parseDataExp(de)
			}
			parseProcExp(Procexp.nextproc)
			break;
		}

		case ast.ASTKinds.SPE_Call: { const Procexp = procexp as ast.SPE_Call;
			pushAndUpdate(Procexp.posS, Procexp.posE, Colours.Process, 0)
			if(Procexp.args == null){return}
			for (const de of Procexp.args){
				parseDataExp(de)
			}
			break;
		}

		case ast.ASTKinds.SPE_Name: { const Procexp = procexp as ast.SPE_Name;
			pushAndUpdate(Procexp.posS, Procexp.posE, Colours.Process, 0)
			break;
		}

		case ast.ASTKinds.SPE_Choice: { const Procexp = procexp as ast.SPE_Choice;
			parseProcExp(Procexp.left); parseProcExp(Procexp.right)
			break;
		}
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
			pushAndUpdate(DE.posS, DE.posE, Colours.Variable, 0)
			parseDataExp(DE.left)
			parseDataExp(DE.right)
			break;
		}

		case ast.ASTKinds.DE_Set: { const DE = de as ast.DE_Set
			pushAndUpdate(DE.posS, DE.posE, Colours.Variable, 0)
			parseDataExp(DE.dataExp)
			break;
		}

		case ast.ASTKinds.DE_Lambda: { const DE = de as ast.DE_Lambda
			pushAndUpdateGivenLength(DE.startPos, 6, Colours.Keyword, 0)
			pushAndUpdateGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0)
			parseDataExp(DE.dataExp)
			break;
		}
		case ast.ASTKinds.DE_Forall: { const DE = de as ast.DE_Forall
			pushAndUpdateGivenLength(DE.startPos, 6, Colours.Keyword, 0)
			pushAndUpdateGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0)
			parseDataExp(DE.dataExp)
			break;
		}
		case ast.ASTKinds.DE_Exists: { const DE = de as ast.DE_Exists
			pushAndUpdateGivenLength(DE.startPos, 6, Colours.Keyword, 0)
			pushAndUpdateGivenLength(DE.namePos, DE.name.length, Colours.Variable, 0)
			parseDataExp(DE.dataExp)
			break;
		}
		case ast.ASTKinds.DE_Brack: { const DE = de as ast.DE_Brack
			parseDataExp(DE.dataExp)
			break;
		}

		case ast.ASTKinds.DE_Function: { const DE = de as ast.DE_Function_Prefix
			pushAndUpdate(DE.sigPos, DE.argPos, Colours.Function, 0)
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
			if(DE.type == null){break}
			switch(DE.refersTo){
				case ast.ASTKinds.Constant: pushAndUpdate(DE.posS, DE.posE, Colours.Constant, 0); break
				case ast.ASTKinds.Variable: pushAndUpdate(DE.posS, DE.posE, Colours.Variable, 0); break
				case ast.ASTKinds.Function_Infix:
				case ast.ASTKinds.Function_Prefix: pushAndUpdate(DE.posS, DE.posE, Colours.Function, 0); break
				case ast.ASTKinds.Alias_Data:
				case ast.ASTKinds.Alias_List: pushAndUpdate(DE.posS, DE.posE, Colours.Alias, 0); break
			}
		}
	}
}

function parseAliasData(alias: ast.Alias_Data){
	pushAndUpdate(alias.posS, alias.posE, Colours.Alias, 0)
	parseDataExp(alias.dataExp)
}

function parseAliasList(alias: ast.Alias_List){
	pushAndUpdate(alias.posS, alias.posE, Colours.Alias, 0)
	for(var i = 0; i < alias.argsPosE.length; i++){
		pushAndUpdate(alias.argsPosS[i], alias.argsPosE[i], Colours.Variable, 0)
	}
}