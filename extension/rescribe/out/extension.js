"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
//https://github.com/Microsoft/vscode-extension-samples/tree/master/source-control-sample
//https://github.com/Microsoft/vscode-extension-samples/tree/master/completions-sample
//https://github.com/Microsoft/vscode-extension-samples/tree/master/tree-view-sample
//https://github.com/Microsoft/vscode-extension-samples/tree/master/statusbar-sample
//https://github.com/Microsoft/vscode-extension-samples
//https://code.visualstudio.com/api/extension-guides/overview
function activate(context) {
    let provider1 = vscode.languages.registerCompletionItemProvider('plaintext', {
        provideCompletionItems(document, position, token, context) {
            //inserts hello world
            const simpleCompletion = new vscode.CompletionItem('Hello World!');
            //completion item that inserts its text as snippet, the inset text property is a snippet string 
            //which will be honoted by the editor
            const snippetCompletion = new vscode.CompletionItem('Good part of the day');
            snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
            snippetCompletion.documentation = new vscode.MarkdownString('inserts a snippet that lets you select the appropriate time of the day');
            //comp item that can be accpted by a commit character, the commit characters property is set which means that the completion will be 
            //inserted and then the character will be typed
            const commitCharacterCompletion = new vscode.CompletionItem('//..');
            commitCharacterCompletion.commitCharacters = ['.'];
            commitCharacterCompletion.documentation = new vscode.MarkdownString('press . to get console.');
            //a completion item that retriggers itnellisense when being accepted
            //command property is set which the editer will execuse after completion has been inserted
            //also the insert text is set so that a space is inserted after new
            const commandCompletion = new vscode.CompletionItem('new');
            commandCompletion.kind = vscode.CompletionItemKind.Keyword;
            commandCompletion.insertText = 'new ';
            commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
            return [
                simpleCompletion,
                snippetCompletion,
                commitCharacterCompletion,
                commandCompletion
            ];
        }
    });
    const provider2 = vscode.languages.registerCompletionItemProvider('plaintext', {
        provideCompletionItems(document, position) {
            //get all of teh text until position and chack if it reads console
            //and if so then complete if log warn and error
            let linePrefix = document.lineAt(position).text.substr(0, position.character);
            if (!linePrefix.endsWith('//..')) {
                return undefined;
            }
            return [
                new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
                new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
                new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
            ];
        }
    }, '.' //truggered when a . is typed
    );
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('rescribe.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello VS from rescribe!');
    });
    let currentTime = 5;
    let helloAgain = vscode.commands.registerCommand('rescribe.helloAgain', () => {
        vscode.window.showInformationMessage(`Hello Again! This works and I know what a callback function is! Current Time is ${currentTime}`);
    });
    context.subscriptions.push(provider1, provider2, helloAgain, disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map