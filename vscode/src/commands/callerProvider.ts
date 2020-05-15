import * as vscode from 'vscode';

export const callerProvider = vscode.languages.registerCompletionItemProvider(
  'plaintext',
  {
    provideCompletionItems() {
      // a simple completion item which inserts text
      const rescribeCommand: vscode.CompletionItem = new vscode.CompletionItem(
        'rescribe'
      );

      const commitCharacterCompletion = new vscode.CompletionItem('rescribe');
      commitCharacterCompletion.commitCharacters = ['.'];
      commitCharacterCompletion.documentation = new vscode.MarkdownString(
        'Press `.` to get `rescribe.`'
      );
      // a completion item that inserts its text as snippet,
      // the `insertText`-property is a `SnippetString` which will be
      // honored by the editor.
      // const snippetCompletion = new vscode.CompletionItem('Good part of the day');
      // snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
      // snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");

      return [rescribeCommand, commitCharacterCompletion];
    },
  }
);
