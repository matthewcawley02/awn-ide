# TODOS

Language server
- figure out how to avoid parsing twice for every edit (one for semantic tokens another for validation)
- still send tokens when there are syntax errors
- check for and remove comments

convertAST.ts
- remove TE_Brack because the final AST structure implies brackets anyway, and it may be annoying in some cases to have it there
- if possible, remove the left/right nodes in some structures that are leftover from rotation
- try and get TE_Function to be better so that I can use it as the type of Function, which I currently don't do

check.ts
- ideally replace the forced (x as y) type conversions with something else, maybe type guard functions

Syntax highlighing
- alias



TODO after today
- DE set constructions (partial and "set")
- variable binding rules in processes
- multiline comments and having all comments highlighted green
- in general make syntax highlighting more reliable when there are syntactical/semantic errors in the code
- the default functions isElem, =, !=
- known glitches: 
	- SPE_Choice can escape out of SPE_Brack
	- functions inside functions don't highlight properly
	- when changing document, doesn't change highlighting to this doc automatically (you need to cause a change for it to switch)

TODO order today
1. finish alias properly - semantically and syntax highlighting
2. check the arguments in process calls for validity and repetition
3. variable assignment in processes
4. import