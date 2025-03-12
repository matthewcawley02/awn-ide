"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.Parser = exports.Infix = exports.NameChar = exports.NameString_2 = exports.NameString_1 = exports.Name = exports.TypeName = exports.DE1_13 = exports.DE1_12 = exports.DE1_11 = exports.DE1_10 = exports.DE1_9 = exports.DE1_8 = exports.DE1_7 = exports.DE1_6 = exports.DE1_5 = exports.DE1_4 = exports.DE1_3 = exports.DE1_2 = exports.DE1_1 = exports.DE_9 = exports.DE_8 = exports.DE_7 = exports.DE_6 = exports.DE_5 = exports.DE_4 = exports.DE_3 = exports.DE_2 = exports.DE_1 = exports.SPE1 = exports.SPE_11 = exports.SPE_10 = exports.SPE_9 = exports.SPE_8 = exports.SPE_7 = exports.SPE_6 = exports.SPE_5 = exports.SPE_4 = exports.SPE_3 = exports.SPE_2 = exports.SPE_1 = exports.TE1_3 = exports.TE1_2 = exports.TE1_1 = exports.TE_4 = exports.TE_3 = exports.TE_2 = exports.TE_1 = exports.ASTKinds = void 0;
exports.SyntaxErr = void 0;
var ASTKinds;
(function (ASTKinds) {
    ASTKinds["AWNRoot"] = "AWNRoot";
    ASTKinds["Block_1"] = "Block_1";
    ASTKinds["Block_2"] = "Block_2";
    ASTKinds["Block_3"] = "Block_3";
    ASTKinds["Block_4"] = "Block_4";
    ASTKinds["Block_5"] = "Block_5";
    ASTKinds["Block_6"] = "Block_6";
    ASTKinds["Block_7"] = "Block_7";
    ASTKinds["Block_8"] = "Block_8";
    ASTKinds["Block_9"] = "Block_9";
    ASTKinds["Include"] = "Include";
    ASTKinds["Type"] = "Type";
    ASTKinds["Type_$0"] = "Type_$0";
    ASTKinds["ConVar_1"] = "ConVar_1";
    ASTKinds["ConVar_2"] = "ConVar_2";
    ASTKinds["ConVar_$0"] = "ConVar_$0";
    ASTKinds["Function_1"] = "Function_1";
    ASTKinds["Function_2"] = "Function_2";
    ASTKinds["Process_1"] = "Process_1";
    ASTKinds["Process_2"] = "Process_2";
    ASTKinds["Process_$0"] = "Process_$0";
    ASTKinds["Alias_1"] = "Alias_1";
    ASTKinds["Alias_2"] = "Alias_2";
    ASTKinds["Alias_$0"] = "Alias_$0";
    ASTKinds["TE_1"] = "TE_1";
    ASTKinds["TE_2"] = "TE_2";
    ASTKinds["TE_3"] = "TE_3";
    ASTKinds["TE_4"] = "TE_4";
    ASTKinds["TE1_1"] = "TE1_1";
    ASTKinds["TE1_2"] = "TE1_2";
    ASTKinds["TE1_3"] = "TE1_3";
    ASTKinds["TE1_$0"] = "TE1_$0";
    ASTKinds["SPE_1"] = "SPE_1";
    ASTKinds["SPE_2"] = "SPE_2";
    ASTKinds["SPE_3"] = "SPE_3";
    ASTKinds["SPE_4"] = "SPE_4";
    ASTKinds["SPE_5"] = "SPE_5";
    ASTKinds["SPE_6"] = "SPE_6";
    ASTKinds["SPE_7"] = "SPE_7";
    ASTKinds["SPE_8"] = "SPE_8";
    ASTKinds["SPE_9"] = "SPE_9";
    ASTKinds["SPE_10"] = "SPE_10";
    ASTKinds["SPE_11"] = "SPE_11";
    ASTKinds["SPE_$0"] = "SPE_$0";
    ASTKinds["SPE_$1"] = "SPE_$1";
    ASTKinds["SPE1"] = "SPE1";
    ASTKinds["DE_1"] = "DE_1";
    ASTKinds["DE_2"] = "DE_2";
    ASTKinds["DE_3"] = "DE_3";
    ASTKinds["DE_4"] = "DE_4";
    ASTKinds["DE_5"] = "DE_5";
    ASTKinds["DE_6"] = "DE_6";
    ASTKinds["DE_7"] = "DE_7";
    ASTKinds["DE_8"] = "DE_8";
    ASTKinds["DE_9"] = "DE_9";
    ASTKinds["DE_$0_1"] = "DE_$0_1";
    ASTKinds["DE_$0_2"] = "DE_$0_2";
    ASTKinds["DE1_1"] = "DE1_1";
    ASTKinds["DE1_2"] = "DE1_2";
    ASTKinds["DE1_3"] = "DE1_3";
    ASTKinds["DE1_4"] = "DE1_4";
    ASTKinds["DE1_5"] = "DE1_5";
    ASTKinds["DE1_6"] = "DE1_6";
    ASTKinds["DE1_7"] = "DE1_7";
    ASTKinds["DE1_8"] = "DE1_8";
    ASTKinds["DE1_9"] = "DE1_9";
    ASTKinds["DE1_10"] = "DE1_10";
    ASTKinds["DE1_11"] = "DE1_11";
    ASTKinds["DE1_12"] = "DE1_12";
    ASTKinds["DE1_13"] = "DE1_13";
    ASTKinds["DE1_$0"] = "DE1_$0";
    ASTKinds["TypeName"] = "TypeName";
    ASTKinds["Name"] = "Name";
    ASTKinds["NameString_1"] = "NameString_1";
    ASTKinds["NameString_2"] = "NameString_2";
    ASTKinds["NameString_$0"] = "NameString_$0";
    ASTKinds["NameChar"] = "NameChar";
    ASTKinds["Infix"] = "Infix";
    ASTKinds["ws"] = "ws";
    ASTKinds["ws_$0_1"] = "ws_$0_1";
    ASTKinds["ws_$0_2"] = "ws_$0_2";
    ASTKinds["os"] = "os";
    ASTKinds["os_$0_1"] = "os_$0_1";
    ASTKinds["os_$0_2"] = "os_$0_2";
    ASTKinds["os_$0_3"] = "os_$0_3";
    ASTKinds["sp"] = "sp";
    ASTKinds["sp_$0_1"] = "sp_$0_1";
    ASTKinds["sp_$0_2"] = "sp_$0_2";
    ASTKinds["sp_$0_3"] = "sp_$0_3";
    ASTKinds["lb"] = "lb";
    ASTKinds["lb_$0_1"] = "lb_$0_1";
    ASTKinds["lb_$0_2"] = "lb_$0_2";
    ASTKinds["$EOF"] = "$EOF";
})(ASTKinds || (exports.ASTKinds = ASTKinds = {}));
class TE_1 {
    constructor(typeExpr, typeExprMore) {
        this.kind = ASTKinds.TE_1;
        this.typeExpr = typeExpr;
        this.typeExprMore = typeExprMore;
        this.typetype = (() => {
            return "brackets";
        })();
    }
}
exports.TE_1 = TE_1;
class TE_2 {
    constructor(pos, typeExpr, typeExprMore) {
        this.kind = ASTKinds.TE_2;
        this.pos = pos;
        this.typeExpr = typeExpr;
        this.typeExprMore = typeExprMore;
        this.typetype = (() => {
            return "pow";
        })();
    }
}
exports.TE_2 = TE_2;
class TE_3 {
    constructor(typeExpr, typeExprMore) {
        this.kind = ASTKinds.TE_3;
        this.typeExpr = typeExpr;
        this.typeExprMore = typeExprMore;
        this.typetype = (() => {
            return "list";
        })();
    }
}
exports.TE_3 = TE_3;
class TE_4 {
    constructor(posS, typename, posE, typeExprMore) {
        this.kind = ASTKinds.TE_4;
        this.posS = posS;
        this.typename = typename;
        this.posE = posE;
        this.typeExprMore = typeExprMore;
        this.typetype = (() => {
            return "name";
        })();
    }
}
exports.TE_4 = TE_4;
class TE1_1 {
    constructor(typeExpr, typeExprMore) {
        this.kind = ASTKinds.TE1_1;
        this.typeExpr = typeExpr;
        this.typeExprMore = typeExprMore;
        this.typetype = (() => {
            return "function";
        })();
    }
}
exports.TE1_1 = TE1_1;
class TE1_2 {
    constructor(typeExpr, typeExprMore) {
        this.kind = ASTKinds.TE1_2;
        this.typeExpr = typeExpr;
        this.typeExprMore = typeExprMore;
        this.typetype = (() => {
            return "part_function";
        })();
    }
}
exports.TE1_2 = TE1_2;
class TE1_3 {
    constructor(products, typeExprMore) {
        this.kind = ASTKinds.TE1_3;
        this.products = products;
        this.typeExprMore = typeExprMore;
        this.typetype = (() => {
            return "product";
        })();
    }
}
exports.TE1_3 = TE1_3;
class SPE_1 {
    constructor(posDES, dataExp, posDEE, proc, procMore) {
        this.kind = ASTKinds.SPE_1;
        this.posDES = posDES;
        this.dataExp = dataExp;
        this.posDEE = posDEE;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "guard";
        })();
    }
}
exports.SPE_1 = SPE_1;
class SPE_2 {
    constructor(posA, name, posC, dataExpAssignment, posD, proc, procMore) {
        this.kind = ASTKinds.SPE_2;
        this.posA = posA;
        this.name = name;
        this.posC = posC;
        this.dataExpAssignment = dataExpAssignment;
        this.posD = posD;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "assignment";
        })();
    }
}
exports.SPE_2 = SPE_2;
class SPE_3 {
    constructor(pos, posA, dataExpL, posB, dataExpR, posC, procL, procR, procMore) {
        this.kind = ASTKinds.SPE_3;
        this.pos = pos;
        this.posA = posA;
        this.dataExpL = dataExpL;
        this.posB = posB;
        this.dataExpR = dataExpR;
        this.posC = posC;
        this.procL = procL;
        this.procR = procR;
        this.procMore = procMore;
        this.procType = (() => {
            return "unicast";
        })();
    }
}
exports.SPE_3 = SPE_3;
class SPE_4 {
    constructor(pos, posA, dataExp, posB, proc, procMore) {
        this.kind = ASTKinds.SPE_4;
        this.pos = pos;
        this.posA = posA;
        this.dataExp = dataExp;
        this.posB = posB;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "broadcast";
        })();
    }
}
exports.SPE_4 = SPE_4;
class SPE_5 {
    constructor(pos, posA, dataExpL, posB, dataExpR, posC, proc, procMore) {
        this.kind = ASTKinds.SPE_5;
        this.pos = pos;
        this.posA = posA;
        this.dataExpL = dataExpL;
        this.posB = posB;
        this.dataExpR = dataExpR;
        this.posC = posC;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "groupcast";
        })();
    }
}
exports.SPE_5 = SPE_5;
class SPE_6 {
    constructor(pos, posA, dataExp, posB, proc, procMore) {
        this.kind = ASTKinds.SPE_6;
        this.pos = pos;
        this.posA = posA;
        this.dataExp = dataExp;
        this.posB = posB;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "send";
        })();
    }
}
exports.SPE_6 = SPE_6;
class SPE_7 {
    constructor(pos, posA, dataExp, posB, proc, procMore) {
        this.kind = ASTKinds.SPE_7;
        this.pos = pos;
        this.posA = posA;
        this.dataExp = dataExp;
        this.posB = posB;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "deliver";
        })();
    }
}
exports.SPE_7 = SPE_7;
class SPE_8 {
    constructor(pos, posS, name, posE, dataExpList, proc, procMore) {
        this.kind = ASTKinds.SPE_8;
        this.pos = pos;
        this.posS = posS;
        this.name = name;
        this.posE = posE;
        this.dataExpList = dataExpList;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "receive";
        })();
    }
}
exports.SPE_8 = SPE_8;
class SPE_9 {
    constructor(proc, procMore) {
        this.kind = ASTKinds.SPE_9;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "brackets";
        })();
    }
}
exports.SPE_9 = SPE_9;
class SPE_10 {
    constructor(posS, name, posE, dataExpFirst, dataExpW, procMore) {
        this.kind = ASTKinds.SPE_10;
        this.posS = posS;
        this.name = name;
        this.posE = posE;
        this.dataExpFirst = dataExpFirst;
        this.dataExpW = dataExpW;
        this.procMore = procMore;
        this.procType = (() => {
            return "call";
        })();
    }
}
exports.SPE_10 = SPE_10;
class SPE_11 {
    constructor(posS, name, posE, procMore) {
        this.kind = ASTKinds.SPE_11;
        this.posS = posS;
        this.name = name;
        this.posE = posE;
        this.procMore = procMore;
        this.procType = (() => {
            return "name";
        })();
    }
}
exports.SPE_11 = SPE_11;
class SPE1 {
    constructor(proc, procMore) {
        this.kind = ASTKinds.SPE1;
        this.proc = proc;
        this.procMore = procMore;
        this.procType = (() => {
            return "choice";
        })();
    }
}
exports.SPE1 = SPE1;
class DE_1 {
    constructor(posS, name, posE, dataExpLeft, dataExpRight, dataExpMore) {
        this.kind = ASTKinds.DE_1;
        this.posS = posS;
        this.name = name;
        this.posE = posE;
        this.dataExpLeft = dataExpLeft;
        this.dataExpRight = dataExpRight;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "partial";
        })();
    }
}
exports.DE_1 = DE_1;
class DE_2 {
    constructor(posS, name, posE, dataExpRight, dataExpMore) {
        this.kind = ASTKinds.DE_2;
        this.posS = posS;
        this.name = name;
        this.posE = posE;
        this.dataExpRight = dataExpRight;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "set";
        })();
    }
}
exports.DE_2 = DE_2;
class DE_3 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE_3;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "singleton";
        })();
    }
}
exports.DE_3 = DE_3;
class DE_4 {
    constructor(pos, posS, name, dataExp, dataExpMore) {
        this.kind = ASTKinds.DE_4;
        this.pos = pos;
        this.posS = posS;
        this.name = name;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "lambda";
        })();
    }
}
exports.DE_4 = DE_4;
class DE_5 {
    constructor(pos, posS, name, dataExp, dataExpMore) {
        this.kind = ASTKinds.DE_5;
        this.pos = pos;
        this.posS = posS;
        this.name = name;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "forall";
        })();
    }
}
exports.DE_5 = DE_5;
class DE_6 {
    constructor(pos, posS, name, dataExp, dataExpMore) {
        this.kind = ASTKinds.DE_6;
        this.pos = pos;
        this.posS = posS;
        this.name = name;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "exists";
        })();
    }
}
exports.DE_6 = DE_6;
class DE_7 {
    constructor(posN, name, posS, dataExp, posE, dataExpMore) {
        this.kind = ASTKinds.DE_7;
        this.posN = posN;
        this.name = name;
        this.posS = posS;
        this.dataExp = dataExp;
        this.posE = posE;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "function";
        })();
    }
}
exports.DE_7 = DE_7;
class DE_8 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE_8;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "brackets";
        })();
    }
}
exports.DE_8 = DE_8;
class DE_9 {
    constructor(posS, name, posE, dataExpMore) {
        this.kind = ASTKinds.DE_9;
        this.posS = posS;
        this.name = name;
        this.posE = posE;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "name";
        })();
    }
}
exports.DE_9 = DE_9;
class DE1_1 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_1;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "implicates";
        })();
    }
}
exports.DE1_1 = DE1_1;
class DE1_2 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_2;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "iff";
        })();
    }
}
exports.DE1_2 = DE1_2;
class DE1_3 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_3;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "and";
        })();
    }
}
exports.DE1_3 = DE1_3;
class DE1_4 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_4;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "or";
        })();
    }
}
exports.DE1_4 = DE1_4;
class DE1_5 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_5;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "eq";
        })();
    }
}
exports.DE1_5 = DE1_5;
class DE1_6 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_6;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "neq";
        })();
    }
}
exports.DE1_6 = DE1_6;
class DE1_7 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_7;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "gtreq";
        })();
    }
}
exports.DE1_7 = DE1_7;
class DE1_8 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_8;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "leseq";
        })();
    }
}
exports.DE1_8 = DE1_8;
class DE1_9 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_9;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "gtr";
        })();
    }
}
exports.DE1_9 = DE1_9;
class DE1_10 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_10;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "les";
        })();
    }
}
exports.DE1_10 = DE1_10;
class DE1_11 {
    constructor(dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_11;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "col";
        })();
    }
}
exports.DE1_11 = DE1_11;
class DE1_12 {
    constructor(func, dataExp, dataExpMore) {
        this.kind = ASTKinds.DE1_12;
        this.func = func;
        this.dataExp = dataExp;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "infix";
        })();
    }
}
exports.DE1_12 = DE1_12;
class DE1_13 {
    constructor(objects, dataExpMore) {
        this.kind = ASTKinds.DE1_13;
        this.objects = objects;
        this.dataExpMore = dataExpMore;
        this.dataExpType = (() => {
            return "tuple";
        })();
    }
}
exports.DE1_13 = DE1_13;
class TypeName {
    constructor(name) {
        this.kind = ASTKinds.TypeName;
        this.name = name;
        this.value = (() => {
            return name.value;
        })();
    }
}
exports.TypeName = TypeName;
class Name {
    constructor(nameString) {
        this.kind = ASTKinds.Name;
        this.nameString = nameString;
        this.value = (() => {
            return nameString.value;
        })();
    }
}
exports.Name = Name;
class NameString_1 {
    constructor(prefix) {
        this.kind = ASTKinds.NameString_1;
        this.prefix = prefix;
        this.value = (() => {
            return prefix.pre.map(NameChar => NameChar.value).join('') + '.' + prefix.post.value;
        })();
    }
}
exports.NameString_1 = NameString_1;
class NameString_2 {
    constructor(final) {
        this.kind = ASTKinds.NameString_2;
        this.final = final;
        this.value = (() => {
            return final.map(NameChar => NameChar.value).join('');
        })();
    }
}
exports.NameString_2 = NameString_2;
class NameChar {
    constructor(char) {
        this.kind = ASTKinds.NameChar;
        this.char = char;
        this.value = (() => {
            return char;
        })();
    }
}
exports.NameChar = NameChar;
class Infix {
    constructor(char) {
        this.kind = ASTKinds.Infix;
        this.char = char;
        this.value = (() => {
            return char.join("");
        })();
    }
}
exports.Infix = Infix;
class Parser {
    constructor(input) {
        this.negating = false;
        this.memoSafe = true;
        this.$scope$TE1$memo = new Map();
        this.$scope$DE1$memo = new Map();
        this.pos = { overallPos: 0, line: 1, offset: 0 };
        this.input = input;
    }
    reset(pos) {
        this.pos = pos;
    }
    finished() {
        return this.pos.overallPos === this.input.length;
    }
    clearMemos() {
        this.$scope$TE1$memo.clear();
        this.$scope$DE1$memo.clear();
    }
    matchAWNRoot($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$block;
            let $$res = null;
            if (true
                && this.matchws($$dpth + 1, $$cr) !== null
                && ($scope$block = this.loop(() => this.matchBlock($$dpth + 1, $$cr), 0, -1)) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && this.match$EOF($$cr) !== null) {
                $$res = { kind: ASTKinds.AWNRoot, block: $scope$block };
            }
            return $$res;
        });
    }
    matchBlock($$dpth, $$cr) {
        return this.choice([
            () => this.matchBlock_1($$dpth + 1, $$cr),
            () => this.matchBlock_2($$dpth + 1, $$cr),
            () => this.matchBlock_3($$dpth + 1, $$cr),
            () => this.matchBlock_4($$dpth + 1, $$cr),
            () => this.matchBlock_5($$dpth + 1, $$cr),
            () => this.matchBlock_6($$dpth + 1, $$cr),
            () => this.matchBlock_7($$dpth + 1, $$cr),
            () => this.matchBlock_8($$dpth + 1, $$cr),
            () => this.matchBlock_9($$dpth + 1, $$cr),
        ]);
    }
    matchBlock_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$include;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:INCLUDES:)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$include = this.loopPlus(() => this.matchInclude($$dpth + 1, $$cr))) !== null) {
                $$res = { kind: ASTKinds.Block_1, pos: $scope$pos, include: $scope$include };
            }
            return $$res;
        });
    }
    matchBlock_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$include;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:include)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$include = this.matchInclude($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Block_2, pos: $scope$pos, include: $scope$include };
            }
            return $$res;
        });
    }
    matchBlock_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$type;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:TYPES:)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$type = this.loopPlus(() => this.matchType($$dpth + 1, $$cr))) !== null) {
                $$res = { kind: ASTKinds.Block_3, pos: $scope$pos, type: $scope$type };
            }
            return $$res;
        });
    }
    matchBlock_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$var;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:VARIABLES:)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$var = this.loopPlus(() => this.matchConVar($$dpth + 1, $$cr))) !== null) {
                $$res = { kind: ASTKinds.Block_4, pos: $scope$pos, var: $scope$var };
            }
            return $$res;
        });
    }
    matchBlock_5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$const;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:CONSTANTS:)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$const = this.loopPlus(() => this.matchConVar($$dpth + 1, $$cr))) !== null) {
                $$res = { kind: ASTKinds.Block_5, pos: $scope$pos, const: $scope$const };
            }
            return $$res;
        });
    }
    matchBlock_6($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$func;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:FUNCTIONS:)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$func = this.loopPlus(() => this.matchFunction($$dpth + 1, $$cr))) !== null) {
                $$res = { kind: ASTKinds.Block_6, pos: $scope$pos, func: $scope$func };
            }
            return $$res;
        });
    }
    matchBlock_7($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$proc;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:PROCESSES:)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$proc = this.loopPlus(() => this.matchProcess($$dpth + 1, $$cr))) !== null) {
                $$res = { kind: ASTKinds.Block_7, pos: $scope$pos, proc: $scope$proc };
            }
            return $$res;
        });
    }
    matchBlock_8($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$proc;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:proc)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchProcess($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Block_8, pos: $scope$pos, proc: $scope$proc };
            }
            return $$res;
        });
    }
    matchBlock_9($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$alias;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:ALIASES:)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$alias = this.loopPlus(() => this.matchAlias($$dpth + 1, $$cr))) !== null) {
                $$res = { kind: ASTKinds.Block_9, pos: $scope$pos, alias: $scope$alias };
            }
            return $$res;
        });
    }
    matchInclude($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Include, posS: $scope$posS, name: $scope$name, posE: $scope$posE };
            }
            return $$res;
        });
    }
    matchType($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$typeName;
            let $scope$posE;
            let $scope$typeExprW;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$typeName = this.matchTypeName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && (($scope$typeExprW = this.matchType_$0($$dpth + 1, $$cr)) || true)
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Type, posS: $scope$posS, typeName: $scope$typeName, posE: $scope$posE, typeExprW: $scope$typeExprW };
            }
            return $$res;
        });
    }
    matchType_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$typeExpr;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\=)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Type_$0, typeExpr: $scope$typeExpr };
            }
            return $$res;
        });
    }
    matchConVar($$dpth, $$cr) {
        return this.choice([
            () => this.matchConVar_1($$dpth + 1, $$cr),
            () => this.matchConVar_2($$dpth + 1, $$cr),
        ]);
    }
    matchConVar_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$typeExpr;
            let $scope$posS;
            let $scope$nameFirst;
            let $scope$posE;
            let $scope$namesMore;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$nameFirst = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && ($scope$namesMore = this.loop(() => this.matchConVar_$0($$dpth + 1, $$cr), 0, -1)) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.ConVar_1, typeExpr: $scope$typeExpr, posS: $scope$posS, nameFirst: $scope$nameFirst, posE: $scope$posE, namesMore: $scope$namesMore };
            }
            return $$res;
        });
    }
    matchConVar_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$typeExpr;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\: )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.ConVar_2, posS: $scope$posS, name: $scope$name, posE: $scope$posE, typeExpr: $scope$typeExpr };
            }
            return $$res;
        });
    }
    matchConVar_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null) {
                $$res = { kind: ASTKinds.ConVar_$0, posS: $scope$posS, name: $scope$name, posE: $scope$posE };
            }
            return $$res;
        });
    }
    matchFunction($$dpth, $$cr) {
        return this.choice([
            () => this.matchFunction_1($$dpth + 1, $$cr),
            () => this.matchFunction_2($$dpth + 1, $$cr),
        ]);
    }
    matchFunction_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$typeExpr;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\: )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Function_1, posS: $scope$posS, name: $scope$name, posE: $scope$posE, typeExpr: $scope$typeExpr };
            }
            return $$res;
        });
    }
    matchFunction_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$typeExpr;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchInfix($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\: )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Function_2, posS: $scope$posS, name: $scope$name, posE: $scope$posE, typeExpr: $scope$typeExpr };
            }
            return $$res;
        });
    }
    matchProcess($$dpth, $$cr) {
        return this.choice([
            () => this.matchProcess_1($$dpth + 1, $$cr),
            () => this.matchProcess_2($$dpth + 1, $$cr),
        ]);
    }
    matchProcess_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos1S;
            let $scope$nameFirst;
            let $scope$pos1E;
            let $scope$pos2S;
            let $scope$argFirst;
            let $scope$pos2E;
            let $scope$argsMore;
            let $scope$proc;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$pos1S = this.mark()) !== null
                && ($scope$nameFirst = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$pos1E = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$pos2S = this.mark()) !== null
                && (($scope$argFirst = this.matchName($$dpth + 1, $$cr)) || true)
                && ($scope$pos2E = this.mark()) !== null
                && ($scope$argsMore = this.loop(() => this.matchProcess_$0($$dpth + 1, $$cr), 0, -1)) !== null
                && this.regexAccept(String.raw `(?:\) )`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\:\=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Process_1, pos1S: $scope$pos1S, nameFirst: $scope$nameFirst, pos1E: $scope$pos1E, pos2S: $scope$pos2S, argFirst: $scope$argFirst, pos2E: $scope$pos2E, argsMore: $scope$argsMore, proc: $scope$proc };
            }
            return $$res;
        });
    }
    matchProcess_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$proc;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\:\=)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Process_2, posS: $scope$posS, name: $scope$name, posE: $scope$posE, proc: $scope$proc };
            }
            return $$res;
        });
    }
    matchProcess_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null) {
                $$res = { kind: ASTKinds.Process_$0, posS: $scope$posS, name: $scope$name, posE: $scope$posE };
            }
            return $$res;
        });
    }
    matchAlias($$dpth, $$cr) {
        return this.choice([
            () => this.matchAlias_1($$dpth + 1, $$cr),
            () => this.matchAlias_2($$dpth + 1, $$cr),
        ]);
    }
    matchAlias_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos1S;
            let $scope$nameFirst;
            let $scope$pos1E;
            let $scope$pos2S;
            let $scope$argFirst;
            let $scope$pos2E;
            let $scope$argsMore;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$pos1S = this.mark()) !== null
                && ($scope$nameFirst = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$pos1E = this.mark()) !== null
                && this.regexAccept(String.raw `(?: \:\=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\")`, "", $$dpth + 1, $$cr) !== null
                && ($scope$pos2S = this.mark()) !== null
                && (($scope$argFirst = this.matchName($$dpth + 1, $$cr)) || true)
                && ($scope$pos2E = this.mark()) !== null
                && ($scope$argsMore = this.loop(() => this.matchAlias_$0($$dpth + 1, $$cr), 0, -1)) !== null
                && this.regexAccept(String.raw `(?:\")`, "", $$dpth + 1, $$cr) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Alias_1, pos1S: $scope$pos1S, nameFirst: $scope$nameFirst, pos1E: $scope$pos1E, pos2S: $scope$pos2S, argFirst: $scope$argFirst, pos2E: $scope$pos2E, argsMore: $scope$argsMore };
            }
            return $$res;
        });
    }
    matchAlias_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$dataExp;
            let $$res = null;
            if (true
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.regexAccept(String.raw `(?: \:\=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\")`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\")`, "", $$dpth + 1, $$cr) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Alias_2, posS: $scope$posS, name: $scope$name, posE: $scope$posE, dataExp: $scope$dataExp };
            }
            return $$res;
        });
    }
    matchAlias_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null) {
                $$res = { kind: ASTKinds.Alias_$0, posS: $scope$posS, name: $scope$name, posE: $scope$posE };
            }
            return $$res;
        });
    }
    matchTE($$dpth, $$cr) {
        return this.choice([
            () => this.matchTE_1($$dpth + 1, $$cr),
            () => this.matchTE_2($$dpth + 1, $$cr),
            () => this.matchTE_3($$dpth + 1, $$cr),
            () => this.matchTE_4($$dpth + 1, $$cr),
        ]);
    }
    matchTE_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$typeExpr;
            let $scope$typeExprMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && (($scope$typeExprMore = this.matchTE1($$dpth + 1, $$cr)) || true)) {
                $$res = new TE_1($scope$typeExpr, $scope$typeExprMore);
            }
            return $$res;
        });
    }
    matchTE_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$typeExpr;
            let $scope$typeExprMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:Pow)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && (($scope$typeExprMore = this.matchTE1($$dpth + 1, $$cr)) || true)) {
                $$res = new TE_2($scope$pos, $scope$typeExpr, $scope$typeExprMore);
            }
            return $$res;
        });
    }
    matchTE_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$typeExpr;
            let $scope$typeExprMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\])`, "", $$dpth + 1, $$cr) !== null
                && (($scope$typeExprMore = this.matchTE1($$dpth + 1, $$cr)) || true)) {
                $$res = new TE_3($scope$typeExpr, $scope$typeExprMore);
            }
            return $$res;
        });
    }
    matchTE_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$typename;
            let $scope$posE;
            let $scope$typeExprMore;
            let $$res = null;
            if (true
                && ($scope$posS = this.mark()) !== null
                && ($scope$typename = this.matchTypeName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && (($scope$typeExprMore = this.matchTE1($$dpth + 1, $$cr)) || true)) {
                $$res = new TE_4($scope$posS, $scope$typename, $scope$posE, $scope$typeExprMore);
            }
            return $$res;
        });
    }
    matchTE1($$dpth, $$cr) {
        const fn = () => {
            return this.choice([
                () => this.matchTE1_1($$dpth + 1, $$cr),
                () => this.matchTE1_2($$dpth + 1, $$cr),
                () => this.matchTE1_3($$dpth + 1, $$cr),
            ]);
        };
        const $scope$pos = this.mark();
        const memo = this.$scope$TE1$memo.get($scope$pos.overallPos);
        if (memo !== undefined) {
            this.reset(memo[1]);
            return memo[0];
        }
        const $scope$oldMemoSafe = this.memoSafe;
        this.memoSafe = false;
        this.$scope$TE1$memo.set($scope$pos.overallPos, [null, $scope$pos]);
        let lastRes = null;
        let lastPos = $scope$pos;
        for (;;) {
            this.reset($scope$pos);
            const res = fn();
            const end = this.mark();
            if (end.overallPos <= lastPos.overallPos)
                break;
            lastRes = res;
            lastPos = end;
            this.$scope$TE1$memo.set($scope$pos.overallPos, [lastRes, lastPos]);
        }
        this.reset(lastPos);
        this.memoSafe = $scope$oldMemoSafe;
        return lastRes;
    }
    matchTE1_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$typeExpr;
            let $scope$typeExprMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?: \-> )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && (($scope$typeExprMore = this.matchTE1($$dpth + 1, $$cr)) || true)) {
                $$res = new TE1_1($scope$typeExpr, $scope$typeExprMore);
            }
            return $$res;
        });
    }
    matchTE1_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$typeExpr;
            let $scope$typeExprMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?: \+-> )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null
                && (($scope$typeExprMore = this.matchTE1($$dpth + 1, $$cr)) || true)) {
                $$res = new TE1_2($scope$typeExpr, $scope$typeExprMore);
            }
            return $$res;
        });
    }
    matchTE1_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$products;
            let $scope$typeExprMore;
            let $$res = null;
            if (true
                && ($scope$products = this.loop(() => this.matchTE1_$0($$dpth + 1, $$cr), 0, -1)) !== null
                && (($scope$typeExprMore = this.matchTE1($$dpth + 1, $$cr)) || true)) {
                $$res = new TE1_3($scope$products, $scope$typeExprMore);
            }
            return $$res;
        });
    }
    matchTE1_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$typeExpr;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?: x )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$typeExpr = this.matchTE($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.TE1_$0, pos: $scope$pos, typeExpr: $scope$typeExpr };
            }
            return $$res;
        });
    }
    matchSPE($$dpth, $$cr) {
        return this.choice([
            () => this.matchSPE_1($$dpth + 1, $$cr),
            () => this.matchSPE_2($$dpth + 1, $$cr),
            () => this.matchSPE_3($$dpth + 1, $$cr),
            () => this.matchSPE_4($$dpth + 1, $$cr),
            () => this.matchSPE_5($$dpth + 1, $$cr),
            () => this.matchSPE_6($$dpth + 1, $$cr),
            () => this.matchSPE_7($$dpth + 1, $$cr),
            () => this.matchSPE_8($$dpth + 1, $$cr),
            () => this.matchSPE_9($$dpth + 1, $$cr),
            () => this.matchSPE_10($$dpth + 1, $$cr),
            () => this.matchSPE_11($$dpth + 1, $$cr),
        ]);
    }
    matchSPE_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posDES;
            let $scope$dataExp;
            let $scope$posDEE;
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$posDES = this.mark()) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posDEE = this.mark()) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\])`, "", $$dpth + 1, $$cr) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_1($scope$posDES, $scope$dataExp, $scope$posDEE, $scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posA;
            let $scope$name;
            let $scope$posC;
            let $scope$dataExpAssignment;
            let $scope$posD;
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[\[)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$posA = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\:\=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$posC = this.mark()) !== null
                && ($scope$dataExpAssignment = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posD = this.mark()) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\]\])`, "", $$dpth + 1, $$cr) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_2($scope$posA, $scope$name, $scope$posC, $scope$dataExpAssignment, $scope$posD, $scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posA;
            let $scope$dataExpL;
            let $scope$posB;
            let $scope$dataExpR;
            let $scope$posC;
            let $scope$procL;
            let $scope$procR;
            let $scope$procMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:unicast)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posA = this.mark()) !== null
                && ($scope$dataExpL = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posB = this.mark()) !== null
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExpR = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posC = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && ($scope$procL = this.matchSPE($$dpth + 1, $$cr)) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:>)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$procR = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_3($scope$pos, $scope$posA, $scope$dataExpL, $scope$posB, $scope$dataExpR, $scope$posC, $scope$procL, $scope$procR, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posA;
            let $scope$dataExp;
            let $scope$posB;
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:broadcast)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posA = this.mark()) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posB = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_4($scope$pos, $scope$posA, $scope$dataExp, $scope$posB, $scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posA;
            let $scope$dataExpL;
            let $scope$posB;
            let $scope$dataExpR;
            let $scope$posC;
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:groupcast)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posA = this.mark()) !== null
                && ($scope$dataExpL = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posB = this.mark()) !== null
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExpR = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posC = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_5($scope$pos, $scope$posA, $scope$dataExpL, $scope$posB, $scope$dataExpR, $scope$posC, $scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_6($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posA;
            let $scope$dataExp;
            let $scope$posB;
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:send)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posA = this.mark()) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posB = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_6($scope$pos, $scope$posA, $scope$dataExp, $scope$posB, $scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_7($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posA;
            let $scope$dataExp;
            let $scope$posB;
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:deliver)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posA = this.mark()) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posB = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_7($scope$pos, $scope$posA, $scope$dataExp, $scope$posB, $scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_8($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$dataExpList;
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:receive)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && ($scope$dataExpList = this.loop(() => this.matchSPE_$0($$dpth + 1, $$cr), 0, -1)) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_8($scope$pos, $scope$posS, $scope$name, $scope$posE, $scope$dataExpList, $scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_9($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && this.matchws($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_9($scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_10($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$dataExpFirst;
            let $scope$dataExpW;
            let $scope$procMore;
            let $$res = null;
            if (true
                && ($scope$posS = this.mark()) !== null
                && this.negate(() => this.regexAccept(String.raw `(?:unicast)`, "", $$dpth + 1, $$cr)) !== null
                && this.negate(() => this.regexAccept(String.raw `(?:broadcast)`, "", $$dpth + 1, $$cr)) !== null
                && this.negate(() => this.regexAccept(String.raw `(?:groupcast)`, "", $$dpth + 1, $$cr)) !== null
                && this.negate(() => this.regexAccept(String.raw `(?:send)`, "", $$dpth + 1, $$cr)) !== null
                && this.negate(() => this.regexAccept(String.raw `(?:deliver)`, "", $$dpth + 1, $$cr)) !== null
                && this.negate(() => this.regexAccept(String.raw `(?:receive)`, "", $$dpth + 1, $$cr)) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && (($scope$dataExpFirst = this.matchDE($$dpth + 1, $$cr)) || true)
                && ($scope$dataExpW = this.loop(() => this.matchSPE_$1($$dpth + 1, $$cr), 0, -1)) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_10($scope$posS, $scope$name, $scope$posE, $scope$dataExpFirst, $scope$dataExpW, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_11($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$procMore;
            let $$res = null;
            if (true
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE_11($scope$posS, $scope$name, $scope$posE, $scope$procMore);
            }
            return $$res;
        });
    }
    matchSPE_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\])`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_$0, dataExp: $scope$dataExp };
            }
            return $$res;
        });
    }
    matchSPE_$1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.SPE_$1, dataExp: $scope$dataExp };
            }
            return $$res;
        });
    }
    matchSPE1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$proc;
            let $scope$procMore;
            let $$res = null;
            if (true
                && this.matchlb($$dpth + 1, $$cr) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\+)`, "", $$dpth + 1, $$cr) !== null
                && this.matchlb($$dpth + 1, $$cr) !== null
                && this.matchsp($$dpth + 1, $$cr) !== null
                && ($scope$proc = this.matchSPE($$dpth + 1, $$cr)) !== null
                && (($scope$procMore = this.matchSPE1($$dpth + 1, $$cr)) || true)) {
                $$res = new SPE1($scope$proc, $scope$procMore);
            }
            return $$res;
        });
    }
    matchDE($$dpth, $$cr) {
        return this.choice([
            () => this.matchDE_1($$dpth + 1, $$cr),
            () => this.matchDE_2($$dpth + 1, $$cr),
            () => this.matchDE_3($$dpth + 1, $$cr),
            () => this.matchDE_4($$dpth + 1, $$cr),
            () => this.matchDE_5($$dpth + 1, $$cr),
            () => this.matchDE_6($$dpth + 1, $$cr),
            () => this.matchDE_7($$dpth + 1, $$cr),
            () => this.matchDE_8($$dpth + 1, $$cr),
            () => this.matchDE_9($$dpth + 1, $$cr),
        ]);
    }
    matchDE_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$dataExpLeft;
            let $scope$dataExpRight;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:{)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExpLeft = this.matchDE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?: | )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExpRight = this.matchDE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:})`, "", $$dpth + 1, $$cr) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_1($scope$posS, $scope$name, $scope$posE, $scope$dataExpLeft, $scope$dataExpRight, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$dataExpRight;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:{)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.regexAccept(String.raw `(?: | )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExpRight = this.matchDE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:})`, "", $$dpth + 1, $$cr) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_2($scope$posS, $scope$name, $scope$posE, $scope$dataExpRight, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:{)`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:})`, "", $$dpth + 1, $$cr) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_3($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posS;
            let $scope$name;
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:lambda )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:. )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_4($scope$pos, $scope$posS, $scope$name, $scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posS;
            let $scope$name;
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:forall )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:. )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_5($scope$pos, $scope$posS, $scope$name, $scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_6($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$posS;
            let $scope$name;
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.regexAccept(String.raw `(?:exists )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:. )`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_6($scope$pos, $scope$posS, $scope$name, $scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_7($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posN;
            let $scope$name;
            let $scope$posS;
            let $scope$dataExp;
            let $scope$posE;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && ($scope$posN = this.mark()) !== null
                && ($scope$name = this.matchDE_$0($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$posS = this.mark()) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_7($scope$posN, $scope$name, $scope$posS, $scope$dataExp, $scope$posE, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_8($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_8($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_9($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$posS;
            let $scope$name;
            let $scope$posE;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && ($scope$posS = this.mark()) !== null
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null
                && ($scope$posE = this.mark()) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE_9($scope$posS, $scope$name, $scope$posE, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE_$0($$dpth, $$cr) {
        return this.choice([
            () => this.matchDE_$0_1($$dpth + 1, $$cr),
            () => this.matchDE_$0_2($$dpth + 1, $$cr),
        ]);
    }
    matchDE_$0_1($$dpth, $$cr) {
        return this.matchName($$dpth + 1, $$cr);
    }
    matchDE_$0_2($$dpth, $$cr) {
        return this.matchInfix($$dpth + 1, $$cr);
    }
    matchDE1($$dpth, $$cr) {
        const fn = () => {
            return this.choice([
                () => this.matchDE1_1($$dpth + 1, $$cr),
                () => this.matchDE1_2($$dpth + 1, $$cr),
                () => this.matchDE1_3($$dpth + 1, $$cr),
                () => this.matchDE1_4($$dpth + 1, $$cr),
                () => this.matchDE1_5($$dpth + 1, $$cr),
                () => this.matchDE1_6($$dpth + 1, $$cr),
                () => this.matchDE1_7($$dpth + 1, $$cr),
                () => this.matchDE1_8($$dpth + 1, $$cr),
                () => this.matchDE1_9($$dpth + 1, $$cr),
                () => this.matchDE1_10($$dpth + 1, $$cr),
                () => this.matchDE1_11($$dpth + 1, $$cr),
                () => this.matchDE1_12($$dpth + 1, $$cr),
                () => this.matchDE1_13($$dpth + 1, $$cr),
            ]);
        };
        const $scope$pos = this.mark();
        const memo = this.$scope$DE1$memo.get($scope$pos.overallPos);
        if (memo !== undefined) {
            this.reset(memo[1]);
            return memo[0];
        }
        const $scope$oldMemoSafe = this.memoSafe;
        this.memoSafe = false;
        this.$scope$DE1$memo.set($scope$pos.overallPos, [null, $scope$pos]);
        let lastRes = null;
        let lastPos = $scope$pos;
        for (;;) {
            this.reset($scope$pos);
            const res = fn();
            const end = this.mark();
            if (end.overallPos <= lastPos.overallPos)
                break;
            lastRes = res;
            lastPos = end;
            this.$scope$DE1$memo.set($scope$pos.overallPos, [lastRes, lastPos]);
        }
        this.reset(lastPos);
        this.memoSafe = $scope$oldMemoSafe;
        return lastRes;
    }
    matchDE1_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\->)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_1($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:<\->)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_2($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\&)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_3($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:||)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_4($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_5($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_6($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\!\=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_6($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_7($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:>\=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_7($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_8($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:<\=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_8($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_9($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:>)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_9($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_10($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:<)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_10($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_11($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?::)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_11($scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_12($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$func;
            let $scope$dataExp;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$func = this.matchInfix($$dpth + 1, $$cr)) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_12($scope$func, $scope$dataExp, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_13($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$objects;
            let $scope$dataExpMore;
            let $$res = null;
            if (true
                && ($scope$objects = this.loop(() => this.matchDE1_$0($$dpth + 1, $$cr), 0, -1)) !== null
                && (($scope$dataExpMore = this.matchDE1($$dpth + 1, $$cr)) || true)) {
                $$res = new DE1_13($scope$objects, $scope$dataExpMore);
            }
            return $$res;
        });
    }
    matchDE1_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pos;
            let $scope$dataExp;
            let $$res = null;
            if (true
                && ($scope$pos = this.mark()) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchos($$dpth + 1, $$cr) !== null
                && ($scope$dataExp = this.matchDE($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.DE1_$0, pos: $scope$pos, dataExp: $scope$dataExp };
            }
            return $$res;
        });
    }
    matchTypeName($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$name;
            let $$res = null;
            if (true
                && ($scope$name = this.matchName($$dpth + 1, $$cr)) !== null) {
                $$res = new TypeName($scope$name);
            }
            return $$res;
        });
    }
    matchName($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$nameString;
            let $$res = null;
            if (true
                && ($scope$nameString = this.matchNameString($$dpth + 1, $$cr)) !== null) {
                $$res = new Name($scope$nameString);
            }
            return $$res;
        });
    }
    matchNameString($$dpth, $$cr) {
        return this.choice([
            () => this.matchNameString_1($$dpth + 1, $$cr),
            () => this.matchNameString_2($$dpth + 1, $$cr),
        ]);
    }
    matchNameString_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$prefix;
            let $$res = null;
            if (true
                && ($scope$prefix = this.matchNameString_$0($$dpth + 1, $$cr)) !== null) {
                $$res = new NameString_1($scope$prefix);
            }
            return $$res;
        });
    }
    matchNameString_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$final;
            let $$res = null;
            if (true
                && ($scope$final = this.loopPlus(() => this.matchNameChar($$dpth + 1, $$cr))) !== null) {
                $$res = new NameString_2($scope$final);
            }
            return $$res;
        });
    }
    matchNameString_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$pre;
            let $scope$dot;
            let $scope$post;
            let $$res = null;
            if (true
                && ($scope$pre = this.loop(() => this.matchNameChar($$dpth + 1, $$cr), 0, -1)) !== null
                && ($scope$dot = this.regexAccept(String.raw `(?:\.)`, "", $$dpth + 1, $$cr)) !== null
                && ($scope$post = this.matchNameString($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.NameString_$0, pre: $scope$pre, dot: $scope$dot, post: $scope$post };
            }
            return $$res;
        });
    }
    matchNameChar($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$char;
            let $$res = null;
            if (true
                && ($scope$char = this.regexAccept(String.raw `(?:[a-zA-Z0-9_])`, "", $$dpth + 1, $$cr)) !== null) {
                $$res = new NameChar($scope$char);
            }
            return $$res;
        });
    }
    matchInfix($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $scope$char;
            let $$res = null;
            if (true
                && ($scope$char = this.loopPlus(() => this.regexAccept(String.raw `(?:[\*\+\=\-<>\!\&\\|])`, "", $$dpth + 1, $$cr))) !== null) {
                $$res = new Infix($scope$char);
            }
            return $$res;
        });
    }
    matchws($$dpth, $$cr) {
        return this.loop(() => this.matchws_$0($$dpth + 1, $$cr), 0, -1);
    }
    matchws_$0($$dpth, $$cr) {
        return this.choice([
            () => this.matchws_$0_1($$dpth + 1, $$cr),
            () => this.matchws_$0_2($$dpth + 1, $$cr),
        ]);
    }
    matchws_$0_1($$dpth, $$cr) {
        return this.matchsp($$dpth + 1, $$cr);
    }
    matchws_$0_2($$dpth, $$cr) {
        return this.matchlb($$dpth + 1, $$cr);
    }
    matchos($$dpth, $$cr) {
        return this.loop(() => this.matchos_$0($$dpth + 1, $$cr), 0, -1);
    }
    matchos_$0($$dpth, $$cr) {
        return this.choice([
            () => this.matchos_$0_1($$dpth + 1, $$cr),
            () => this.matchos_$0_2($$dpth + 1, $$cr),
            () => this.matchos_$0_3($$dpth + 1, $$cr),
        ]);
    }
    matchos_$0_1($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?: )`, "", $$dpth + 1, $$cr);
    }
    matchos_$0_2($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:\t)`, "", $$dpth + 1, $$cr);
    }
    matchos_$0_3($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:\v)`, "", $$dpth + 1, $$cr);
    }
    matchsp($$dpth, $$cr) {
        return this.loopPlus(() => this.matchsp_$0($$dpth + 1, $$cr));
    }
    matchsp_$0($$dpth, $$cr) {
        return this.choice([
            () => this.matchsp_$0_1($$dpth + 1, $$cr),
            () => this.matchsp_$0_2($$dpth + 1, $$cr),
            () => this.matchsp_$0_3($$dpth + 1, $$cr),
        ]);
    }
    matchsp_$0_1($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?: )`, "", $$dpth + 1, $$cr);
    }
    matchsp_$0_2($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:\t)`, "", $$dpth + 1, $$cr);
    }
    matchsp_$0_3($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:\v)`, "", $$dpth + 1, $$cr);
    }
    matchlb($$dpth, $$cr) {
        return this.loopPlus(() => this.matchlb_$0($$dpth + 1, $$cr));
    }
    matchlb_$0($$dpth, $$cr) {
        return this.choice([
            () => this.matchlb_$0_1($$dpth + 1, $$cr),
            () => this.matchlb_$0_2($$dpth + 1, $$cr),
        ]);
    }
    matchlb_$0_1($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr);
    }
    matchlb_$0_2($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:\r\n)`, "", $$dpth + 1, $$cr);
    }
    test() {
        const mrk = this.mark();
        const res = this.matchAWNRoot(0);
        const ans = res !== null;
        this.reset(mrk);
        return ans;
    }
    parse() {
        const mrk = this.mark();
        const res = this.matchAWNRoot(0);
        if (res)
            return { ast: res, errs: [] };
        this.reset(mrk);
        const rec = new ErrorTracker();
        this.clearMemos();
        this.matchAWNRoot(0, rec);
        const err = rec.getErr();
        return { ast: res, errs: err !== null ? [err] : [] };
    }
    mark() {
        return this.pos;
    }
    // @ts-ignore: loopPlus may not be called
    loopPlus(func) {
        return this.loop(func, 1, -1);
    }
    loop(func, lb, ub) {
        const mrk = this.mark();
        const res = [];
        while (ub === -1 || res.length < ub) {
            const preMrk = this.mark();
            const t = func();
            if (t === null || this.pos.overallPos === preMrk.overallPos) {
                break;
            }
            res.push(t);
        }
        if (res.length >= lb) {
            return res;
        }
        this.reset(mrk);
        return null;
    }
    run($$dpth, fn) {
        const mrk = this.mark();
        const res = fn();
        if (res !== null)
            return res;
        this.reset(mrk);
        return null;
    }
    // @ts-ignore: choice may not be called
    choice(fns) {
        for (const f of fns) {
            const res = f();
            if (res !== null) {
                return res;
            }
        }
        return null;
    }
    regexAccept(match, mods, dpth, cr) {
        return this.run(dpth, () => {
            const reg = new RegExp(match, "y" + mods);
            const mrk = this.mark();
            reg.lastIndex = mrk.overallPos;
            const res = this.tryConsume(reg);
            if (cr) {
                cr.record(mrk, res, {
                    kind: "RegexMatch",
                    // We substring from 3 to len - 1 to strip off the
                    // non-capture group syntax added as a WebKit workaround
                    literal: match.substring(3, match.length - 1),
                    negated: this.negating,
                });
            }
            return res;
        });
    }
    tryConsume(reg) {
        const res = reg.exec(this.input);
        if (res) {
            let lineJmp = 0;
            let lind = -1;
            for (let i = 0; i < res[0].length; ++i) {
                if (res[0][i] === "\n") {
                    ++lineJmp;
                    lind = i;
                }
            }
            this.pos = {
                overallPos: reg.lastIndex,
                line: this.pos.line + lineJmp,
                offset: lind === -1 ? this.pos.offset + res[0].length : (res[0].length - lind - 1)
            };
            return res[0];
        }
        return null;
    }
    // @ts-ignore: noConsume may not be called
    noConsume(fn) {
        const mrk = this.mark();
        const res = fn();
        this.reset(mrk);
        return res;
    }
    // @ts-ignore: negate may not be called
    negate(fn) {
        const mrk = this.mark();
        const oneg = this.negating;
        this.negating = !oneg;
        const res = fn();
        this.negating = oneg;
        this.reset(mrk);
        return res === null ? true : null;
    }
    // @ts-ignore: Memoise may not be used
    memoise(rule, memo) {
        const $scope$pos = this.mark();
        const $scope$memoRes = memo.get($scope$pos.overallPos);
        if (this.memoSafe && $scope$memoRes !== undefined) {
            this.reset($scope$memoRes[1]);
            return $scope$memoRes[0];
        }
        const $scope$result = rule();
        if (this.memoSafe)
            memo.set($scope$pos.overallPos, [$scope$result, this.mark()]);
        return $scope$result;
    }
    match$EOF(et) {
        const res = this.finished() ? { kind: ASTKinds.$EOF } : null;
        if (et)
            et.record(this.mark(), res, { kind: "EOF", negated: this.negating });
        return res;
    }
}
exports.Parser = Parser;
function parse(s) {
    const p = new Parser(s);
    return p.parse();
}
exports.parse = parse;
class SyntaxErr {
    constructor(pos, expmatches) {
        this.pos = pos;
        this.expmatches = [...expmatches];
    }
    toString() {
        return `Syntax Error at line ${this.pos.line}:${this.pos.offset}. Expected one of ${this.expmatches.map(x => x.kind === "EOF" ? " EOF" : ` ${x.negated ? 'not ' : ''}'${x.literal}'`)}`;
    }
}
exports.SyntaxErr = SyntaxErr;
class ErrorTracker {
    constructor() {
        this.mxpos = { overallPos: -1, line: -1, offset: -1 };
        this.regexset = new Set();
        this.pmatches = [];
    }
    record(pos, result, att) {
        if ((result === null) === att.negated)
            return;
        if (pos.overallPos > this.mxpos.overallPos) {
            this.mxpos = pos;
            this.pmatches = [];
            this.regexset.clear();
        }
        if (this.mxpos.overallPos === pos.overallPos) {
            if (att.kind === "RegexMatch") {
                if (!this.regexset.has(att.literal))
                    this.pmatches.push(att);
                this.regexset.add(att.literal);
            }
            else {
                this.pmatches.push(att);
            }
        }
    }
    getErr() {
        if (this.mxpos.overallPos !== -1)
            return new SyntaxErr(this.mxpos, this.pmatches);
        return null;
    }
}
//# sourceMappingURL=parser.js.map