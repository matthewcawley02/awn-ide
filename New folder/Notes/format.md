# Questions/Discussion Points
+ we allow an n-ary addition operator 
   + PH: I am in strong favour of this - we can decide later if we allow proper n-ary or whether it's read left/right associative
+ what do we assume for  TIME: do we have to define ==, <= , +, -, +1, ...?
+ what did we agree on we assume about lists? append,head?
+ projections: are we allow these? or are they self-defined?
   FOr a triple we may have to define pi_2 n = fst(snd(n))
+ in OSPF we have an infix operator (< , <=) on headers - do we allow infix operators - how do we define them
+ do we allow a compressed for all syntax? `forall ips sip._` (as it appears in QSND)
+ do processes have to carry around constants (OSLR) or do they just exist (OSPF)
+ we have PROCESSES and proc, INCLUDES and include, should we also allow VARIABLES and var .... (we do not need to decide now) + look into Weiyou questions
+ OLSR.awn uses `x <= y <= z`; is this okay or should we write `x<=y & y<=z`?
+ what do we do with the keyword `let`
+ so we allow primed variables? (Rob/Ryan replaced them in OLSR)
+ OLSR uses a function `asns` and a variabl `ansn` - is this okay?
+ do we allow variable/function names with symbols/numbers in the first spot? (2hs, -infinity)
+ subtyping (Djurre uses subtypes)
+ Alan Q1: LSDB = `IP +-> TYPE`

# Internally, in-build Notation
## mandatory types
+ `Bool` **RvG what do we want do we want to have meta-level;**
+ `MSG`: mandatory type in T-AWN
+ `DATA`: mandatory type in T-AWN
+ `IP`: mandatory type in T-AWN
+ `TIME`: mandatory type in T-AWN
+ `Pow(TYPE)`: powerset construction
+ `[TYPE] `Lists over a type
+ `TYPE x TYPE`: cross product. **PH: How do we read `A x B x C`?**
+ type synonyms such as `AR    = IP x SQN x TIME`

other types including nat and int need to be defined; in the long run we may create libraries.

## Boolean values
+ constants are denoted by `true` and `false`

## First-oder logic
+ `&`: conjunction
+ `|`: disjunction
+ `!_` negation (does not need parantheses)
+ `_=_`: comparison
+ `_ != _`
+ of course parantheses are allowed as well
+ `exists _ . _`, `forall _. _` **PH: we disallow `forall lt \in ls  . _`, this needs to be written as implication; similar for exists**
+ `->` (used in OLSR) **PH: does this cause a problem with function (I don't think so)**
+ lambda expression (see ROb)
+ `<->`


## Set-theoretic Notation
+ `{_ | _ }`
+ `isElem(_,_)` **RvG,PH not mandatory for the moment - let's list it as isElem**
+ `{x}`: singleton list **PH: do we allow an enumeration?**
+ **PH do we need to predefine union, intersection, set-complement, set difference? (inOSPF we need at least `-`)**
+ set notion for "partial function"
 
## List-theoretic Notation
+ standard library

# Comments
+ Single-line comments are given by two hyphens --
+ Multi-line comments are opened by {* and closed by *}
+ 



# Sections
we use a couple of keywords to indicate/identify sections. They are listed below. The order should not matter. Moreover, we allow multiple sections of the same type

+ `PROCESSES:`
+ `TYPES:`
+ `VARIABLES:`
+ `CONSTANTS:`
+ `PREDICATES:` **PH not sure about this**
+ `ALIASES:`
+ `FUNCTIONS:`
+ `INLCUDES:`


## Processes 
processes are marked by section using the keyword `PROCESSES:` or by `proc` if it's a single process:
 
###Syntax:
+ `proc NAME (vars^*) using vars^+ := BODY `: process declaration, proc is not needed **PH or is it forbidden?** when in a `PROCESSES:`-block; `using vars^+` is optional
+ `[ Boolean expression ]`: guard
+ `[[ _ := _]]`: assignment, left-hand side must be a variable **PH: I guess we are not checking types at the moemnt, are we?**
+ `receive(_).`
+ `send(_). _`
+ `broadcast(_) . _` 
+ `groupcast(_,_) . _`
+ `unicast(_,_) . _ > _`
+  `NAME(expr^*)`: call
+  `_ + _`
+  `deliver( _ )`
+  parantheses

## Types
 space separated list; can be interupted by  comments. For example,
 

##Variables
space separated alternating list of type (TYPE x VARS^+)^*, where VARS^+ is a comma-separated list.
Interruption by comments is fine, as always

+ *PH: should `now` be predefined?*

longer explanation: Variables are declared with the keyword "VARIABLES:". This is followed by a type name, then a whitespace character then the variable name. Many variables of the same type can be declared by using commas to separate them, in this case whitespace characters are ignored to make it easier to comment on the variables. The end is indicated by whitespace and the absence of a comma.


##CONSTANTS
space separated alternating list of type (TYPE x VARS^+)^*, where VARS^+ is a comma-separated list.
Interruption by comments is fine, as always (same format as Variables)

**PH: must/should/can constants have values?**

## Functions:
+ `NAME : TYPE  -> TYPE`: total function **PH: do we want to have colon or not?
+ `NAME : TYPE  +-> TYPE`: partial function
+ **PH: what about functions with no argument?**

`::: MSGx [MSG] -> [MSG]`
 
+ **what's the syntax todefine infix/mixfix notation?**

## ALIASES
+ Aliases are names for longer statements. Where ever the name appears in a process, the longer statement will be inserted and evaluated in that context. The key word "ALIASES:" is used. This is followed by an alias name which is then followed by a statement enclosed in triple quotes (i.e. """ statement """).

## INCLUDES
+ External definitions/libraries can be included using the key word `INCLUDES: PATH^+`. This is then followed by the path to each library, separated by white space. These external definitions will also be concatenated randomly with the files in the main directory.

+ single files can also be included by `include PATH`
# General
+ files are plain ASCII
+ spaces and linebreaks should not matter


