Many possible AST nodes, not going to list them all here.
Note that there are two scripts in the .peg file, essentially - the grammar itself, and the AST script inserted everywhere.

There are three types of AST nodes:
1. a grammar rule match
2. a match to a curly brace {} section
3. a match to a + or * rule (being the parent of a list).

Each node has the following properties:
- the node's name, which is what i named it in the AST script '=' instruction
- the 'kind' field, which is the name of the grammar rule the match occurred on (regardless of which type of node it is). + a possible suffix added by the parser
- possibly a value field, which I will define for any node that makes sense to have a value (e.g. variable with a name)
- possibly other fields that I am forced to define for the parser to work (in situations where I have to give every object inside a {} its own field)

PRECEDENCE STUFF

- when 2+ productions require specific precedence relative to each other i need to spell it out by making extra tiers for the lower prods
- productions i had to move to the right because of left recursion will need to be checked first, as in 
  e.g. a rule L B?, with B = Prod R, Prod should be the parent of L and R (if it exists) rather than L the parent of "Prod R"

How to convert a tree with LR nodes to a correct tree

1. We have a regular tree, where any node may additionally contain an LR node "attached" to it. This node could possibly be moved up.
2. Perform a L-to-R treewalk on the tree by iterating from the root. We completely set up each node before recursively calling the 
   child, so that each node has access to all information of its direct ancestors while being set up, which is necessary for moving 
   LR nodes up the tree.
3. Regular (non-LR) nodes are simple, just set them up and have children equal the return value of a recursive function call.
4. For LR nodes, we don't know what the parent will be, so we don't have them return into a parent like for regular nodes. Instead we
   set them up, then manually move them up the tree, using precedence to determine how far. (note that brackets here act as barriers,
   you can't go beyond an encapsulating bracket, so we also need to check that). All the parent-child links are set here manually except for making the new parent have this new node as a child, because that's difficult.
5. When returning any node, we check whether it has been given a different parent by an LR node moving immediately past it. If so, it
   means this node has already has its parent set properly and we shouldn't be returning it. BUT, the ORIGINAL parent of this node
   wouldn't have its child set properly, as that would be the aforementioned new LR node. So we instead return that.

convertNode(oldnode: oldASTnode, parent: newASTnode): newnode: newASTnode {
   var newnode
   newnode.parent = parent
   for(non-LR children of oldnode){
      newnode.childx = convertNode(child, newnode)
   }
   var returnednode = newnode
   if(oldnode has attached LR child){
      convertLRNode(LRchild, newnode)
   }
   while(returnednode.parent != parent){
      returnednode = returnednode.parent
   }
   return returnednode
}

convertLRNode(oldnode: oldASTnode, parent: newASTnode): void {
   var newnode
   newnode.parent = parent //temporary
   insertLRNode(newnode)
   newnode.right = convertNode(newnode.child, newnode)
}

insertLRNode(node: newASTnode): void {
   var newChild = node
   var newParent = node.parent
   while(true){
      if(node.precedence > newParent.precedence){
         newChild = newParent
         newParent = newParent.parent
      }
      else(break)
   }
   newChild.parent = node
   node.left = newChild
   node.parent = newParent
}