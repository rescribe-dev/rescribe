import * as vscode from 'vscode'

export  let commandProvider = vscode.languages.registerCompletionItemProvider('plaintext', {
       
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

        // get all text until the `position` and check if it reads `console.`
        // and if so then complete if `log`, `warn`, and `error`
        let linePrefix = document.lineAt(position).text.substr(0, position.character);
        if (!linePrefix.endsWith('rescribe.')) {
            return undefined;
        }

        return [
            new vscode.CompletionItem('login', vscode.CompletionItemKind.Method),
            new vscode.CompletionItem('indexFiles', vscode.CompletionItemKind.Method),
            new vscode.CompletionItem('getUser', vscode.CompletionItemKind.Method),
        ];
    }
}, '.'
);