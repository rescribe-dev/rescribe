import { window } from 'vscode';

const errorHandler = (err: Error): void => {
  window.showErrorMessage(err.message);
};

export default errorHandler;
