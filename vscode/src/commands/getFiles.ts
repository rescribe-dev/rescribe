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

enum SelectionType {
  file,
  result,
}

interface SearchItem extends vscode.QuickPickItem {
  selectionType: SelectionType;
  fileIndex: number;
  resultIndex: number;
}

let search: (context: vscode.ExtensionContext) => Promise<void> = () =>
  new Promise<void>(() => {
    // do nothing
  });

const writeData = async (
  context: vscode.ExtensionContext,
  data: SearchQuery,
  selectedItem: SearchItem,
  quickPick: vscode.QuickPick<vscode.QuickPickItem>
): Promise<void> => {
  let fileTextArgs: FileTextQueryVariables;
  if (selectedItem.selectionType === SelectionType.file) {
    fileTextArgs = {
      id: data.search[selectedItem.fileIndex]._id,
      start: data.search[selectedItem.fileIndex].lines.start,
      end: data.search[selectedItem.fileIndex].lines.end,
    };
  } else if (selectedItem.selectionType === SelectionType.result) {
    const result =
      data.search[selectedItem.fileIndex].results[selectedItem.resultIndex];
    if (result.endPreviewContent.length === 0) {
      // not split
      fileTextArgs = {
        id: data.search[selectedItem.fileIndex]._id,
        start: result.startPreviewLineNumber,
        end:
          result.startPreviewLineNumber + result.startPreviewContent.length - 1,
      };
    } else {
      fileTextArgs = {
        id: data.search[selectedItem.fileIndex]._id,
        start: result.startPreviewLineNumber,
        end: result.endPreviewLineNumber + result.endPreviewContent.length - 1,
      };
    }
  } else {
    throw new Error('invalid result type provided');
  }
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
  const lineNum = editor.selection.active.line;
  let counter = 0;
  for (const line of content.data.fileText) {
    await editor.edit((editBuilder) => {
      editBuilder.insert(
        new vscode.Position(lineNum + counter, 0),
        line + '\n'
      );
    });
    counter++;
  }
  vscode.window.showInformationMessage('pasted text');
  quickPick.hide();
  search(context);
};

search = async (context): Promise<void> => {
  let query = await vscode.window.showInputBox();
  if (!query) {
    throw new Error('no query provided');
  }
  query = query.trim();
  const res = await apolloClient.query<SearchQuery, SearchQueryVariables>({
    query: Search,
    variables: {
      query,
    },
    fetchPolicy: 'no-cache', // disable cache
  });
  if (!res) {
    throw new Error('no query response');
  }
  if (res.data.search.length === 0) {
    throw new Error('no search results');
  }
  const quickPick = vscode.window.createQuickPick();
  // https://github.com/microsoft/vscode-extension-samples/blob/master/quickinput-sample/src/quickOpen.ts

  const items: SearchItem[] = [];
  for (let fileIndex = 0; fileIndex < res.data.search.length; fileIndex++) {
    const file = res.data.search[fileIndex];
    items.push({
      label: `file ${file.name}`,
      detail: `written in ${file.language.name}`,
      fileIndex,
      resultIndex: -1,
      selectionType: SelectionType.file,
    });
    for (
      let resultIndex = 0;
      resultIndex < file.results.length;
      resultIndex++
    ) {
      const result = file.results[resultIndex];
      let description = result.startPreviewContent.join('\n');
      if (result.endPreviewContent.length > 0) {
        description = `${description}\n    ...\n${result.endPreviewContent.join(
          '\n'
        )}`;
      }
      items.push({
        label: result.name,
        description,
        detail: result.type,
        fileIndex,
        resultIndex,
        selectionType: SelectionType.result,
      });
    }
  }
  quickPick.items = items;
  quickPick.onDidChangeSelection(async (selection) => {
    try {
      await writeData(context, res.data, selection[0] as SearchItem, quickPick);
    } catch (err) {
      errorHandler(err);
    }
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
};

export default async (context: vscode.ExtensionContext): Promise<void> => {
  checkAuth(context);
  await search(context);
};
