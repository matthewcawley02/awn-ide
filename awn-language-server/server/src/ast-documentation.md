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