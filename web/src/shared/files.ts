import { PathData } from './folders';

export const getFilePath = (path: string): PathData => {
  let filePath = path.substring(0, path.lastIndexOf('/') + 1);
  if (filePath.length > 0) {
    if (filePath[0] !== '/') {
      filePath = '/' + filePath;
    }
    const pathSplit = path.split(filePath);
    const name = pathSplit.length > 1 ? pathSplit[1] : '';
    return {
      name,
      path: filePath,
    };
  }
  return {
    path: '/',
    name: '',
  };
};
