import * as newast from "./ast";
import * as oldast from "./parser";


export function convertNewToOldAST(oldroot: oldast.AWNRoot): newast.AWNRoot{
	var root = new newast.AWNRoot()
	for(const oldblock of oldroot.block){
		switch(oldblock.kind){

			case oldast.ASTKinds.Block_1: { //multiple includes
				let newblock = new newast.Block_Include(root); root.blocks.push(newblock)
				for(const oldinclude of oldblock.include){
					let ni = new newast.Include(newblock, oldinclude.name.value); newblock.includes.push(ni)
				}
				break;
			}

			case oldast.ASTKinds.Block_2: { //single include
				let newblock = new newast.Block_Include(root); root.blocks.push(newblock)
				let ni = new newast.Include(newblock, oldblock.include.name.value); newblock.includes.push(ni)
				break;
			}

			case oldast.ASTKinds.Block_3: { //type
				let newblock = new newast.Block_Type(root);	root.blocks.push(newblock)
				for (const oldtype of oldblock.type){
					let newtype = new newast.Type(newblock, oldtype.typeName.value); newblock.types.push(newtype)
					if(oldtype.typeExprW !== null){
						newtype.typeExpr = convertTypeExpr(oldtype.typeExprW.typeExpr, newtype)
					}
				}
				break;
			}
		}
	}
	return root;
}

function convertTypeExpr(oldTE: oldast.TE, parent: newast.Node): newast.TE{
	var newtype: newast.TE
	switch(oldTE.kind){
		case oldast.ASTKinds.TE_1: { //brackets
			newtype = new newast.TE_Brack(parent)
			newtype.typeExpr = convertTypeExpr(oldTE.typeExpr, newtype)
			break;
		}

		case oldast.ASTKinds.TE_2: { //pow
			newtype = new newast.TE_Pow(parent)
			newtype.typeExpr = convertTypeExpr(oldTE.typeExpr, newtype)
			break;
		}

		case oldast.ASTKinds.TE_3: { //list
			newtype = new newast.TE_List(parent)
			newtype.typeExpr = convertTypeExpr(oldTE.typeExpr, newtype)
			break;
		}

		case oldast.ASTKinds.TE_4: { //name
			newtype = new newast.TE_Name(parent, oldTE.typename.value)
			break;
		}

	}
	if(oldTE.typeExprMore !== null){
		convertLRTypeExpr(oldTE.typeExprMore);
	}
	return newtype
}

function convertLRTypeExpr(oldTE: oldast.TE1): void{
	switch(oldTE.kind){
		case oldast.ASTKinds.TE1_1: { //function
				
		}
		case oldast.ASTKinds.TE1_2: { //partial function
			
		}
		case oldast.ASTKinds.TE1_3: { //product

		}
	}
	//rotate

	if(oldTE.typeExprMore !== null){
		convertLRTypeExpr(oldTE.typeExprMore);
	}
	return
}

function convertConVar(node: oldast.ConVar, isVar: boolean){
	switch(node.kind){
		case oldast.ASTKinds.ConVar_1: {
			
		}
		case oldast.ASTKinds.ConVar_2: {
			
		}
	}
}

function convertFunction(node: oldast.Function){
	switch(node.kind){
		case oldast.ASTKinds.Function_1: { //not infix
			
		}
		case oldast.ASTKinds.Function_2: { //infix
			//TODO add infix functionality
			break;
		}
	}
}

function convertProcess(node: oldast.Process){
	switch(node.kind){
		case oldast.ASTKinds.Process_1: {
			
		}
		case oldast.ASTKinds.Process_2: {

		}
	}
}

function convertProcExp(node: oldast.SPE | oldast.SPE1){
	switch(node.kind){
		case oldast.ASTKinds.SPE_1: { //guard
			
		}
		case oldast.ASTKinds.SPE_2: {
			
		}
		case oldast.ASTKinds.SPE_3: {
			
		}
		case oldast.ASTKinds.SPE_4: {
			
		}
		case oldast.ASTKinds.SPE_5: {
			
		}
		case oldast.ASTKinds.SPE_6: {
			
		}
		case oldast.ASTKinds.SPE_7: {
			
		}
		case oldast.ASTKinds.SPE_8: {
			
		}
		case oldast.ASTKinds.SPE_9: {
			
		}
		case oldast.ASTKinds.SPE_10: {
			
		}
		case oldast.ASTKinds.SPE_11: {
			
		}
		case oldast.ASTKinds.SPE1: {
			
		}
	}
}

function convertDataExp(node: oldast.DE | oldast.DE1){
	switch(node.kind){
		case oldast.ASTKinds.DE_1: {
			
		}
		case oldast.ASTKinds.DE_2: {
			
		}
		case oldast.ASTKinds.DE_3: {
			
		}
		case oldast.ASTKinds.DE_4: {
			
		}
		case oldast.ASTKinds.DE_5: {
			
		}
		case oldast.ASTKinds.DE_6: {
			
		}
		case oldast.ASTKinds.DE_7: {
			
		}
		case oldast.ASTKinds.DE_8: {
			
		}
		case oldast.ASTKinds.DE1_1: {
			
		}
		case oldast.ASTKinds.DE1_2: {
			
		}
		case oldast.ASTKinds.DE1_3:
		case oldast.ASTKinds.DE1_4:
		case oldast.ASTKinds.DE1_5:
		case oldast.ASTKinds.DE1_6:
		case oldast.ASTKinds.DE1_7:
		case oldast.ASTKinds.DE1_8:
		case oldast.ASTKinds.DE1_9:
		case oldast.ASTKinds.DE1_10:
		case oldast.ASTKinds.DE1_11:
		case oldast.ASTKinds.DE1_12: {
			break;
		}
		case oldast.ASTKinds.DE1_13: break; //TODO add infix functionality
	}
}