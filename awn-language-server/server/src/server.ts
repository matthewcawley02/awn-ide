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
	SemanticTokenTypes
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

import{
	parse,
	ParseResult,
} from './parser';

import{
	getSemantTokens
} from './semanticTokens'

import { convertNewToOldAST } from './convertAST';

import { InitialiseCheck, Check } from './check';
import { AWNRoot } from './ast';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

var diagnostics: Diagnostic[] = []

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
					tokenTypes: ['keyword', 'type', 'function', 'variable', 'variable', 'number', 'string', 'parameter', 'number'],
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
	InitialiseCheck()

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
	validateTextDocument(change.document);
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
//(this specifically does the semantic tokens, in addition,
//validateTextDocument is called every time the document changes
//which does parsing and semantic checking)
//though this also parses which is inefficient so i should change that later (TODO)
connection.onRequest("textDocument/semanticTokens/full", (params) => {
	const document = documents.get(params.textDocument.uri);
	if(document === undefined){
		console.log("document undefined idk");
		return{
			data: []
		};
	}
	const parseResult: ParseResult = parse(document.getText());
	if(parseResult.ast != null){
		//TODO change getSemantTokens to use the new ast
		const semanticTokens = getSemantTokens(parseResult.ast);
		return{
			data: semanticTokens
		};
	}else{
		return{
			data: []
		}
	}
});

//called whenever there is a change in the document. parses and checks for semantic errors
async function validateTextDocument(textDocument: TextDocument): Promise<Diagnostic[]> {
	const settings = await getDocumentSettings(textDocument.uri);

	const text: string = textDocument.getText()	
	const parseResult: ParseResult = parse(text)

	let problems = 0
	diagnostics = []

	//if parsing itself fails
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
		const semanticErrors: Diagnostic[] = Check(newast)
		diagnostics.push(...semanticErrors)
	}
	console.log("Diagnostics:", diagnostics)
	return diagnostics
}

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received a file change event');
});

// Text completion
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// Note that the parameter includes the cursor location, can use that in the future
		return [
			{
				label: 'forall',
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'exists',
				kind: CompletionItemKind.Text,
				data: 2
			},
			{
				label: 'lambda',
				kind: CompletionItemKind.Text,
				data: 3
			},
			{
				label: 'include',
				kind: CompletionItemKind.Text,
				data: 4
			},
			{
				label: 'proc',
				kind: CompletionItemKind.Text,
				data: 5
			},
			{
				label: 'INCLUDES:',
				kind: CompletionItemKind.Text,
				data: 6
			},
			{
				label: 'TYPES:',
				kind: CompletionItemKind.Text,
				data: 7
			},
			{
				label: 'VARIABLES:',
				kind: CompletionItemKind.Text,
				data: 8
			},
			{
				label: 'CONSTANTS:',
				kind: CompletionItemKind.Text,
				data: 9
			},
			{
				label: 'FUNCTIONS:',
				kind: CompletionItemKind.Text,
				data: 10
			},
			{
				label: 'PROCESSES:',
				kind: CompletionItemKind.Text,
				data: 11
			},
			{
				label: 'ALIASES:',
				kind: CompletionItemKind.Text,
				data: 12
			},
			{
				label: 'unicast',
				kind: CompletionItemKind.Text,
				data: 13
			},			
			{
				label: 'broadcast',
				kind: CompletionItemKind.Text,
				data: 14
			},
			{
				label: 'groupcast',
				kind: CompletionItemKind.Text,
				data: 15
			},
			{
				label: 'send',
				kind: CompletionItemKind.Text,
				data: 16
			},
			{
				label: 'deliver',
				kind: CompletionItemKind.Text,
				data: 17
			},
			{
				label: 'receive:',
				kind: CompletionItemKind.Text,
				data: 18
			},
		];
	}
);

// Additional text alongside the text completion
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		switch(item.data){
			default:
				item.detail = 'tba';
				item.documentation = 'tba';
		return item;
		}
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
