"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxErr = exports.parse = exports.Parser = exports.ASTKinds = void 0;
var ASTKinds;
(function (ASTKinds) {
    ASTKinds["AWN"] = "AWN";
    ASTKinds["AWN_$0"] = "AWN_$0";
    ASTKinds["Block_1"] = "Block_1";
    ASTKinds["Block_2"] = "Block_2";
    ASTKinds["Block_3"] = "Block_3";
    ASTKinds["Block_4"] = "Block_4";
    ASTKinds["Block_5"] = "Block_5";
    ASTKinds["Block_6"] = "Block_6";
    ASTKinds["Block_7"] = "Block_7";
    ASTKinds["Block_8"] = "Block_8";
    ASTKinds["Block_$0"] = "Block_$0";
    ASTKinds["Block_$1"] = "Block_$1";
    ASTKinds["Block_$2"] = "Block_$2";
    ASTKinds["Block_$3"] = "Block_$3";
    ASTKinds["Block_$4"] = "Block_$4";
    ASTKinds["Block_$5"] = "Block_$5";
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
    ASTKinds["TE_1"] = "TE_1";
    ASTKinds["TE_2"] = "TE_2";
    ASTKinds["TE_3"] = "TE_3";
    ASTKinds["TE_4"] = "TE_4";
    ASTKinds["TE_5"] = "TE_5";
    ASTKinds["TE_6"] = "TE_6";
    ASTKinds["TE_7"] = "TE_7";
    ASTKinds["TE_$0"] = "TE_$0";
    ASTKinds["BTE_1"] = "BTE_1";
    ASTKinds["BTE_2"] = "BTE_2";
    ASTKinds["BTE_AUX_1"] = "BTE_AUX_1";
    ASTKinds["BTE_AUX_2"] = "BTE_AUX_2";
    ASTKinds["BTE_AUX_3"] = "BTE_AUX_3";
    ASTKinds["BTE_AUX_4"] = "BTE_AUX_4";
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
    ASTKinds["SPE_12"] = "SPE_12";
    ASTKinds["SPE_$0"] = "SPE_$0";
    ASTKinds["SPE_$1"] = "SPE_$1";
    ASTKinds["SPE_$2"] = "SPE_$2";
    ASTKinds["DE_1"] = "DE_1";
    ASTKinds["DE_2"] = "DE_2";
    ASTKinds["DE_3"] = "DE_3";
    ASTKinds["DE_4"] = "DE_4";
    ASTKinds["DE_5"] = "DE_5";
    ASTKinds["DE_6"] = "DE_6";
    ASTKinds["DE_7"] = "DE_7";
    ASTKinds["DE_8"] = "DE_8";
    ASTKinds["DE_9"] = "DE_9";
    ASTKinds["DE_10"] = "DE_10";
    ASTKinds["DE_11"] = "DE_11";
    ASTKinds["DE_12"] = "DE_12";
    ASTKinds["DE_13"] = "DE_13";
    ASTKinds["DE_14"] = "DE_14";
    ASTKinds["DE_15"] = "DE_15";
    ASTKinds["DE_16"] = "DE_16";
    ASTKinds["DE_17"] = "DE_17";
    ASTKinds["DE_18"] = "DE_18";
    ASTKinds["DE_19"] = "DE_19";
    ASTKinds["DE_20"] = "DE_20";
    ASTKinds["DE_21"] = "DE_21";
    ASTKinds["DE_$0"] = "DE_$0";
    ASTKinds["TypeName"] = "TypeName";
    ASTKinds["Name_1"] = "Name_1";
    ASTKinds["Name_2"] = "Name_2";
    ASTKinds["Name_3"] = "Name_3";
    ASTKinds["NameString"] = "NameString";
    ASTKinds["NameString_$0_1"] = "NameString_$0_1";
    ASTKinds["NameString_$0_2"] = "NameString_$0_2";
    ASTKinds["NameChar"] = "NameChar";
    ASTKinds["Infix"] = "Infix";
    ASTKinds["_"] = "_";
    ASTKinds["$EOF"] = "$EOF";
})(ASTKinds || (exports.ASTKinds = ASTKinds = {}));
class Parser {
    constructor(input) {
        this.negating = false;
        this.memoSafe = true;
        this.$scope$TE$memo = new Map();
        this.$scope$SPE$memo = new Map();
        this.$scope$DE$memo = new Map();
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
        this.$scope$TE$memo.clear();
        this.$scope$SPE$memo.clear();
        this.$scope$DE$memo.clear();
    }
    matchAWN($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.match_($$dpth + 1, $$cr) !== null
                && this.loop(() => this.matchAWN_$0($$dpth + 1, $$cr), 0, -1) !== null
                && this.match$EOF($$cr) !== null) {
                $$res = { kind: ASTKinds.AWN, };
            }
            return $$res;
        });
    }
    matchAWN_$0($$dpth, $$cr) {
        return this.matchBlock($$dpth + 1, $$cr);
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
        ]);
    }
    matchBlock_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:INCLUDES:)`, "", $$dpth + 1, $$cr) !== null
                && this.loopPlus(() => this.matchBlock_$0($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Block_1, };
            }
            return $$res;
        });
    }
    matchBlock_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:include)`, "", $$dpth + 1, $$cr) !== null
                && this.matchInclude($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Block_2, };
            }
            return $$res;
        });
    }
    matchBlock_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:TYPES:)`, "", $$dpth + 1, $$cr) !== null
                && this.loopPlus(() => this.matchBlock_$1($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Block_3, };
            }
            return $$res;
        });
    }
    matchBlock_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:VARIABLES:)`, "", $$dpth + 1, $$cr) !== null
                && this.loopPlus(() => this.matchBlock_$2($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Block_4, };
            }
            return $$res;
        });
    }
    matchBlock_5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:CONSTANTS:)`, "", $$dpth + 1, $$cr) !== null
                && this.loopPlus(() => this.matchBlock_$3($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Block_5, };
            }
            return $$res;
        });
    }
    matchBlock_6($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:FUNCTIONS:)`, "", $$dpth + 1, $$cr) !== null
                && this.loopPlus(() => this.matchBlock_$4($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Block_6, };
            }
            return $$res;
        });
    }
    matchBlock_7($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:PROCESSES:)`, "", $$dpth + 1, $$cr) !== null
                && this.loopPlus(() => this.matchBlock_$5($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.Block_7, };
            }
            return $$res;
        });
    }
    matchBlock_8($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:proc)`, "", $$dpth + 1, $$cr) !== null
                && this.matchProcess($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Block_8, };
            }
            return $$res;
        });
    }
    matchBlock_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchInclude($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Block_$0, };
            }
            return $$res;
        });
    }
    matchBlock_$1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchType($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Block_$1, };
            }
            return $$res;
        });
    }
    matchBlock_$2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchConVar($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Block_$2, };
            }
            return $$res;
        });
    }
    matchBlock_$3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchConVar($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Block_$3, };
            }
            return $$res;
        });
    }
    matchBlock_$4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchFunction($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Block_$4, };
            }
            return $$res;
        });
    }
    matchBlock_$5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchProcess($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Block_$5, };
            }
            return $$res;
        });
    }
    matchInclude($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Include, };
            }
            return $$res;
        });
    }
    matchType($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchTypeName($$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && ((this.matchType_$0($$dpth + 1, $$cr)) || true)
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Type, };
            }
            return $$res;
        });
    }
    matchType_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Type_$0, };
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
            let $$res = null;
            if (true
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.loop(() => this.matchConVar_$0($$dpth + 1, $$cr), 0, -1) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.ConVar_1, };
            }
            return $$res;
        });
    }
    matchConVar_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?::)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.ConVar_2, };
            }
            return $$res;
        });
    }
    matchConVar_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.ConVar_$0, };
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
            let $$res = null;
            if (true
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?::)`, "", $$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Function_1, };
            }
            return $$res;
        });
    }
    matchFunction_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchInfix($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?::)`, "", $$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && this.matchBTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Function_2, };
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
            let $$res = null;
            if (true
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ((this.matchName($$dpth + 1, $$cr)) || true)
                && this.loopPlus(() => this.matchProcess_$0($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?::=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Process_1, };
            }
            return $$res;
        });
    }
    matchProcess_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?::=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Process_2, };
            }
            return $$res;
        });
    }
    matchProcess_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.Process_$0, };
            }
            return $$res;
        });
    }
    matchTE($$dpth, $$cr) {
        const fn = () => {
            return this.choice([
                () => this.matchTE_1($$dpth + 1, $$cr),
                () => this.matchTE_2($$dpth + 1, $$cr),
                () => this.matchTE_3($$dpth + 1, $$cr),
                () => this.matchTE_4($$dpth + 1, $$cr),
                () => this.matchTE_5($$dpth + 1, $$cr),
                () => this.matchTE_6($$dpth + 1, $$cr),
                () => this.matchTE_7($$dpth + 1, $$cr),
            ]);
        };
        const $scope$pos = this.mark();
        const memo = this.$scope$TE$memo.get($scope$pos.overallPos);
        if (memo !== undefined) {
            this.reset(memo[1]);
            return memo[0];
        }
        const $scope$oldMemoSafe = this.memoSafe;
        this.memoSafe = false;
        this.$scope$TE$memo.set($scope$pos.overallPos, [null, $scope$pos]);
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
            this.$scope$TE$memo.set($scope$pos.overallPos, [lastRes, lastPos]);
        }
        this.reset(lastPos);
        this.memoSafe = $scope$oldMemoSafe;
        return lastRes;
    }
    matchTE_1($$dpth, $$cr) {
        return this.matchTypeName($$dpth + 1, $$cr);
    }
    matchTE_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.loop(() => this.matchTE_$0($$dpth + 1, $$cr), 0, -1) !== null) {
                $$res = { kind: ASTKinds.TE_2, };
            }
            return $$res;
        });
    }
    matchTE_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:->)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.TE_3, };
            }
            return $$res;
        });
    }
    matchTE_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\+->)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.TE_4, };
            }
            return $$res;
        });
    }
    matchTE_5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:Pow)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.TE_5, };
            }
            return $$res;
        });
    }
    matchTE_6($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\])`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.TE_6, };
            }
            return $$res;
        });
    }
    matchTE_7($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.TE_7, };
            }
            return $$res;
        });
    }
    matchTE_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:x)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.TE_$0, };
            }
            return $$res;
        });
    }
    matchBTE($$dpth, $$cr) {
        return this.choice([
            () => this.matchBTE_1($$dpth + 1, $$cr),
            () => this.matchBTE_2($$dpth + 1, $$cr),
        ]);
    }
    matchBTE_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchBTE_AUX($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:x)`, "", $$dpth + 1, $$cr) !== null
                && this.matchBTE_AUX($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:->)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.BTE_1, };
            }
            return $$res;
        });
    }
    matchBTE_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchBTE_AUX($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:x)`, "", $$dpth + 1, $$cr) !== null
                && this.matchBTE_AUX($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\+->)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.BTE_2, };
            }
            return $$res;
        });
    }
    matchBTE_AUX($$dpth, $$cr) {
        return this.choice([
            () => this.matchBTE_AUX_1($$dpth + 1, $$cr),
            () => this.matchBTE_AUX_2($$dpth + 1, $$cr),
            () => this.matchBTE_AUX_3($$dpth + 1, $$cr),
            () => this.matchBTE_AUX_4($$dpth + 1, $$cr),
        ]);
    }
    matchBTE_AUX_1($$dpth, $$cr) {
        return this.matchTypeName($$dpth + 1, $$cr);
    }
    matchBTE_AUX_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.BTE_AUX_2, };
            }
            return $$res;
        });
    }
    matchBTE_AUX_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:Pow)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.BTE_AUX_3, };
            }
            return $$res;
        });
    }
    matchBTE_AUX_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, "", $$dpth + 1, $$cr) !== null
                && this.matchTE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\])`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.BTE_AUX_4, };
            }
            return $$res;
        });
    }
    matchSPE($$dpth, $$cr) {
        const fn = () => {
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
                () => this.matchSPE_12($$dpth + 1, $$cr),
            ]);
        };
        const $scope$pos = this.mark();
        const memo = this.$scope$SPE$memo.get($scope$pos.overallPos);
        if (memo !== undefined) {
            this.reset(memo[1]);
            return memo[0];
        }
        const $scope$oldMemoSafe = this.memoSafe;
        this.memoSafe = false;
        this.$scope$SPE$memo.set($scope$pos.overallPos, [null, $scope$pos]);
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
            this.$scope$SPE$memo.set($scope$pos.overallPos, [lastRes, lastPos]);
        }
        this.reset(lastPos);
        this.memoSafe = $scope$oldMemoSafe;
        return lastRes;
    }
    matchSPE_1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && ((this.matchDE($$dpth + 1, $$cr)) || true)
                && this.loopPlus(() => this.matchSPE_$0($$dpth + 1, $$cr)) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_1, };
            }
            return $$res;
        });
    }
    matchSPE_2($$dpth, $$cr) {
        return this.matchName($$dpth + 1, $$cr);
    }
    matchSPE_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\])`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_3, };
            }
            return $$res;
        });
    }
    matchSPE_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[\[)`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.loop(() => this.matchSPE_$1($$dpth + 1, $$cr), 0, -1) !== null
                && this.regexAccept(String.raw `(?::=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\]\])`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_4, };
            }
            return $$res;
        });
    }
    matchSPE_5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchSPE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\+)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_5, };
            }
            return $$res;
        });
    }
    matchSPE_6($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:unicast)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:>)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_6, };
            }
            return $$res;
        });
    }
    matchSPE_7($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:broadcast)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_7, };
            }
            return $$res;
        });
    }
    matchSPE_8($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:groupcast)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_8, };
            }
            return $$res;
        });
    }
    matchSPE_9($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:send)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_9, };
            }
            return $$res;
        });
    }
    matchSPE_10($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:deliver)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_10, };
            }
            return $$res;
        });
    }
    matchSPE_11($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:receive)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.loop(() => this.matchSPE_$2($$dpth + 1, $$cr), 0, -1) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\n)`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_11, };
            }
            return $$res;
        });
    }
    matchSPE_12($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchSPE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_12, };
            }
            return $$res;
        });
    }
    matchSPE_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_$0, };
            }
            return $$res;
        });
    }
    matchSPE_$1($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\])`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_$1, };
            }
            return $$res;
        });
    }
    matchSPE_$2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\[)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\])`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.SPE_$2, };
            }
            return $$res;
        });
    }
    matchDE($$dpth, $$cr) {
        const fn = () => {
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
                () => this.matchDE_10($$dpth + 1, $$cr),
                () => this.matchDE_11($$dpth + 1, $$cr),
                () => this.matchDE_12($$dpth + 1, $$cr),
                () => this.matchDE_13($$dpth + 1, $$cr),
                () => this.matchDE_14($$dpth + 1, $$cr),
                () => this.matchDE_15($$dpth + 1, $$cr),
                () => this.matchDE_16($$dpth + 1, $$cr),
                () => this.matchDE_17($$dpth + 1, $$cr),
                () => this.matchDE_18($$dpth + 1, $$cr),
                () => this.matchDE_19($$dpth + 1, $$cr),
                () => this.matchDE_20($$dpth + 1, $$cr),
                () => this.matchDE_21($$dpth + 1, $$cr),
            ]);
        };
        const $scope$pos = this.mark();
        const memo = this.$scope$DE$memo.get($scope$pos.overallPos);
        if (memo !== undefined) {
            this.reset(memo[1]);
            return memo[0];
        }
        const $scope$oldMemoSafe = this.memoSafe;
        this.memoSafe = false;
        this.$scope$DE$memo.set($scope$pos.overallPos, [null, $scope$pos]);
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
            this.$scope$DE$memo.set($scope$pos.overallPos, [lastRes, lastPos]);
        }
        this.reset(lastPos);
        this.memoSafe = $scope$oldMemoSafe;
        return lastRes;
    }
    matchDE_1($$dpth, $$cr) {
        return this.matchName($$dpth + 1, $$cr);
    }
    matchDE_2($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_2, };
            }
            return $$res;
        });
    }
    matchDE_3($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.loopPlus(() => this.matchDE_$0($$dpth + 1, $$cr)) !== null) {
                $$res = { kind: ASTKinds.DE_3, };
            }
            return $$res;
        });
    }
    matchDE_4($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:{)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:})`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_4, };
            }
            return $$res;
        });
    }
    matchDE_5($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:{)`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:|)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:})`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_5, };
            }
            return $$res;
        });
    }
    matchDE_6($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:{)`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:|)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:})`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_6, };
            }
            return $$res;
        });
    }
    matchDE_7($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:lambda)`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_7, };
            }
            return $$res;
        });
    }
    matchDE_8($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:forall)`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_8, };
            }
            return $$res;
        });
    }
    matchDE_9($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:exists)`, "", $$dpth + 1, $$cr) !== null
                && this.matchName($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.match_($$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_9, };
            }
            return $$res;
        });
    }
    matchDE_10($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:->)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_10, };
            }
            return $$res;
        });
    }
    matchDE_11($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:<->)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_11, };
            }
            return $$res;
        });
    }
    matchDE_12($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:&)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_12, };
            }
            return $$res;
        });
    }
    matchDE_13($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:|)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_13, };
            }
            return $$res;
        });
    }
    matchDE_14($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_14, };
            }
            return $$res;
        });
    }
    matchDE_15($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:!=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_15, };
            }
            return $$res;
        });
    }
    matchDE_16($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:>=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_16, };
            }
            return $$res;
        });
    }
    matchDE_17($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:<=)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_17, };
            }
            return $$res;
        });
    }
    matchDE_18($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:>)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_18, };
            }
            return $$res;
        });
    }
    matchDE_19($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:<)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_19, };
            }
            return $$res;
        });
    }
    matchDE_20($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.matchInfix($$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_20, };
            }
            return $$res;
        });
    }
    matchDE_21($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:\()`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null
                && this.regexAccept(String.raw `(?:\))`, "", $$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_21, };
            }
            return $$res;
        });
    }
    matchDE_$0($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.regexAccept(String.raw `(?:,)`, "", $$dpth + 1, $$cr) !== null
                && this.matchDE($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.DE_$0, };
            }
            return $$res;
        });
    }
    matchTypeName($$dpth, $$cr) {
        return this.matchName($$dpth + 1, $$cr);
    }
    matchName($$dpth, $$cr) {
        return this.choice([
            () => this.matchName_1($$dpth + 1, $$cr),
            () => this.matchName_2($$dpth + 1, $$cr),
            () => this.matchName_3($$dpth + 1, $$cr),
        ]);
    }
    matchName_1($$dpth, $$cr) {
        return this.matchNameString($$dpth + 1, $$cr);
    }
    matchName_2($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:!)`, "", $$dpth + 1, $$cr);
    }
    matchName_3($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:[])`, "", $$dpth + 1, $$cr);
    }
    matchNameString($$dpth, $$cr) {
        return this.run($$dpth, () => {
            let $$res = null;
            if (true
                && this.loop(() => this.matchNameChar($$dpth + 1, $$cr), 0, -1) !== null
                && this.regexAccept(String.raw `(?:.)`, "", $$dpth + 1, $$cr) !== null
                && this.matchNameString_$0($$dpth + 1, $$cr) !== null) {
                $$res = { kind: ASTKinds.NameString, };
            }
            return $$res;
        });
    }
    matchNameString_$0($$dpth, $$cr) {
        return this.choice([
            () => this.matchNameString_$0_1($$dpth + 1, $$cr),
            () => this.matchNameString_$0_2($$dpth + 1, $$cr),
        ]);
    }
    matchNameString_$0_1($$dpth, $$cr) {
        return this.matchNameString($$dpth + 1, $$cr);
    }
    matchNameString_$0_2($$dpth, $$cr) {
        return this.loopPlus(() => this.matchNameChar($$dpth + 1, $$cr));
    }
    matchNameChar($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:[a-zA-Z0-9_#$%\'/?@\\^\`~])`, "", $$dpth + 1, $$cr);
    }
    matchInfix($$dpth, $$cr) {
        return this.loopPlus(() => this.regexAccept(String.raw `(?:[*+\-:<=>!&|])`, "", $$dpth + 1, $$cr));
    }
    match_($$dpth, $$cr) {
        return this.regexAccept(String.raw `(?:\s*)`, "", $$dpth + 1, $$cr);
    }
    test() {
        const mrk = this.mark();
        const res = this.matchAWN(0);
        const ans = res !== null;
        this.reset(mrk);
        return ans;
    }
    parse() {
        const mrk = this.mark();
        const res = this.matchAWN(0);
        if (res)
            return { ast: res, errs: [] };
        this.reset(mrk);
        const rec = new ErrorTracker();
        this.clearMemos();
        this.matchAWN(0, rec);
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