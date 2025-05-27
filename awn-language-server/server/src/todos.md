# TODOS

Syntax Highlighting
- brackets
- have it so if the document goes from correct syntactically -> incorrect syntactically, a delta of the old syntax stays so the entire thing
doesn't go unformatted (can specifically make the new additions since the last correct version be unhighlighted)
- when switching documents, automatically switch highlighting to the now-open document

Hover Information
- comments in the same line as a declaration show up in hover
- rather than using typescript formatting, define awn formatting somehow and use that
- hover information for overloaded names

Code Cleanup/Optimisation (less important)
- remove TE_Brack because the final AST structure implies brackets anyway, and it may be annoying in some cases to have it there
- if possible, remove the left/right nodes in some structures that are leftover from rotation
- ideally replace the forced (x as y) type conversions with something else, maybe type guard functions
