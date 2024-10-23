import { readlink } from 'fs';
import {ASTKinds, AWNRoot, Block_1, Block_2, Block_3, Block_4, Block_5, Block_6, Block_7, Block_8, Include, Type, Type_$0, ConVar_1, ConVar_2, ConVar_$0, Function_1, Function_2, Process_1, Process_2, Process_$0, TE_1, TE_2, TE_3, TE_4, TE1_1, TE1_2, TE1_3, TE1_$0, BTE_1, BTE_2, BTE_AUX_1, BTE_AUX_2, BTE_AUX_3, BTE_AUX_4, SPE_1, SPE_2, SPE_3, SPE_4, SPE_5, SPE_6, SPE_7, SPE_8, SPE_9, SPE_10, SPE_11, SPE_$0, SPE_$1, SPE_$2, SPE1, DE_1, DE_2, DE_3, DE_4, DE_5, DE_6, DE_7, DE_8, DE1_1, DE1_2, DE1_3, DE1_4, DE1_5, DE1_6, DE1_7, DE1_8, DE1_9, DE1_10, DE1_11, DE1_12, DE1_13, DE1_$0, TypeName, Name, TE, TE1, ConVar, Function, Process, SPE, DE, DE1} from "./parser"

var tokens: number[][] = []

var curLine = 0; var curOffset = 0;

function pushAndUpdate(absoluteLine: number, absolutePos: number, length: number, tokenType: number, tokenMods: number){
	const isNewline = (absoluteLine-1-curLine !== 0)
	const token = [absoluteLine-1-curLine, isNewline? absolutePos: absolutePos-curOffset, length, tokenType, tokenMods]
	tokens.push(token)
	curLine = absoluteLine-1; curOffset = absolutePos
}

enum Colours {
	Keyword = 0,
	Type = 1,
	Function = 2,
	Variable = 3,
	Constant = 4,
	Number = 5,
	String = 6,
	Parameter = 7,
	Process = 8
}

//semantic tokens documentation:
//[deltaLine, deltaStartChar, length, tokenType, tokenModifiers]

//NOTES:
//the correct offset may be +/- 1 from block.pos.offset, have to experiment bc idk what block.pos.offset's behaviour is

export function getSemantTokens(node: AWNRoot): number[]{
	tokens = []
	curLine = 0; curOffset = 0;
	for(const block of node.block){
		switch(block.kind){
			case ASTKinds.Block_1: { //multiple includes
				pushAndUpdate(block.pos.line, block.pos.offset, 8, Colours.Keyword, 0)
				for(const include of block.include){
					pushAndUpdate(include.posS.line, include.posS.offset, include.posE.offset-include.posS.offset, Colours.String, 0)
				}
				break;
			}
			case ASTKinds.Block_2: { //singlular include
				pushAndUpdate(block.pos.line, block.pos.offset, 7, Colours.Keyword, 0)
				const include = block.include
				pushAndUpdate(include.posS.line, include.posS.offset, include.posE.offset-include.posS.offset, Colours.String, 0)
				break;
			}
			case ASTKinds.Block_3: { //types
				pushAndUpdate(block.pos.line, block.pos.offset, 5, Colours.Keyword, 0)
				for(const type of block.type){
					parseType(type)
				}
				break;
			}
			case ASTKinds.Block_4: { //variables
				pushAndUpdate(block.pos.line, block.pos.offset, 9, Colours.Keyword, 0)
				for(const vari of block.var){
					parseConVar(vari, true)
				}
				break;
			}
			case ASTKinds.Block_5: { //constants
				pushAndUpdate(block.pos.line, block.pos.offset, 9, Colours.Keyword, 0)
				for(const con of block.const){
					parseConVar(con, false)
				}
				break;
			}
			case ASTKinds.Block_6: { //functions
				pushAndUpdate(block.pos.line, block.pos.offset, 9, Colours.Keyword, 0)
				for(const func of block.func){
					parseFunction(func)
				}
				break;
			}
			case ASTKinds.Block_7: { //multiple processes
				pushAndUpdate(block.pos.line, block.pos.offset, 9, Colours.Keyword, 0)
				for(const proc of block.proc){
					parseProcess(proc)
				}
				break;
			}
			case ASTKinds.Block_8: { //singular process
				pushAndUpdate(block.pos.line, block.pos.offset, 4, Colours.Keyword, 0)
				parseProcess(block.proc)
				break;
			}
		}
	}
	return tokens.flat()
}

function parseType(node: Type){
	pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Type, 0)
	if(node.typeExprW !== null){
		parseTypeExpr(node.typeExprW.typeExpr)
	}
}

function parseTypeExpr(node: TE | TE1){
	switch(node.kind){
		case ASTKinds.TE_1: { //brackets
			parseTypeExpr(node.typeExpr)
			if(node.typeExprMore !== null){
				parseTypeExpr(node.typeExprMore)
			}
			break;
		}
		case ASTKinds.TE_2: { //pow
			pushAndUpdate(node.pos.line, node.pos.offset, 3, Colours.Type, 0)
			parseTypeExpr(node.typeExpr)
			if(node.typeExprMore !== null){
				parseTypeExpr(node.typeExprMore)
			}
			break;
		}
		case ASTKinds.TE_3: { //list
			parseTypeExpr(node.typeExpr)
			if(node.typeExprMore !== null){
				parseTypeExpr(node.typeExprMore)
			}
			break;
		}
		case ASTKinds.TE_4: { //name
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Type, 0)
			if(node.typeExprMore !== null){
				parseTypeExpr(node.typeExprMore)
			}
			break;
		}
		case ASTKinds.TE1_1: { //function
			parseTypeExpr(node.typeExpr)
			if(node.typeExprMore !== null){
				parseTypeExpr(node.typeExprMore)
			}
			break;
		}
		case ASTKinds.TE1_2: { //partial function
			parseTypeExpr(node.typeExpr)
			if(node.typeExprMore !== null){
				parseTypeExpr(node.typeExprMore)
			}
			break;
		}
		case ASTKinds.TE1_3: { //product
			if(node.typeExprMore !== null){
				parseTypeExpr(node.typeExprMore)
			}
			break;
		}
	}
}

function parseConVar(node: ConVar, isVar: boolean){
	switch(node.kind){
		case ASTKinds.ConVar_1: {
			parseTypeExpr(node.typeExpr)
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, isVar? Colours.Variable: Colours.Constant, 0)
			for(const namesMore of node.namesMore){
				pushAndUpdate(namesMore.posS.line, namesMore.posS.offset, namesMore.posE.offset-namesMore.posS.offset, isVar? Colours.Variable: Colours.Constant, 0)
			}
		}
		case ASTKinds.ConVar_2: {
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, isVar? Colours.Variable: Colours.Constant, 0)
			parseTypeExpr(node.typeExpr)
		}
	}
}

function parseFunction(node: Function){
	switch(node.kind){
		case ASTKinds.Function_1: { //not infix
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Function, 0)
			parseTypeExpr(node.typeExpr)
			break;
		}
		case ASTKinds.Function_2: { //infix
			//TODO add infix functionality
			break;
		}
	}
}

function parseProcess(node: Process){
	switch(node.kind){
		case ASTKinds.Process_1: {
			pushAndUpdate(node.pos1S.line, node.pos1S.offset, node.pos1E.offset-node.pos1S.offset, Colours.Process, 0)
			if(node.argFirst !== null){
				pushAndUpdate(node.pos2S.line, node.pos2S.offset, node.pos2E.offset-node.pos2S.offset, Colours.Parameter, 0)
			}
			for(const namesMore of node.argsMore){
				pushAndUpdate(namesMore.posS.line, namesMore.posS.offset, namesMore.posE.offset-namesMore.posS.offset, Colours.Parameter, 0)
			}
			parseProcExp(node.proc)
			break;
		}
		case ASTKinds.Process_2: {
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Process, 0)
			parseProcExp(node.proc)
			break;
		}
	}
}

function parseProcExp(node: SPE | SPE1){
	switch(node.kind){
		case ASTKinds.SPE_1: { //guard
			parseDataExp(node.dataExp)
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_2: {
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Variable, 0)
			for (const de of node.dataExpList){
				parseDataExp(de.dataExp)
			}
			parseDataExp(node.dataExpAssignment)
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_3: {
			pushAndUpdate(node.pos.line, node.pos.offset, 7, Colours.Keyword, 0)
			parseDataExp(node.dataExpL)
			parseDataExp(node.dataExpR)
			parseProcExp(node.procL)
			parseProcExp(node.procR)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_4: {
			pushAndUpdate(node.pos.line, node.pos.offset, 9, Colours.Keyword, 0)
			parseDataExp(node.dataExp)
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_5: {
			pushAndUpdate(node.pos.line, node.pos.offset, 9, Colours.Keyword, 0)
			parseDataExp(node.dataExpL)
			parseDataExp(node.dataExpR)
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_6: {
			pushAndUpdate(node.pos.line, node.pos.offset, 4, Colours.Keyword, 0)
			parseDataExp(node.dataExp)
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_7: {
			pushAndUpdate(node.pos.line, node.pos.offset, 7, Colours.Keyword, 0)
			parseDataExp(node.dataExp)
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_8: {
			pushAndUpdate(node.pos.line, node.pos.offset, 7, Colours.Keyword, 0)
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Process, 0)
			for (const de of node.dataExpList){
				parseDataExp(de.dataExp)
			}
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_9: {
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_10: {
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Function, 0)
			if(node.dataExpFirst !== null){
				parseDataExp(node.dataExpFirst)
			}
			for (const de of node.dataExpW){
				parseDataExp(de.dataExp)
			}
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE_11: {
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Process, 0)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
		case ASTKinds.SPE1: {
			parseProcExp(node.proc)
			if(node.procMore !== null){
				parseProcExp(node.procMore)
			}
			break;
		}
	}
}

function parseDataExp(node: DE | DE1){
	switch(node.kind){
		case ASTKinds.DE_1: {
			parseDataExp(node.dataExp)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE_2: {
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Parameter, 0)
			parseDataExp(node.dataExpLeft)
			parseDataExp(node.dataExpRight)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE_3: {
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Parameter, 0)
			parseDataExp(node.dataExpRight)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE_4: {
			pushAndUpdate(node.pos.line, node.pos.offset, 6, Colours.Keyword, 0)
			parseDataExp(node.dataExp)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE_5: {
			pushAndUpdate(node.pos.line, node.pos.offset, 6, Colours.Keyword, 0)
			parseDataExp(node.dataExp)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE_6: {
			pushAndUpdate(node.pos.line, node.pos.offset, 6, Colours.Keyword, 0)
			parseDataExp(node.dataExp)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE_7: {
			parseDataExp(node.dataExp)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE_8: {
			pushAndUpdate(node.posS.line, node.posS.offset, node.posE.offset-node.posS.offset, Colours.Parameter, 0)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE1_1: {
			parseDataExp(node.dataExp)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE1_2: {
			for(const de of node.dataExpW){
				parseDataExp(de.dataExp)
			}
			break;
		}
		case ASTKinds.DE1_3:
		case ASTKinds.DE1_4:
		case ASTKinds.DE1_5:
		case ASTKinds.DE1_6:
		case ASTKinds.DE1_7:
		case ASTKinds.DE1_8:
		case ASTKinds.DE1_9:
		case ASTKinds.DE1_10:
		case ASTKinds.DE1_11:
		case ASTKinds.DE1_12: {
			parseDataExp(node.dataExp)
			if(node.dataExpMore !== null){
				parseDataExp(node.dataExpMore)
			}
			break;
		}
		case ASTKinds.DE1_13: break; //TODO add infix functionality
	}
}