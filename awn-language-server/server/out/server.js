"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeComments = void 0;
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const parser_1 = require("./parser");
const semanticTokens_1 = require("./semanticTokens");
const convertAST_1 = require("./convertAST");
const check_1 = require("./check");
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
// Create a simple text document manager.
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
var diagnostics = [];
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
            completionProvider: {
                resolveProvider: true
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
                    tokenTypes: ['keyword', 'type', 'function', 'variable', 'variable', 'string', 'number', 'string'],
                    //			  keyword    type    function    constant    variable    string    process    alias
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
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
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
//Request occurs every time the document changes
//Through testing, this is sent AFTER validateTextDocument returns,
//which makes it safe to just use the global semanticTokens variable that it sets
connection.onRequest("textDocument/semanticTokens/full", (params) => {
    //console.log(semanticTokens)
    return {
        data: semanticTokens.flat()
    };
});
//called whenever there is a change in the document. parses and checks for semantic errors
//also sets semantic tokens, as the semantic tokens request occurs after this one
async function validateTextDocument(textDocument) {
    const settings = await getDocumentSettings(textDocument.uri);
    console.log("-------------------------- DOCUMENT CHANGE -------------------------------");
    let problems = 0;
    diagnostics = [];
    semanticTokens = [];
    (0, semanticTokens_1.resetSemanticTokens)();
    var text = textDocument.getText();
    text = removeComments(text);
    const parseResult = (0, parser_1.parse)(text);
    //if parsing itself fails, return syntax error diagnostics from parser.js
    if (parseResult.errs.length > 0) {
        while (problems < settings.maxNumberOfProblems && problems < parseResult.errs.length) {
            const problem = parseResult.errs[problems];
            const diagnostic = {
                severity: node_1.DiagnosticSeverity.Error,
                range: {
                    start: { line: problem.pos.line - 1, character: problem.pos.offset },
                    end: { line: problem.pos.line - 1, character: problem.pos.offset + 1 }
                },
                message: problem.toString()
            };
            diagnostics.push(diagnostic);
            problems++;
        }
        return diagnostics;
    }
    //if parsing succeeds, check for semantic errors
    if (parseResult.ast != null) {
        console.log("original AST:\n", parseResult.ast);
        const newast = (0, convertAST_1.convertNewToOldAST)(parseResult.ast);
        console.log("converted AST:\n", newast);
        (0, check_1.InitialiseCheck)();
        diagnostics = (0, check_1.Check)(newast, true);
        semanticTokens = (0, semanticTokens_1.getSemantTokens)(newast);
    }
    console.log("Diagnostics:", diagnostics);
    console.log("Semantic Tokens", semanticTokens);
    return diagnostics;
}
//TODO finish
function removeComments(doc) {
    var output = "";
    var row = 1;
    var col = 0;
    for (let i = 0; i < doc.length; i++) {
        if (i + 1 == doc.length) { //automatically stop on the last character, a comment cannot start here
            output += doc[i];
            break;
        }
        if (doc[i] == "-" && doc[i + 1] == "-") {
            const length = getLengthOfSingleComment(i, doc);
            //doesn't allow negative line deltas, so have to figure out a workaround
            //	pushAndUpdateGivenLength({
            //		overallPos: i, line: row, offset: col
            //	}, length, 3, 0)
            output += "\n";
            i += length;
        }
        else if (doc[i] == "{" && doc[i + 1] == "-") {
            //remove multiline
        }
        else if (doc[i] == "\n") { //todo probably check for \r\n as well
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
exports.removeComments = removeComments;
function getLengthOfSingleComment(startchar, doc) {
    for (let i = startchar; i < doc.length; i++) {
        if (i + 1 == doc.length || doc[i] == "\n") {
            return i - startchar;
        }
    }
    return 0;
}
function getRowsInMultiComment(startchar, doc) {
    var numrows = 0;
    for (let i = startchar; i < doc.length; i++) {
        if (i + 1 == doc.length) {
            return numrows + 1;
        }
        if (doc[i] == "-" && doc[i + 1] == "}") {
            return numrows + 1;
        }
        else if (doc[i] == "\n") {
            numrows++;
        }
    }
    return 0;
}
connection.onDidChangeWatchedFiles(_change => {
    // Monitored files have change in VSCode
    connection.console.log('We received a file change event');
});
// Text completion
connection.onCompletion((_textDocumentPosition) => {
    // Note that the parameter includes the cursor location, can use that in the future
    return [
        {
            label: 'forall',
            kind: node_1.CompletionItemKind.Text,
            data: 1
        },
        {
            label: 'exists',
            kind: node_1.CompletionItemKind.Text,
            data: 2
        },
        {
            label: 'lambda',
            kind: node_1.CompletionItemKind.Text,
            data: 3
        },
        {
            label: 'include',
            kind: node_1.CompletionItemKind.Text,
            data: 4
        },
        {
            label: 'proc',
            kind: node_1.CompletionItemKind.Text,
            data: 5
        },
        {
            label: 'INCLUDES:',
            kind: node_1.CompletionItemKind.Text,
            data: 6
        },
        {
            label: 'TYPES:',
            kind: node_1.CompletionItemKind.Text,
            data: 7
        },
        {
            label: 'VARIABLES:',
            kind: node_1.CompletionItemKind.Text,
            data: 8
        },
        {
            label: 'CONSTANTS:',
            kind: node_1.CompletionItemKind.Text,
            data: 9
        },
        {
            label: 'FUNCTIONS:',
            kind: node_1.CompletionItemKind.Text,
            data: 10
        },
        {
            label: 'PROCESSES:',
            kind: node_1.CompletionItemKind.Text,
            data: 11
        },
        {
            label: 'ALIASES:',
            kind: node_1.CompletionItemKind.Text,
            data: 12
        },
        {
            label: 'unicast',
            kind: node_1.CompletionItemKind.Text,
            data: 13
        },
        {
            label: 'broadcast',
            kind: node_1.CompletionItemKind.Text,
            data: 14
        },
        {
            label: 'groupcast',
            kind: node_1.CompletionItemKind.Text,
            data: 15
        },
        {
            label: 'send',
            kind: node_1.CompletionItemKind.Text,
            data: 16
        },
        {
            label: 'deliver',
            kind: node_1.CompletionItemKind.Text,
            data: 17
        },
        {
            label: 'receive:',
            kind: node_1.CompletionItemKind.Text,
            data: 18
        },
    ];
});
// Additional text alongside the text completion
connection.onCompletionResolve((item) => {
    switch (item.data) {
        default:
            item.detail = 'tba';
            item.documentation = 'tba';
            return item;
    }
});
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map