# TODOS

Grammar
- DE set constructions ("partial" and "set")

Semantic Reasoning
- check variable types when calling a process
- variable binding rules
- multiline comments

Syntax Highlighting
- get comments highlighting green
- add custom colours (want to differentiate constant and variable, and have a unique colour for alias that isn't orange)

Known Bugs
- in general, make syntax highlighting more reliable when there are syntax/semantic errors in the code
- SPE_Choice can escape out of SPE_Brack
- when changing document, the highlighting doesn't switch to the new one until you edit it

Code Cleanup/Optimisation (less important)
- remove TE_Brack because the final AST structure implies brackets anyway, and it may be annoying in some cases to have it there
- if possible, remove the left/right nodes in some structures that are leftover from rotation
- try and get TE_Function to be better so that I can use it as the type of Function, which I currently don't do
- ideally replace the forced (x as y) type conversions with something else, maybe type guard functions
- probaby redo how multiple documents (as in, import) work
- rethink how ast node classes are instantiated to make code less messy