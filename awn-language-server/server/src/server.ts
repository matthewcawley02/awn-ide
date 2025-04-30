import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	DocumentDiagnosticReportKind,
	SemanticTokensOptions,
	type DocumentDiagnosticReport,	
	SemanticTokenTypes,
	Hover,
	MarkupKind,
} from 'vscode-languageserver/node';

import {
	TextDocument,
	Range,
	Position
} from 'vscode-languageserver-textdocument';

import{
	parse,
	ParseResult,
} from './parser';

import{
	getSemantTokens,
	convertAbstoRelTokens,
	resetSemanticTokens,
	pushAbsGivenLength
} from './semanticTokens'

import { convertNewToOldAST } from './convertAST';

import { Initialise, Check, InitialiseCheck, getHoverInformation, getAutoComplete } from './check';
import { AWNRoot } from './ast';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

var diagnostics: Diagnostic[] = []

var semanticTokens: number[][] = []

/* Handler for connection initialisation
   Client gives its capabilities through "InitializeParams"
   Server then returns its list of capabilities to the client */
connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	if (!!(capabilities.workspace && !!capabilities.workspace.configuration) === false){ 
		console.log("Problem: Client does not support workspace configuration requests.");
	}
	if (!!(capabilities.workspace && !!capabilities.workspace.workspaceFolders) === false){
		console.log("Problem: Client does not support workspace folders.");
	}
	if (!!(capabilities.textDocument && capabilities.textDocument.publishDiagnostics 
		&& capabilities.textDocument.publishDiagnostics.relatedInformation) == false){
		console.log("Problem: Client does not support the textDocument/publishDiagnostics notif");
	}

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			hoverProvider: true,
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
					tokenTypes: ['keyword', 'type', 'function', 'macro', 'variable', 'string', 'number', 'string', 'comment'],
					//			  keyword    type    function  constant   variable    string    process    alias    comment
					//tokenTypes: ['keyword'],
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
	Initialise()

	connection.client.register(DidChangeConfigurationNotification.type, undefined);
	connection.workspace.onDidChangeWorkspaceFolders(_event => {
		connection.console.log('Workspace folder change event received.');
	});
	
	console.log("Set up listeners with client");
});

interface Settings {
	maxNumberOfProblems: number;
}

//Keep a cache of the settings of all open documents
const documentSettings: Map<string, Thenable<Settings>> = new Map();

//Handler to update document settings
connection.onDidChangeConfiguration(change => {
	documentSettings.clear();
	connection.languages.diagnostics.refresh();
});

//Get settings of a particular document. Check cache first
function getDocumentSettings(resource: string): Thenable<Settings> {
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
	//validateTextDocument(change.document); //something else already triggers validateTextDocument. Not sure what, but uncommenting this makes it run twice
});

//Handler for the "document diagnostic" request from the client
//If the document exists, attempts to validate it and returns the result
connection.languages.diagnostics.on(async (params) => {
	const document = documents.get(params.textDocument.uri);
	if (document !== undefined) {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: await validateTextDocument(document)
		} satisfies DocumentDiagnosticReport;
	} else {
		return {
			kind: DocumentDiagnosticReportKind.Full,
			items: []
		} satisfies DocumentDiagnosticReport;
	}
});

//Request occurs every time the document changes
//Through testing, this is sent AFTER validateTextDocument returns,
//which makes it safe to just use the global semanticTokens variable that it sets
connection.onRequest("textDocument/semanticTokens/full", (params) => {
	return {
		data: semanticTokens.flat()
	}
});

//called whenever there is a change in the document. parses and checks for semantic errors
//also sets semantic tokens, as the semantic tokens request occurs entirely after this one
async function validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
	const settings = await getDocumentSettings(textDocument.uri);

	console.log("-------------------------- DOCUMENT CHANGE -------------------------------")
	let problems = 0
	diagnostics = []
	semanticTokens = []
	resetSemanticTokens()

	var text: string = textDocument.getText()
	text = text.split('').filter(c => c !== "\r").join('') //remove \r so we don't have to deal with it later. \r\n becomes \n
	text = removeComments(text, true)
	const parseResult: ParseResult = parse(text.concat("\n")) //concat "\n" is a hacky way to get around the grammar's requirement of newline at the end

	//if parsing itself fails, return syntax error diagnostics from parser.js
	if(parseResult.errs.length > 0){
		while(problems < settings.maxNumberOfProblems && problems < parseResult.errs.length){
			const problem = parseResult.errs[problems];
			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Error,
				range: {
					start: {line: problem.pos.line-1, character: problem.pos.offset},
					end: {line: problem.pos.line-1, character: problem.pos.offset+1}
				},
				message: problem.toString()
			};
			diagnostics.push(diagnostic);
			problems++;
		}
		return diagnostics
	}

	//if parsing succeeds, check for semantic errors
	if(parseResult.ast != null){
		console.log("original AST:\n", parseResult.ast)
		const newast: AWNRoot = convertNewToOldAST(parseResult.ast)
		console.log("converted AST:\n", newast)
		
		InitialiseCheck()
		const filename = textDocument.uri.split('/').pop()
		if(filename != null){ //it will never be null, btw
			diagnostics = Check(newast, true, filename)
		}

		getSemantTokens(newast)
		semanticTokens = convertAbstoRelTokens()
	}
	console.log("Diagnostics:", diagnostics)
	console.log("Semantic Tokens", semanticTokens)
	return diagnostics
}

export function removeComments(doc: string, syntaxHighlight: boolean): string{
	var output = ""
	var row = 1; var col = 0
	for(let i = 0; i < doc.length; i++){

		if(i+1 == doc.length){ //automatically stop on the last character, a comment cannot start here
			output += doc[i]
			break
		}

		if(doc[i] == "-" && doc[i+1] == "-"){ //single-line comment
			const length = getLengthOfSingleComment(i, doc)
			if(syntaxHighlight){
				pushAbsGivenLength({
					overallPos: i, line: row, offset: col
				}, length, 8, 0)
			}
			output += "\n"
			row++; col = 0
			i += length
		}

		else if(doc[i] == "{" && doc[i+1] == "*"){
			const charsEachRow = getLengthOfMultiComment(i, doc)
			if(syntaxHighlight){
				for(let j = 0; j < charsEachRow.length; j++){
					pushAbsGivenLength({
						overallPos: 0, line: row+j, offset: j == 0? col : 0 //overallPos is not important, so just = 0
					}, charsEachRow[j], 8, 0)
				}	
			}
			output += new Array(charsEachRow.length-1).fill("\n").join("")
			row += charsEachRow.length-1;
			const totalLength = charsEachRow.reduce((acc, val) => acc + val, 0);
			i += totalLength-1
		}

		else if(doc[i] == "\n"){
			row++
			col = 0
			output += "\n"
		}
		else{
			col++
			output += doc[i]
		}
	}
	return output
}

function getLengthOfSingleComment(startchar: number, doc: string): number{
	for(let i = startchar; i < doc.length; i++){
		if(i+1 == doc.length || doc[i] == "\n"){
			return i-startchar
		}
	}
	return 0
}

//returns the length of each row in a multiline comment as an array
function getLengthOfMultiComment(startchar: number, doc: string): number[]{
	var charsInRow = 0
	var charsEachRow = []
	for(let i = startchar; i < doc.length; i++){
		if(i+1 == doc.length){ //reached end of doc
			charsEachRow.push(charsInRow)
			return charsEachRow
		}
		
		else if(doc[i] == "*" && doc[i+1] == "}"){
			charsEachRow.push(charsInRow+2) //+2 to include the "-}"
			return charsEachRow
		}

		else if(doc[i] == "\n"){
			charsEachRow.push(charsInRow+1) //+1 to include \n
			charsInRow = 0
		} 
		else{
			charsInRow++
		}		
	}
	return []
}

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
    const { textDocument, position } = params
    const document = documents.get(textDocument.uri)
    if (!document) return null

    const wordRange = getWordAtPosition(document, position)
    if (!wordRange) return null

    const word = document.getText(wordRange)
	const info = getHoverInformation(word)
	if(!info) return null

    return {
        contents: {
            kind: MarkupKind.Markdown,
            value: info
        }
    }
})

function getWordAtPosition(document: TextDocument, position: Position): Range | null {
    const text = document.getText();
    const offset = document.offsetAt(position);
    
	// (/^[\w&|<>!-=]+/)
	
	const match = text.slice(offset).match(/^[\w&|<>\-!=]+/);
    const beforeMatch = text.slice(0, offset).match(/[\w&|<>\-!=]+$/);

    if (!match && !beforeMatch) return null;

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
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		const names = getAutoComplete()
		var ci: CompletionItem[] = []
		for(const n of names){
			ci.push({
				label: n,
				kind: CompletionItemKind.Text,
				insertText: n
			})
		}
		return ci
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
