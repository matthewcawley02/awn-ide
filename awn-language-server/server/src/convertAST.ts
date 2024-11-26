import * as newast from "./ast";
import * as oldast from "./parser";

const dummyPos = {
    overallPos: 0,
    line: 0,
    offset: 0
};

export function convertNewToOldAST(oldroot: oldast.AWNRoot): newast.AWNRoot{
	var root = new newast.AWNRoot(); root.parent = root
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
					let newtype = new newast.Type(newblock, oldtype.typeName.value, oldtype.posS); newblock.types.push(newtype)
					if(oldtype.typeExprW !== null){
						newtype.typeExpr = convertTypeExpr(oldtype.typeExprW.typeExpr, newtype)
					}
					else{ //if not given an associated TE, give it a typename TE, otherwise what's the point of it???
						newtype.typeExpr = new newast.TE_Name(newtype, oldtype.typeName.value, oldtype.posS)
					}
				}
				break;
			}

			case oldast.ASTKinds.Block_4: { //variable
				let newblock = new newast.Block_Variable(root); root.blocks.push(newblock)
				for(const oldconvar of oldblock.var){
					let newvar = (convertConVar(oldconvar, newblock, true) as newast.Variable[]); newblock.vars.push(...newvar)
				}
				break;
			}

			case oldast.ASTKinds.Block_5: { //constant
				let newblock = new newast.Block_Constant(root); root.blocks.push(newblock)
				for(const oldconvar of oldblock.const){
					let newconst = (convertConVar(oldconvar, newblock, false) as newast.Constant[]); newblock.consts.push(...newconst)
				}
				break;
			}

			case oldast.ASTKinds.Block_6: { //function
				let newblock = new newast.Block_Function(root); root.blocks.push(newblock)
				for(const oldfunc of oldblock.func){
					let newfunc = convertFunction(oldfunc, newblock); newblock.funcs.push(newfunc)
				}
				break;
			}
			
			case oldast.ASTKinds.Block_7: { //multiple processes
				let newblock = new newast.Block_Process(root); root.blocks.push(newblock)
				for(const oldproc of oldblock.proc){
					let newproc = convertProcess(oldproc, newblock); newblock.procs.push(newproc)
				}
				break;
			}

			case oldast.ASTKinds.Block_8: { //single process
				let newblock = new newast.Block_Process(root); root.blocks.push(newblock)
				let newproc = convertProcess(oldblock.proc, newblock); newblock.procs.push(newproc)
				break;
			}

			case oldast.ASTKinds.Block_9: { //alias
				let newblock = new newast.Block_Alias(root); root.blocks.push(newblock)
				for(const oldalias of oldblock.alias){
					let newalias = convertAlias(oldalias, newblock); newblock.aliases.push(newalias)
				}
				break;
			}
		}
	}
	return root;
}

//Converts an old form type expression into a new one.
//See ast-documentation.md for explanation of this function.
function convertTypeExpr(node: oldast.TE, parent: newast.Node): newast.TE{
	var newnode
	switch(node.kind){
		case oldast.ASTKinds.TE_1: { //brackets
			newnode = new newast.TE_Brack(parent)
			newnode.typeExpr = convertTypeExpr(node.typeExpr, newnode)
			newnode.children.push(newnode.typeExpr)
			break
		}

		case oldast.ASTKinds.TE_2: { //pow
			newnode = new newast.TE_Pow(parent)
			newnode.typeExpr = convertTypeExpr(node.typeExpr, newnode)
			newnode.children.push(newnode.typeExpr)
			break
		}

		case oldast.ASTKinds.TE_3: { //list
			newnode = new newast.TE_List(parent)
			newnode.typeExpr = convertTypeExpr(node.typeExpr, newnode)
			newnode.children.push(newnode.typeExpr)
			break
		}

		case oldast.ASTKinds.TE_4: { //name
			newnode = new newast.TE_Name(parent, node.typename.value, node.posS)
			break
		}
		
	}
	var returnednode: newast.TE = newnode
	if(node.typeExprMore !== null){
		convertLRTypeExpr(node.typeExprMore, newnode);
	}
	while(returnednode.parent != parent){ //make sure we're returning the correct thing, as the parent may have changed
		returnednode = returnednode.parent as newast.TE
	}
	return returnednode
}

function convertLRTypeExpr(node: oldast.TE1, parent: newast.Node): void{
	var newnode
	switch(node.kind){
		case oldast.ASTKinds.TE1_1: { //function
			newnode = new newast.TE_Function(parent) //(parent set temporarily, same for those below)
			insertLRNodeTE(newnode)
			newnode.right = convertTypeExpr(node.typeExpr, newnode)
			newnode.children.push(newnode.left); newnode.children.push(newnode.right)
			break
		}

		case oldast.ASTKinds.TE1_2: { //partial
			newnode = new newast.TE_Partial(parent)
			insertLRNodeTE(newnode)
			newnode.right = convertTypeExpr(node.typeExpr, newnode)
			newnode.children.push(newnode.left); newnode.children.push(newnode.right)
			break
		}

		case oldast.ASTKinds.TE1_3: { //product
			newnode = new newast.TE_Product(parent)
			insertLRNodeTE(newnode)
			switch(node.products.length){
				case 1: {
					newnode.right = convertTypeExpr(node.products[0].typeExpr, newnode)
					break
				}
				case 2: {
					newnode.right = new newast.TE_Product(newnode); var child = newnode.right as newast.TE_Product
					child.left = convertTypeExpr(node.products[1].typeExpr, child)
					child.left = convertTypeExpr(node.products[2].typeExpr, child)
					break
				}
				default: {
					newnode.right = new newast.TE_Product(newnode);
					var curnode = newnode.right as newast.TE_Product
					for(let i = 1; ; i++){
						curnode.left = convertTypeExpr(node.products[i].typeExpr, curnode)
						//on the second last chlid, set right to the last child instead of being another TE_Product
						if(i == node.products.length - 2){
							curnode.right = convertTypeExpr(node.products[i+1].typeExpr, curnode)
							break
						}
						curnode.right = new newast.TE_Product(curnode)
						curnode = curnode.right as newast.TE_Product
					}
					break
				}
			}
			break
		}
	}
}

function insertLRNodeTE(node: newast.TE_Function | newast.TE_Partial | newast.TE_Product): void{
	//first, find where to insert the node by iterating up the tree.
	var newChild: newast.TE = node; var newParent = node.parent 
	for(let i = 0; ; i++){
		//the second case is escaping through a bracket on the first iteration, as in that case we aren't actually inside the bracket, just an LR child of it
		if((node.precedence > newParent.precedence) || (newast.isBracketType(newParent.kind) && i == 0)){
			newChild = newParent as newast.TE
			newParent = newParent.parent as newast.TE
		}
		else{break}
	}

	//border of new node and new child
	newChild.parent = node
	node.left = newChild

	//border of new node and new parent
	node.parent = newParent
}

function convertBTE(node: oldast.BTE, parent: newast.Node): newast.BTE{
	switch(node.kind){
		case oldast.ASTKinds.BTE_1: { //bte function
			let b = new newast.BTE_Function(parent)
			b.left = convertBTEAux(node.left, b)
			b.right = convertBTEAux(node.right, b)
			b.children.push(b.left); b.children.push(b.right)
			return b
		}
		case oldast.ASTKinds.BTE_2: { //bte partial
			let b = new newast.BTE_Partial(parent)
			b.left = convertBTEAux(node.left, b)
			b.right = convertBTEAux(node.right, b)
			b.children.push(b.left); b.children.push(b.right)
			return b
		}
	}
}

function convertBTEAux(node: oldast.BTE_AUX, parent: newast.Node): newast.BTE_AUX{
	switch(node.kind){
		case oldast.ASTKinds.BTE_AUX_1: { //bte name
			return new newast.TE_Name(parent, node.name.value, node.posS)
		}
		case oldast.ASTKinds.BTE_AUX_2: { //bte brack
			let b = new newast.TE_Brack(parent)
			b.typeExpr = convertTypeExpr(node.typeExpr, b)
			b.children.push(b.typeExpr)
			return b
		}
		case oldast.ASTKinds.BTE_AUX_3: { //bte pow
			let b = new newast.TE_Pow(parent)
			b.typeExpr = convertTypeExpr(node.typeExpr, b)
			b.children.push(b.typeExpr)
			return b
		}
		case oldast.ASTKinds.BTE_AUX_4: { //bte list
			let b = new newast.TE_List(parent)
			b.typeExpr = convertTypeExpr(node.typeExpr, b)
			b.children.push(b.typeExpr)
			return b
		}
	}
}

function convertConVar(node: oldast.ConVar, parent: newast.Node, isVar: boolean): newast.Variable[] | newast.Constant[]{
	if(isVar){var convar: newast.Constant[] = []} else{var convar: newast.Variable[] = []}
	switch(node.kind){
		case oldast.ASTKinds.ConVar_1: { //list of convar (same TE)
			if(isVar){
				convar.push(new newast.Variable(parent, node.nameFirst.value, node.posS))
				convar.push(...node.namesMore.map(x => new newast.Variable(parent, x.name.value, x.posS)))
			}else{
				convar.push(new newast.Constant(parent, node.nameFirst.value, node.posS))
				convar.push(...node.namesMore.map(x => new newast.Constant(parent, x.name.value, x.posS)))
			}
			break
		}
		case oldast.ASTKinds.ConVar_2: { //singular convar
			if(isVar){
				convar = [new newast.Variable(parent, (node as oldast.ConVar_2).name.value, node.posS)]
			}else{
				convar = [new newast.Constant(parent, (node as oldast.ConVar_2).name.value, node.posS)]
			}
			break
		}
	}
	for(var c of convar){
		c.typeExpr = convertTypeExpr(node.typeExpr, c) //TODO currently inefficient, convertTE is called every iteration
	}
	return convar
}

function convertFunction(node: oldast.Function, parent: newast.Node): newast.Function{
	switch(node.kind){
		case oldast.ASTKinds.Function_1: { //not infix
			let func = new newast.Function_Generic(parent, node.name.value, node.posS)
			func.signature = convertTypeExpr(node.typeExpr, func)
			return func
		}
		case oldast.ASTKinds.Function_2: { //infix
			let func = new newast.Function_Infix(parent, node.name.value, node.posS)
			func.signature = convertBTE(node.binTypeExpr, func)
			return func
		}
	}
}

function convertProcess(node: oldast.Process, parent: newast.Node): newast.Process{
	switch(node.kind){
		case oldast.ASTKinds.Process_1: { //with args
			let arglist: newast.Variable[] = []
			if(node.argFirst != null){
				arglist.push(new newast.Variable(parent, node.argFirst.value, node.pos2S))
			}
			arglist.push(...node.argsMore.map(arg => new newast.Variable(parent, arg.name.value, arg.posS)))
			var proc = new newast.Process(parent, node.nameFirst.value, node.pos1S)
			proc.args = arglist
			proc.proc = convertProcExp(node.proc, parent)
			return proc
		}
		case oldast.ASTKinds.Process_2: { //without args
			var proc = new newast.Process(parent, node.name.value, node.posS)
			proc.args = []
			proc.proc = convertProcExp(node.proc, parent)
			return proc
		}
	}
}

//NOTE that I am not checking for SPE_Choice yet (the only LR one)
//This is just because I need to confirm what its behaviour is with Peter
//Will be easy to add when I can. 
function convertProcExp(node: oldast.SPE, parent: newast.Node): newast.SPE{
	switch(node.kind){
		case oldast.ASTKinds.SPE_1: { //guard
			let p = new newast.SPE_Guard(parent, node.posDES, node.posDEE)
			p.dataExp = convertDataExp(node.dataExp, p)
			p.nextproc = convertProcExp(node.proc, p)
			return p
		}
		case oldast.ASTKinds.SPE_2: { //assignment
			let p = new newast.SPE_Assign(parent, node.name.value, node.posA, node.posB, node.posB, node.posC, node.posC, node.posD)
			p.dataExpAssign = convertDataExp(node.dataExpAssignment, p)
			p.dataExpList = node.dataExpList.map(x => convertDataExp(x.dataExp, p))
			p.nextproc = convertProcExp(node.proc, p)
			return p
		}
		case oldast.ASTKinds.SPE_3: { //unicast
			let p = new newast.SPE_Unicast(parent, node.posA, node.posB, node.posC)
			p.dataExpL = convertDataExp(node.dataExpL, p)
			p.dataExpR = convertDataExp(node.dataExpR, p)
			p.procA = convertProcExp(node.procL, p)
			p.procB = convertProcExp(node.procR, p)
			return p
		}
		case oldast.ASTKinds.SPE_4: { //broadcast
			let p = new newast.SPE_Broadcast(parent, node.posA, node.posB)
			p.dataExp = convertDataExp(node.dataExp, p)
			p.nextproc = convertProcExp(node.proc, p)
			return p
		}
		case oldast.ASTKinds.SPE_5: { //groupcast
			let p = new newast.SPE_Groupcast(parent, node.posA, node.posB, node.posC)
			p.dataExpL = convertDataExp(node.dataExpL, p)
			p.dataExpR = convertDataExp(node.dataExpR, p)
			p.nextproc = convertProcExp(node.proc, p)
			return p
		}
		case oldast.ASTKinds.SPE_6: { //send
			let p = new newast.SPE_Send(parent, node.posA, node.posB)
			p.dataExp = convertDataExp(node.dataExp, p)
			p.nextproc = convertProcExp(node.proc, p)
			return p
		}
		case oldast.ASTKinds.SPE_7: { //deliver
			let p = new newast.SPE_Deliver(parent, node.posA, node.posB)
			p.dataExp = convertDataExp(node.dataExp, p)
			p.nextproc = convertProcExp(node.proc, p)
			return p
		}
		case oldast.ASTKinds.SPE_8: { //receive
			let p = new newast.SPE_Receive(parent, node.name.value, node.posS, node.posE)
			p.dataExps = node.dataExpList.map(x => convertDataExp(x.dataExp, p))
			p.nextproc = convertProcExp(node.proc, p)
			return p
		}
		case oldast.ASTKinds.SPE_9: { //we're ignoring brackets i guess? (not ignoring, but not including them in the AST)
			return convertProcExp(node.proc, parent)
		}
		case oldast.ASTKinds.SPE_10: { //call
			let p = new newast.SPE_Call(parent, node.name.value, node.posS)
			var args: newast.DE[] = []
			if(node.dataExpFirst != null){
				args.push(convertDataExp(node.dataExpFirst, p))
			}
			args.push(...node.dataExpW.map(x => convertDataExp(x.dataExp, p)))
			return p			
		}
		case oldast.ASTKinds.SPE_11: { //name
			let p = new newast.SPE_Name(parent, node.name.value, node.posS)
			return p			
		}
	}
}

function convertDataExp(node: oldast.DE, parent: newast.Node): newast.DE{
	var newnode
	switch(node.kind){
		case oldast.ASTKinds.DE_3: { //singleton
			newnode = new newast.DE_Singleton(parent)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			newnode.children.push(newnode.dataExp)
			break
		}

		case oldast.ASTKinds.DE_1: { //partial
			newnode = new newast.DE_Partial(parent, node.name.value, node.posS)
			newnode.left = convertDataExp(node.dataExpLeft, newnode)
			newnode.right = convertDataExp(node.dataExpRight, newnode)
			newnode.children.push(newnode.left, newnode.right)
			break
		}

		case oldast.ASTKinds.DE_2: { //set
			newnode = new newast.DE_Set(parent, node.name.value, node.posS)
			newnode.dataExp = convertDataExp(node.dataExpRight, newnode)
			newnode.children.push(newnode.dataExp)
			break
		}
		case oldast.ASTKinds.DE_4: { //lambda
			newnode = new newast.DE_Lambda(parent, node.name.value, node.pos)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			newnode.children.push(newnode.dataExp)
			break
		}
		case oldast.ASTKinds.DE_5: { //forall
			newnode = new newast.DE_Forall(parent, node.name.value, node.pos)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			newnode.children.push(newnode.dataExp)
			break
		}
		case oldast.ASTKinds.DE_6: { //exists
			newnode = new newast.DE_Exists(parent, node.name.value, node.pos)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			newnode.children.push(newnode.dataExp)
			break
		}
		case oldast.ASTKinds.DE_7: { //brackets
			newnode = new newast.DE_Brack(parent)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			newnode.children.push(newnode.dataExp)
			break
		}
		case oldast.ASTKinds.DE_8: { //name
			newnode = new newast.DE_Name(parent, node.name.value, node.posS)
			break
		}
	}
	var returnednode: newast.DE = newnode as newast.DE
	if(node.dataExpMore !== null){
		convertLRDataExp(node.dataExpMore, newnode);
	}
	while(returnednode.parent != parent){ //make sure we're returning the correct thing, as the parent may have changed
		returnednode = returnednode.parent as newast.DE
	}
	return returnednode

}

function convertLRDataExp(node: oldast.DE1, parent: newast.Node): void{
	var newnode
	switch(node.kind){
		case oldast.ASTKinds.DE1_1: {
			newnode = new newast.DE_Function(parent, (parent as newast.DE_Name).namePos, node.posA, node.posB)
			insertLRNodeDE(newnode)
			newnode.arguments = convertDataExp(node.dataExp, newnode)
			newnode.children.push(newnode.signature); newnode.children.push(newnode.arguments)
			break
		}
		case oldast.ASTKinds.DE1_2: {
			newnode = new newast.DE_Tuple(parent)
			insertLRNodeDE(newnode)
			newnode.dataExps = node.dataExpW.map(x => convertDataExp(x.dataExp, parent))
			newnode.children.push(...newnode.dataExps)
			break
		}
		case oldast.ASTKinds.DE1_3:  newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, "->", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_4:  newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, "<->", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_5:  newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, "&", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_6:  newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, "|", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_7:  newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, "=", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_8:  newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, "!=", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_9:  newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, ">=", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_10: newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, "<=", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_11: newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, ">", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_12: newnode = new newast.DE_Binary(parent, 6); newnode.function = new newast.Function_Infix(newnode, "<", dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); newnode.children.push(newnode.left); newnode.children.push(newnode.right)
		case oldast.ASTKinds.DE1_13: break; //TODO add custom infix functionality
	}
}

function insertLRNodeDE(node: newast.DE_Function | newast.DE_Tuple | newast.DE_Binary): void{
	//first, find where to insert the node by iterating up the tree.
	var newChild: newast.DE = node; var newParent = node.parent 
	for(let i = 0; ; i++){
		//the second case is escaping through a bracket on the first iteration, as in that case we aren't actually inside the bracket, just an LR child of it
		if((node.precedence > newParent.precedence) || (newast.isBracketType(newParent.kind) && i == 0)){
			newChild = newParent as newast.DE
			newParent = newParent.parent as newast.DE
		}
		else{break}
	}

	//border of new node and new child
	newChild.parent = node
	switch(node.kind){
		case newast.ASTKinds.DE_Tuple: {
			node = node as newast.DE_Tuple
			node.dataExps.push(newChild)
		}
		case newast.ASTKinds.DE_Function: {
			node = node as newast.DE_Function
			node.signature = newChild
		}
		case newast.ASTKinds.DE_Binary:
			node = node as newast.DE_Binary
			node.left = newChild
	}

	//border of new node and new parent
	node.parent = newParent
}

function convertAlias(node: oldast.Alias, parent: newast.Node): newast.Alias{
	switch(node.kind){
		case oldast.ASTKinds.Alias_1: { //alias list
			let newnode = new newast.Alias_List(parent, node.nameFirst.value)
			let arglist: string[] = []
			if(node.argFirst != null){
				arglist.push(node.argFirst.value)
			}
			arglist.push(...node.argsMore.map(arg => arg.name.value))
			newnode.args = arglist
			return newnode
		}
		case oldast.ASTKinds.Alias_2: { //alias data
			let newnode = new newast.Alias_Data(parent, node.name.value)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			return newnode
		}
	}
}