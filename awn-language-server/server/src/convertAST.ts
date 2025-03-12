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
				let newblock = new newast.Block_Include(root, oldblock.pos); root.blocks.push(newblock)
				for(const oldinclude of oldblock.include){
					let ni = new newast.Include(newblock, oldinclude.name.value, oldinclude.posS, oldinclude.posE); newblock.includes.push(ni)
				}
				break;
			}

			case oldast.ASTKinds.Block_2: { //single include
				let newblock = new newast.Block_Include(root, oldblock.pos); root.blocks.push(newblock)
				let ni = new newast.Include(newblock, oldblock.include.name.value, oldblock.include.posS, oldblock.include.posE); newblock.includes.push(ni)
				break;
			}

			case oldast.ASTKinds.Block_3: { //type
				let newblock = new newast.Block_Type(root, oldblock.pos);	root.blocks.push(newblock)
				for (const oldtype of oldblock.type){
					let newtype = new newast.Type(newblock, oldtype.typeName.value, oldtype.posS, oldtype.posE); newblock.types.push(newtype)
					if(oldtype.typeExprW !== null){
						newtype.typeExpr = convertTypeExpr(oldtype.typeExprW.typeExpr, newtype)
					}
					else{ //if not given an associated TE, give it a typename TE, otherwise what's the point of it???
						newtype.typeExpr = new newast.TE_Name(newtype, oldtype.typeName.value, oldtype.posS, oldtype.posE)
					}
				}
				break;
			}

			case oldast.ASTKinds.Block_4: { //variable
				let newblock = new newast.Block_Variable(root, oldblock.pos); root.blocks.push(newblock)
				for(const oldconvar of oldblock.var){
					let newvar = (convertConVar(oldconvar, newblock, true) as newast.Variable[]); newblock.vars.push(...newvar)
				}
				break;
			}

			case oldast.ASTKinds.Block_5: { //constant
				let newblock = new newast.Block_Constant(root, oldblock.pos); root.blocks.push(newblock)
				for(const oldconvar of oldblock.const){
					let newconst = (convertConVar(oldconvar, newblock, false) as newast.Constant[]); newblock.consts.push(...newconst)
				}
				break;
			}

			case oldast.ASTKinds.Block_6: { //function
				let newblock = new newast.Block_Function(root, oldblock.pos); root.blocks.push(newblock)
				for(const oldfunc of oldblock.func){
					let newfunc = convertFunction(oldfunc, newblock); newblock.funcs.push(newfunc)
				}
				break;
			}
			
			case oldast.ASTKinds.Block_7: { //multiple processes
				let newblock = new newast.Block_Process(root, oldblock.pos, false); root.blocks.push(newblock)
				for(const oldproc of oldblock.proc){
					let newproc = convertProcess(oldproc, newblock); newblock.procs.push(newproc)
				}
				break;
			}

			case oldast.ASTKinds.Block_8: { //single process
				let newblock = new newast.Block_Process(root, oldblock.pos, true); root.blocks.push(newblock)
				let newproc = convertProcess(oldblock.proc, newblock); newblock.procs.push(newproc)
				break;
			}

			case oldast.ASTKinds.Block_9: { //alias
				let newblock = new newast.Block_Alias(root, oldblock.pos); root.blocks.push(newblock)
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
			break
		}

		case oldast.ASTKinds.TE_2: { //pow
			newnode = new newast.TE_Pow(parent, node.pos)
			newnode.typeExpr = convertTypeExpr(node.typeExpr, newnode)
			break
		}

		case oldast.ASTKinds.TE_3: { //Array
			newnode = new newast.TE_Array(parent)
			newnode.typeExpr = convertTypeExpr(node.typeExpr, newnode)
			break
		}

		case oldast.ASTKinds.TE_4: { //name
			newnode = new newast.TE_Name(parent, node.typename.value, node.posS, node.posE)
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
			newnode = new newast.TE_FuncFull(parent) //(parent set temporarily, same for those below)
			insertLRNodeTE(newnode)
			newnode.right = convertTypeExpr(node.typeExpr, newnode)
			break
		}

		case oldast.ASTKinds.TE1_2: { //partial
			newnode = new newast.TE_FuncPart(parent)
			insertLRNodeTE(newnode)
			newnode.right = convertTypeExpr(node.typeExpr, newnode)
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
			newnode.children = flattenTE(newnode)
			break
		}
	}
}

function insertLRNodeTE(node: newast.TE_Function | newast.TE_Product): void{
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

//Turn a binary tree TE_Product node into a node with an array that obeys correct precedence rules.
//During conversion, Products are given right precedence (i.e. a x b x c is parsed as a x (b x c))
//This simplifies this function - we just add what is on the left at all times, then check if the right is another product.
function flattenTE(typeExp: newast.TE_Product): newast.TE[] {
	var children: newast.TE[] = []
	children.push(typeExp.left)

	if(typeExp.right.kind == newast.ASTKinds.TE_Product){
		children.push(...flattenTE(typeExp.right as newast.TE_Product))
	}else{
		children.push(typeExp.right)
	}
	return children
}

//Same thing as flattenTE but for tuple DEs instead
function flattenDE(dataExp: newast.DE_Tuple): newast.DE[] {
	var children: newast.DE[] = []
	children.push(dataExp.left)

	if(dataExp.right.kind == newast.ASTKinds.DE_Tuple){
		children.push(...flattenDE(dataExp.right as newast.DE_Tuple))
	}else{
		children.push(dataExp.right)
	}
	return children
}

function convertConVar(node: oldast.ConVar, parent: newast.Node, isVar: boolean): newast.Variable[] | newast.Constant[]{
	if(isVar){var convar: newast.Constant[] = []} else{var convar: newast.Variable[] = []}
	switch(node.kind){
		case oldast.ASTKinds.ConVar_1: { //list of convar (same TE)
			if(isVar){
				convar.push(new newast.Variable(parent, node.nameFirst.value, node.posS, node.posE))
				convar.push(...node.namesMore.map(x => new newast.Variable(parent, x.name.value, x.posS, x.posE)))
			}else{
				convar.push(new newast.Constant(parent, node.nameFirst.value, node.posS, node.posE))
				convar.push(...node.namesMore.map(x => new newast.Constant(parent, x.name.value, x.posS, x.posE)))
			}
			break
		}
		case oldast.ASTKinds.ConVar_2: { //singular convar
			if(isVar){
				convar = [new newast.Variable(parent, (node as oldast.ConVar_2).name.value, node.posS, node.posE)]
			}else{
				convar = [new newast.Constant(parent, (node as oldast.ConVar_2).name.value, node.posS, node.posE)]
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
	var func
	switch(node.kind){
		case oldast.ASTKinds.Function_1: { //function_prefix
			func = new newast.Function_Prefix(parent, node.name.value, node.posS, node.posE)
			break
		}
		case oldast.ASTKinds.Function_2: { //function infix
			func = new newast.Function_Infix(parent, node.name.value, node.posS, node.posE)
			break
		}
	}
	func.type = convertTypeExpr(node.typeExpr, func)
	return func
}

function convertProcess(node: oldast.Process, parent: newast.Node): newast.Process{
	switch(node.kind){
		case oldast.ASTKinds.Process_1: { //with args
			let arglist: newast.Variable[] = []
			if(node.argFirst != null){
				arglist.push(new newast.Variable(parent, node.argFirst.value, node.pos2S, node.pos2E))
			}
			arglist.push(...node.argsMore.map(arg => new newast.Variable(parent, arg.name.value, arg.posS, arg.posE)))
			var proc = new newast.Process(parent, node.nameFirst.value, node.pos1S, node.pos1E)
			proc.args = arglist
			proc.proc = convertProcExp(node.proc, parent)
			return proc
		}
		case oldast.ASTKinds.Process_2: { //without args
			var proc = new newast.Process(parent, node.name.value, node.posS, node.posE)
			proc.args = []
			proc.proc = convertProcExp(node.proc, parent)
			return proc
		}
	}
}


function convertProcExp(node: oldast.SPE, parent: newast.Node): newast.SPE{
	var newproc: newast.SPE
	switch(node.kind){
		case oldast.ASTKinds.SPE_1: { //guard
			newproc = new newast.SPE_Guard(parent, node.posDES, node.posDEE)
			newproc.dataExp = convertDataExp(node.dataExp, newproc)
			newproc.nextproc = convertProcExp(node.proc, newproc)
			break
		}
		case oldast.ASTKinds.SPE_2: { //assignment
			newproc = new newast.SPE_Assign(parent, node.name.value, node.posA, node.posC, node.posC, node.posD)
			newproc.dataExpAssign = convertDataExp(node.dataExpAssignment, newproc)
			newproc.nextproc = convertProcExp(node.proc, newproc)
			break
		}
		case oldast.ASTKinds.SPE_3: { //unicast
			newproc = new newast.SPE_Unicast(parent, node.pos, node.posA, node.posB, node.posC)
			newproc.dataExpL = convertDataExp(node.dataExpL, newproc)
			newproc.dataExpR = convertDataExp(node.dataExpR, newproc)
			newproc.procA = convertProcExp(node.procL, newproc)
			newproc.procB = convertProcExp(node.procR, newproc)
			break
		}
		case oldast.ASTKinds.SPE_4: { //broadcast
			newproc = new newast.SPE_Broadcast(parent, node.pos, node.posA, node.posB)
			newproc.dataExp = convertDataExp(node.dataExp, newproc)
			newproc.nextproc = convertProcExp(node.proc, newproc)
			break
		}
		case oldast.ASTKinds.SPE_5: { //groupcast
			newproc = new newast.SPE_Groupcast(parent, node.pos, node.posA, node.posB, node.posC)
			newproc.dataExpL = convertDataExp(node.dataExpL, newproc)
			newproc.dataExpR = convertDataExp(node.dataExpR, newproc)
			newproc.nextproc = convertProcExp(node.proc, newproc)
			break
		}
		case oldast.ASTKinds.SPE_6: { //send
			newproc = new newast.SPE_Send(parent, node.pos, node.posA, node.posB)
			newproc.dataExp = convertDataExp(node.dataExp, newproc)
			newproc.nextproc = convertProcExp(node.proc, newproc)
			break
		}
		case oldast.ASTKinds.SPE_7: { //deliver
			newproc = new newast.SPE_Deliver(parent, node.pos, node.posA, node.posB)
			newproc.dataExp = convertDataExp(node.dataExp, newproc)
			newproc.nextproc = convertProcExp(node.proc, newproc)
			break
		}
		case oldast.ASTKinds.SPE_8: { //receive
			newproc = new newast.SPE_Receive(parent, node.pos, node.name.value, node.posS, node.posE)
			newproc.dataExps = node.dataExpList.map(x => convertDataExp(x.dataExp, newproc))
			newproc.nextproc = convertProcExp(node.proc, newproc)
			break
		}
		case oldast.ASTKinds.SPE_9: { //we're ignoring brackets i guess? (not ignoring, but not including them in the AST)
			newproc = convertProcExp(node.proc, parent)
			break
		}
		case oldast.ASTKinds.SPE_10: { //call
			newproc = new newast.SPE_Call(parent, node.name.value, node.posS, node.posE)
			var args: newast.DE[] = []
			if(node.dataExpFirst != null){
				args.push(convertDataExp(node.dataExpFirst, newproc))
			}
			args.push(...node.dataExpW.map(x => convertDataExp(x.dataExp, newproc)))
			var what = newproc as newast.SPE_Call; what.args = args //idk why i have to do this???
			break			
		}
		case oldast.ASTKinds.SPE_11: { //name
			newproc = new newast.SPE_Name(parent, node.name.value, node.posS, node.posE)
			break			
		}
	}
	var returnednode: newast.SPE = newproc as newast.SPE
	if(node.procMore !== null){
		convertLRProcExp(node.procMore, newproc);
	}
	while(returnednode.parent != parent){ //make sure we're returning the correct thing, as the parent may have changed
		returnednode = returnednode.parent as newast.SPE
	}
	return returnednode
}

//this is just SPE_Choice
function convertLRProcExp(node: oldast.SPE1, parent: newast.Node): void{
	var newnode = new newast.SPE_Choice(parent) //parent set temporarily
	insertLRNodeSPE(newnode)
	newnode.right = convertProcExp(node.proc, newnode)
}

function insertLRNodeSPE(node: newast.SPE_Choice): void{
	var newChild: newast.SPE = node; var newParent = node.parent 
	for(let i = 0; ; i++){
		//the second case is escaping through a bracket on the first iteration, as in that case we aren't actually inside the bracket, just an LR child of it
		if((node.precedence > newParent.precedence) || (newast.isBracketType(newParent.kind) && i == 0)){
			newChild = newParent as newast.SPE
			newParent = newParent.parent as newast.SPE
		}
		else{break}
	}

	//border of new node and new child
	newChild.parent = node
	node = node as newast.SPE_Choice
	node.left = newChild

	//border of new node and new parent
	node.parent = newParent
}

function convertDataExp(node: oldast.DE, parent: newast.Node): newast.DE{
	var newnode
	switch(node.kind){
		case oldast.ASTKinds.DE_3: { //singleton
			newnode = new newast.DE_Singleton(parent)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			break
		}

		case oldast.ASTKinds.DE_1: { //partial
			newnode = new newast.DE_Partial(parent, node.name.value, node.posS, node.posE)
			newnode.left = convertDataExp(node.dataExpLeft, newnode)
			newnode.right = convertDataExp(node.dataExpRight, newnode)
			break
		}

		case oldast.ASTKinds.DE_2: { //set
			newnode = new newast.DE_Set(parent, node.name.value, node.posS, node.posE)
			newnode.dataExp = convertDataExp(node.dataExpRight, newnode)
			break
		}
		case oldast.ASTKinds.DE_4: { //lambda
			newnode = new newast.DE_Lambda(parent, node.name.value, node.posS, node.pos)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			break
		}
		case oldast.ASTKinds.DE_5: { //forall
			newnode = new newast.DE_Forall(parent, node.name.value, node.posS, node.pos)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			break
		}
		case oldast.ASTKinds.DE_6: { //exists
			newnode = new newast.DE_Exists(parent, node.name.value, node.posS, node.pos)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			break
		}
		case oldast.ASTKinds.DE_7: { //function
			newnode = new newast.DE_Function_Prefix(parent, node.name.value, node.posN, node.posS, node.posE)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			break
		}
		case oldast.ASTKinds.DE_8: { //brackets
			newnode = new newast.DE_Brack(parent)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			break
		}
		case oldast.ASTKinds.DE_9: { //name
			newnode = new newast.DE_Name(parent, node.name.value, node.posS, node.posE)
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
		//TODO change dummypos to actual position - why didn't i???
		case oldast.ASTKinds.DE1_1: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, "->", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_2: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, "<->", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_3: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, "&", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_4: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, "|", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_5: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, "=", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_6: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, "!=", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_7: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, ">=", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_8: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, "<=", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_9: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, ">", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_10: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, "<", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_11: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, ":", dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_12: newnode = new newast.DE_Function_Infix(parent, 6); newnode.function = new newast.Function_Infix(newnode, (node as oldast.DE1_12).func.value, dummyPos, dummyPos); insertLRNodeDE(newnode); newnode.right = convertDataExp(node.dataExp, newnode); break
		case oldast.ASTKinds.DE1_13: {			
			newnode = new newast.DE_Tuple(parent)
			insertLRNodeDE(newnode)
			switch(node.objects.length){
				case 1: {
					newnode.right = convertDataExp(node.objects[0].dataExp, newnode)
					break
				}
				case 2: {
					newnode.right = new newast.DE_Tuple(newnode); var child = newnode.right as newast.DE_Tuple
					child.left = convertDataExp(node.objects[1].dataExp, child)
					child.left = convertDataExp(node.objects[2].dataExp, child)
					break
				}
				default: {
					newnode.right = new newast.DE_Tuple(newnode);
					var curnode = newnode.right as newast.DE_Tuple
					for(let i = 1; ; i++){
						curnode.left = convertDataExp(node.objects[i].dataExp, curnode)
						//on the second last chlid, set right to the last child instead of being another TE_Product
						if(i == node.objects.length - 2){
							curnode.right = convertDataExp(node.objects[i+1].dataExp, curnode)
							break
						}
						curnode.right = new newast.DE_Tuple(curnode)
						curnode = curnode.right as newast.DE_Tuple
					}
					break
				}
			}
			newnode.dataExps = flattenDE(newnode)
			break
		}
	}
}

function insertLRNodeDE(node: newast.DE_Tuple | newast.DE_Function_Infix): void{
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
			node.left = newChild
		}
		case newast.ASTKinds.DE_Infix:
			node = node as newast.DE_Function_Infix
			node.left = newChild
	}

	//border of new node and new parent
	node.parent = newParent
}

function convertAlias(node: oldast.Alias, parent: newast.Node): newast.Alias{
	switch(node.kind){
		case oldast.ASTKinds.Alias_1: { //alias list
			let newnode = new newast.Alias_List(parent, node.nameFirst.value, node.pos1E, node.pos1S)
			let arglist: string[] = []
			if(node.argFirst != null){
				arglist.push(node.argFirst.value)
			}
			arglist.push(...node.argsMore.map(arg => arg.name.value))
			newnode.argNames = arglist
			return newnode
		}
		case oldast.ASTKinds.Alias_2: { //alias data
			let newnode = new newast.Alias_Data(parent, node.name.value, node.posS, node.posE)
			newnode.dataExp = convertDataExp(node.dataExp, newnode)
			return newnode
		}
	}
}