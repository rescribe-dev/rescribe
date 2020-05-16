import * as vscode from 'vscode';
import { apolloClient } from '../utils/api';
import { checkAuth } from '../utils/authToken';
import {
  Files,
  FilesQuery,
  FilesQueryVariables,
} from '../lib/generated/datamodel';

import {
  FileText,
  FileTextQuery,
  FileTextQueryVariables,
} from '../lib/generated/datamodel';

export const writeData = async (
  _context: vscode.ExtensionContext,
  files: FilesQuery,
  fileIndex: number
): Promise<void> => {
  const fileTextArgs: FileTextQueryVariables = {
    id: files[fileIndex]._id,
    start: files[fileIndex].classes[0].location.start,
    end: files[fileIndex].classes[0].location.end,
  };

  const content = await apolloClient.query<
    FileTextQuery,
    FileTextQueryVariables
  >({
    query: FileText,
    variables: fileTextArgs,
  });
  if (!content) {
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

const setFile = async (
  _context: vscode.ExtensionContext,
  _files: FilesQuery,
  _fileIndex: number
): Promise<void> => {
  // set file
};

export default async (context: vscode.ExtensionContext): Promise<void> => {
  checkAuth(context);
  const query = await vscode.window.showInputBox();
  if (!query) {
    throw new Error('no query provided');
  }
  const res = await apolloClient.query<FilesQuery, FilesQueryVariables>({
    query: Files,
    variables: {
      query,
    },
  });
  if (!res) {
    throw new Error('no query response');
  }
  if (res.data.files.length === 0 || res.data.files[0].classes.length === 0) {
    throw new Error('no file or classes');
  }
  const quickPick = vscode.window.createQuickPick();
  quickPick.items = res.data.files.map((file, i) => {
    return {
      label: file.name,
      //TODO process the fields text so it doesn't look bad
      //https://github.com/microsoft/vscode-extension-samples/blob/master/quickinput-sample/src/quickOpen.ts

      description: `description ${res.data.files[i].fields.join(', ')}`,
      detail: 'details',
    };
  });
  quickPick.onDidChangeSelection((selection) => {
    const index = quickPick.items.indexOf(selection[0]);
    if (index < 0) {
      throw new Error('cannot find selected item');
    }
    setFile(context, res.data, index);
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
};
