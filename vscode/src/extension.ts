import * as vscode from 'vscode';
import { initializeConfig } from './utils/config';
import { initializeAPIClient } from './utils/api';
import login from './commands/login';
import getUser from './commands/getUser';
import { callerProvider } from './commands/callerProvider';
import { commandProvider } from './commands/commandProvider';
import getFiles from './commands/getFiles';
const appName = 'rescribe';

export const activate = async (
  context: vscode.ExtensionContext
): Promise<void> => {
  console.log(`activating ${appName} extension`);
  await initializeConfig(context);
  await initializeAPIClient(context);

  context.subscriptions.push(
    vscode.commands.registerCommand(`${appName}.getFiles`, () => {
      getFiles(context).catch((err: Error) => {
        vscode.window.showErrorMessage(err.message);
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${appName}.callerProvider`, () => {
      callerProvider;
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${appName}.commandProvider`, () => {
      commandProvider;
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${appName}.sayHello`, (name = 'world') => {
      vscode.window.showInformationMessage(`Hello ${name}!!!`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${appName}.helloWorld`, () => {
      vscode.window.showInformationMessage('Hello World!');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${appName}.login`, () => {
      login(context).catch((err: Error) => {
        vscode.window.showErrorMessage(err.message);
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(`${appName}.getUser`, () => {
      getUser(context).catch((err: Error) => {
        vscode.window.showErrorMessage(err.message);
      });
    })
  );
};

export const deactivate = (): void => {
  // deactivate
};
