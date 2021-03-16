export const baseFolderName = '';
export const baseFolderPath = '';

export interface PathData {
  name: string;
  path: string;
}

export const getParentFolderPath = (filePath: string): PathData => {
  // file path is something like /folder1/folder2/test.txt
  //                             /folder1/test2.txt
  // for a file in those 2 folders
  if (filePath.length === 0) {
    return {
      name: '',
      path: '',
    };
  }
  console.log(filePath);
  console.log(typeof filePath);
  let lastSlash = filePath.lastIndexOf('/');
  if (lastSlash < 0) {
    return {
      name: '',
      path: '',
    };
  }
  if (lastSlash === 0) {
    return {
      name: baseFolderName,
      path: baseFolderPath,
    };
  }
  const folderPathFull = filePath.substring(0, lastSlash);
  lastSlash = folderPathFull.lastIndexOf('/');
  const path =
    lastSlash === 0
      ? folderPathFull.substring(0, 1)
      : folderPathFull.substring(0, lastSlash);
  return {
    name: folderPathFull.substring(lastSlash + 1),
    path,
  };
};

const fullBasePath = '/';

export const getParentFolderPaths = (
  filePath: string,
  reversed?: boolean
): PathData[] => {
  if (reversed === undefined) {
    reversed = true;
  }
  let currentFolderPath = filePath;
  const parentFolders: PathData[] = [];
  console.log('getting parent folder paths');
  while (currentFolderPath !== fullBasePath) {
    console.log(currentFolderPath);
    const parentFolderData = getParentFolderPath(currentFolderPath);
    currentFolderPath = `${parentFolderData.path}${
      parentFolderData.path === fullBasePath ? '' : fullBasePath
    }${parentFolderData.name}`;
    if (currentFolderPath !== fullBasePath) {
      parentFolders.push(parentFolderData);
    }
  }
  let orderedFolders: PathData[] = parentFolders;
  if (reversed) {
    orderedFolders = parentFolders.reverse();
  }
  return orderedFolders;
};
