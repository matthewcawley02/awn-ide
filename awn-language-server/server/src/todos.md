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



TODO
- DE set constructions (partial and "set")
- SPE variable expressions and variable checking in SPE_Call
- Comments
- Imports
- two small known glitches: SPE_Choice can escape out of SPE_Brack, and functions inside functions don't highlight properly