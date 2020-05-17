import { window } from 'vscode';

const errorHandler = (err: Error) => {
  window.showErrorMessage(err.message);
};

export default errorHandler;
