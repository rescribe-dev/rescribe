import * as vscode from 'vscode';
import { apolloClient } from '../utils/api';
import { checkAuth } from '../utils/authToken';
import {
  Files,
  FilesQuery,
  FilesQueryVariables,
} from '../lib/generated/datamodel';

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
  if (!vscode.window.activeTextEditor) {
    throw new Error('no open document');
  }
  (
    await vscode.window.showTextDocument(
      vscode.window.activeTextEditor.document
    )
  ).edit((edit) => {
    if (!vscode.window.activeTextEditor) {
      throw new Error('no open document');
    }
    edit.insert(
      vscode.window.activeTextEditor.selection.active,
      JSON.stringify(res.data.files)
    );
  });
  vscode.window.showInformationMessage('pasted text');
};
