export const baseFolderName = '';
export const baseFolderPath = '';

export interface FolderData {
  name: string;
  path: string;
}

export const getParentFolderPath = (filePath: string): FolderData => {
  // file path is something like /folder1/folder2/test.txt
  //                             /folder1/asdf.txt
  // for a file in those 2 folders
  if (filePath.length === 0) {
    return {
      name: '',
      path: ''
    };
  }
  let lastSlash = filePath.lastIndexOf('/');
  if (lastSlash < 0) {
    return {
      name: '',
      path: ''
    };
  }
  if (lastSlash === 0) {
    return {
      name: baseFolderName,
      path: baseFolderPath
    };
  }
  const folderPathFull = filePath.substring(lastSlash);
  lastSlash = folderPathFull.lastIndexOf('/');
  return {
    name: folderPathFull.substring(lastSlash),
    path: folderPathFull.substring(0, lastSlash)
  };
};

export const getParentFolderPaths = (filePath: string, reversed?: boolean): FolderData[] => {
  if (reversed === undefined) {
    reversed = true;
  }
  let currentFolderPath = filePath;
  const parentFolders: FolderData[] = [];
  while (currentFolderPath.length > 0) {
    const parentFolderData = getParentFolderPath(currentFolderPath);
    currentFolderPath = parentFolderData.path;
    // ignore base folder
    if (currentFolderPath !== baseFolderPath) {
      parentFolders.push(parentFolderData);
    }
  }
  let orderedFolders: FolderData[] = parentFolders;
  if (reversed) {
    orderedFolders = parentFolders.reverse();
  }
  return orderedFolders;
};
