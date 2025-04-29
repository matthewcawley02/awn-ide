# TODOS

Grammar
- DE set constructions ("partial" and "set")

Semantic Reasoning
- variable binding rules

Syntax Highlighting
- brackets
- have it so if the document goes from correct syntactically -> incorrect syntactically, a delta of the old syntax stays so the entire thing
doesn't go unformatted (can specifically make the new additions since the last correct version be unhighlighted)
- when switching documents, automatically switch highlighting to the now-open document

Hover Information
- comments in the same line as a declaration show up in hover
- rather than using typescript formatting, define awn formatting somehow and use that
- hover information for overloaded names

Known Bugs
- SPE_Choice can escape out of SPE_Brack

Code Cleanup/Optimisation (less important)
- remove TE_Brack because the final AST structure implies brackets anyway, and it may be annoying in some cases to have it there
- if possible, remove the left/right nodes in some structures that are leftover from rotation
- try and get TE_Function to be better so that I can use it as the type of Function, which I currently don't do
- ideally replace the forced (x as y) type conversions with something else, maybe type guard functions
- rethink how ast node classes are instantiated to make code less messy
- the get_x functions can probably be improved