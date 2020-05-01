import * as vscode from 'vscode';
import { checkAuth } from '../utils/authToken';
import indexFiles from '../utils/indexFiles';

const defaultBranch = 'master';

export default async (_context: vscode.ExtensionContext): Promise<void> => {
  checkAuth();
  const foundFiles = await vscode.workspace.findFiles("*");
  if (foundFiles.length === 0) {
    throw new Error('no files found');
  }
  let numFilesProcessed = 0;
  const files: Buffer[] = [];
  const paths: string[] = [];
  console.log(files);
  console.log(paths);
  let doneProcessing = false;
  return new Promise((resolve, reject) => {
    try {
      for (const file of foundFiles) {
        vscode.workspace.openTextDocument(vscode.Uri.parse(file.fsPath)).then((doc) => {
          numFilesProcessed++;
          paths.push(file.path);
          files.push(Buffer.from(doc.getText(), 'utf8'));
        }).then(() => {
          if (numFilesProcessed === files.length && !doneProcessing) {
            doneProcessing = true;
            indexFiles(paths, files, defaultBranch).then(res => {
              vscode.window.showInformationMessage(`indexed all files: ${res}`);
              resolve();
            }).catch((err: Error) => {
              reject(err);
            });
          }
        });
      }
    } catch (err) {
      reject(err as Error);
    }
  });
};
