"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareFile = void 0;
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const parser_1 = require("./parser");
const semanticTokens_1 = require("./semanticTokens");
const convertAST_1 = require("./convertAST");
const check_1 = require("./check");
const fs = require("fs");
//=============================================================
// See here for documentation of LSP functionality:
// https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/
//=============================================================
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
var diagnostics = [];
//global variable to hold the output of semanticTokens, because LSP asks for document diagnostics and semantic tokens in different requests
var semanticTokens = [];
/* Handler for connection initialisation
   Client gives its capabilities through "InitializeParams"
   Server then returns its list of capabilities to the client */
connection.onInitialize((params) => {
    const capabilities = params.capabilities;
    if (!!(capabilities.workspace && !!capabilities.workspace.configuration) === false) {
        console.log("Problem: Client does not support workspace configuration requests.");
    }
    if (!!(capabilities.workspace && !!capabilities.workspace.workspaceFolders) === false) {
        console.log("Problem: Client does not support workspace folders.");
    }
    if (!!(capabilities.textDocument && capabilities.textDocument.publishDiagnostics
        && capabilities.textDocument.publishDiagnostics.relatedInformation) == false) {
        console.log("Problem: Client does not support the textDocument/publishDiagnostics notif");
    }
    const result = {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            hoverProvider: true,
            completionProvider: {
                resolveProvider: false //this is about additional info in the popup
            },
            diagnosticProvider: {
                interFileDependencies: false,
                workspaceDiagnostics: false
            },
            workspace: {
                workspaceFolders: {
                    supported: true
                }
            },
            semanticTokensProvider: {
                legend: {
                    //tokenTypes gives the colours I want, the comments undeneath are what I use each for.
                    tokenTypes: ['keyword', 'type', 'function', 'macro', 'variable', 'string', 'number', 'string', 'comment'],
                    //			  keyword    type    function  constant   variable    string    process    alias    comment
                    tokenModifiers: []
                },
                full: true
            }
        }
    };
    return result;
});
//Set up listeners on initialization
connection.onInitialized(() => {
    console.log("Initialized connection with client");
    (0, check_1.Initialise)();
    connection.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
    connection.workspace.onDidChangeWorkspaceFolders(_event => {
        connection.console.log('Workspace folder change event received.');
    });
    console.log("Set up listeners with client");
});
//Keep a cache of the settings of all open documents
const documentSettings = new Map();
//Handler to update document settings
connection.onDidChangeConfiguration(change => {
    documentSettings.clear();
    connection.languages.diagnostics.refresh();
});
//Get settings of a particular document. Check cache first
function getDocumentSettings(resource) {
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'languageServerExample' //I assume they set this section to include just 'maxNumberOfProblems'
        });
        documentSettings.set(resource, result);
    }
    return result;
}
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});
//Handler for the "document diagnostic" request from the client
//If the document exists, attempts to validate it and returns the result
connection.languages.diagnostics.on(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (document !== undefined) {
        return {
            kind: node_1.DocumentDiagnosticReportKind.Full,
            items: await validateTextDocument(document)
        };
    }
    else {
        return {
            kind: node_1.DocumentDiagnosticReportKind.Full,
            items: []
        };
    }
});
//Request for semantic tokens, occurs every time the document changes.
//Through testing, this is sent AFTER validateTextDocument returns,
//which makes it safe to just use the global variable from that.
connection.onRequest("textDocument/semanticTokens/full", (params) => {
    return {
        data: semanticTokens.flat()
    };
});
//Called whenever there is a change in the document. Parses and checks for semantic errors, and calculates semantic tokens.
//Sets the semantic tokens as a global variable, because LSP sends the semantic tokens
//request separately, but I want to calculate semantic tokens here with everything else.
async function validateTextDocument(textDocument) {
    return checkDocumentAndSemantTokens(textDocument);
}
//when focused file changes, check document/semantic tokens, and force semantic token request
connection.onNotification("awn/activeDocumentChanged", (params) => {
    const uri = params.uri;
    const document = documents.get(uri);
    if (document) {
        checkDocumentAndSemantTokens(document);
        connection.sendRequest("workspace/semanticTokens/refresh"); //force semantic token refresh
    }
});
//Checks document, as well as setting the global variable semanticTokens[][] to that doc's semantic tokens.
function checkDocumentAndSemantTokens(textDocument) {
    console.log("=== CheckDoc&SemantTokens ===");
    diagnostics = [];
    semanticTokens = [];
    (0, semanticTokens_1.resetSemanticTokens)();
    var text = textDocument.getText();
    text = text.split('').filter(c => c !== "\r").join(''); //remove \r so we don't have to deal with it later. \r\n becomes \n
    text = removeComments(text, true);
    const parseResult = (0, parser_1.parse)(text.concat("\n")); //concat "\n" is a hacky way to get around the grammar's requirement of newline at the end
    //if syntax parsing fails, return syntax error diagnostics from parser.ts
    if (parseResult.errs.length > 0) {
        for (const problem of parseResult.errs) {
            const diagnostic = {
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: problem.pos.line - 1, character: problem.pos.offset },
                    end: { line: problem.pos.line - 1, character: problem.pos.offset + 1 }
                },
                message: problem.toString()
            };
            diagnostics.push(diagnostic);
        }
        return diagnostics;
    }
    //if parsing succeeds, check for semantic errors
    if (parseResult.ast != null) {
        console.log("original AST:\n", parseResult.ast);
        const newast = (0, convertAST_1.convertNewToOldAST)(parseResult.ast);
        console.log("converted AST:\n", newast);
        (0, check_1.InitialiseSingleCheck)();
        const filepath = decodeURIComponent(textDocument.uri.replace("file:///", ""));
        if (filepath != null) { //it will never be null, btw
            diagnostics = (0, check_1.Check)(newast, true, filepath);
        }
        semanticTokens = (0, semanticTokens_1.getSemanticTokens)(newast);
    }
    console.log("Diagnostics:", diagnostics);
    console.log("Semantic Tokens", semanticTokens);
    return diagnostics;
}
//Prepares an .awn file, used for includes by check.ts
function prepareFile(filepath) {
    if (!fs.existsSync(filepath)) {
        return 0;
    }
    var text = fs.readFileSync(filepath, "utf-8");
    text = text.split('').filter(c => c !== "\r").join('');
    text = removeComments(text, false);
    const parseResult = (0, parser_1.parse)(text.concat("\n"));
    if (parseResult.ast == null) {
        return 1;
    }
    return (0, convertAST_1.convertNewToOldAST)(parseResult.ast);
}
exports.prepareFile = prepareFile;
//Removes commented parts of an .awn file from the file.
//If syntaxHighlight, then send semantic tokens for the
//comments to semanticTokens.ts.
function removeComments(doc, syntaxHighlight) {
    var output = "";
    var row = 1;
    var col = 0;
    for (let i = 0; i < doc.length; i++) {
        if (i + 1 == doc.length) { //automatically stop on the last character, a comment cannot start here
            output += doc[i];
            break;
        }
        if (doc[i] == "-" && doc[i + 1] == "-") { //single-line comment
            const length = getLengthOfSingleComment(i, doc);
            if (syntaxHighlight) {
                (0, semanticTokens_1.pushAbsGivenLength)({
                    overallPos: i, line: row, offset: col
                }, length, 8, 0);
            }
            output += "\n";
            row++;
            col = 0;
            i += length;
        }
        else if (doc[i] == "{" && doc[i + 1] == "*") {
            const charsEachRow = getLengthOfMultiComment(i, doc);
            if (syntaxHighlight) {
                for (let j = 0; j < charsEachRow.length; j++) {
                    (0, semanticTokens_1.pushAbsGivenLength)({
                        overallPos: 0, line: row + j, offset: j == 0 ? col : 0 //overallPos is not important, so just = 0
                    }, charsEachRow[j], 8, 0);
                }
            }
            output += new Array(charsEachRow.length - 1).fill("\n").join("");
            row += charsEachRow.length - 1;
            const totalLength = charsEachRow.reduce((acc, val) => acc + val, 0);
            i += totalLength - 1;
        }
        else if (doc[i] == "\n") {
            row++;
            col = 0;
            output += "\n";
        }
        else {
            col++;
            output += doc[i];
        }
    }
    return output;
}
function getLengthOfSingleComment(startchar, doc) {
    for (let i = startchar; i < doc.length; i++) {
        if (i + 1 == doc.length || doc[i] == "\n") {
            return i - startchar;
        }
    }
    return 0;
}
//returns the length of each row in a multiline comment as an array
function getLengthOfMultiComment(startchar, doc) {
    var charsInRow = 0;
    var charsEachRow = [];
    for (let i = startchar; i < doc.length; i++) {
        if (i + 1 == doc.length) { //reached end of doc
            charsEachRow.push(charsInRow);
            return charsEachRow;
        }
        else if (doc[i] == "*" && doc[i + 1] == "}") {
            charsEachRow.push(charsInRow + 2); //+2 to include the "-}"
            return charsEachRow;
        }
        else if (doc[i] == "\n") {
            charsEachRow.push(charsInRow + 1); //+1 to include \n
            charsInRow = 0;
        }
        else {
            charsInRow++;
        }
    }
    return [];
}
connection.onHover((params) => {
    const { textDocument, position } = params;
    const document = documents.get(textDocument.uri);
    if (!document)
        return null;
    const wordRange = getWordAtPosition(document, position);
    if (!wordRange)
        return null;
    const word = document.getText(wordRange);
    const info = (0, check_1.getHoverInformation)(word);
    if (!info)
        return null;
    return {
        contents: {
            kind: node_1.MarkupKind.Markdown,
            value: info
        }
    };
});
//Gets the word a user is hovering over with their cursor
//(characters it looks for are those allowed as a name by AWN)
function getWordAtPosition(document, position) {
    const text = document.getText();
    const offset = document.offsetAt(position);
    const match = text.slice(offset).match(/^[\w&|<>\-!=\+:]+/);
    const beforeMatch = text.slice(0, offset).match(/[\w&|<>\-!=\+:]+$/);
    if (!match && !beforeMatch)
        return null;
    const startOffset = beforeMatch ? offset - beforeMatch[0].length : offset;
    const endOffset = match ? offset + match[0].length : offset;
    return {
        start: document.positionAt(startOffset),
        end: document.positionAt(endOffset)
    };
}
connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VSCode
    connection.console.log('We received a file change event');
});
// Text completion
connection.onCompletion((_textDocumentPosition) => {
    const names = (0, check_1.getAutoComplete)();
    var ci = [];
    for (const n of names) {
        ci.push({
            label: n,
            kind: node_1.CompletionItemKind.Text,
            insertText: n
        });
    }
    return ci;
});
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map