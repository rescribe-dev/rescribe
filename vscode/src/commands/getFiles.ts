import * as vscode from 'vscode';
import { apolloClient } from '../utils/api';
import { checkAuth } from '../utils/authToken';
import {
  SearchQueryVariables,
  SearchQuery,
  Search,
} from '../lib/generated/datamodel';

import {
  FileText,
  FileTextQuery,
  FileTextQueryVariables,
} from '../lib/generated/datamodel';
import errorHandler from '../utils/errorHandler';

const writeData = async (
  _context: vscode.ExtensionContext,
  files: SearchQuery,
  fileIndex: number
): Promise<void> => {
  const fileTextArgs: FileTextQueryVariables = {
    id: files.search[fileIndex]._id,
    start: files.search[fileIndex].location.start,
    end: files.search[fileIndex].location.end,
  };
  const content = await apolloClient.query<
    FileTextQuery,
    FileTextQueryVariables
  >({
    query: FileText,
    variables: fileTextArgs,
  });
  if (!content.data || content.data.fileText.length === 0) {
    throw new Error('There is no content');
  }
  if (!vscode.window.activeTextEditor) {
    throw new Error('no open document');
  }
  if (!vscode.window.activeTextEditor) {
    throw new Error('There is no current active text editor');
  }
  const editor = vscode.window.activeTextEditor;
  const splitText = content.data.fileText.split('\n');
  const lineNum = editor.selection.active.line;
  let counter = 0;
  for (const line of splitText) {
    await editor.edit((editBuilder) => {
      editBuilder.insert(
        new vscode.Position(lineNum + counter, 0),
        line + '\n'
      );
    });
    counter++;
  }
  vscode.window.showInformationMessage('pasted text');
};

export default async (context: vscode.ExtensionContext): Promise<void> => {
  checkAuth(context);
  const query = await vscode.window.showInputBox();
  if (!query) {
    throw new Error('no query provided');
  }
  const res = await apolloClient.query<SearchQuery, SearchQueryVariables>({
    query: Search,
    variables: {
      query,
    },
  });
  if (!res) {
    throw new Error('no query response');
  }
  if (res.data.search.length === 0) {
    throw new Error('no search results');
  }
  const quickPick = vscode.window.createQuickPick();
  // https://github.com/microsoft/vscode-extension-samples/blob/master/quickinput-sample/src/quickOpen.ts
  quickPick.items = res.data.search.map((result) => {
    return {
      label: result.name,
      description: result.preview,
      detail: result.type,
    };
  });
  quickPick.onDidChangeSelection(async (selection) => {
    try {
      const index = quickPick.items.indexOf(selection[0]);
      if (index < 0) {
        throw new Error('cannot find selected item');
      }
      await writeData(context, res.data, index);
    } catch (err) {
      errorHandler(err);
    }
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
};
