import { BaseFolder, Folder, FolderDB, FolderModel } from '../schema/structure/folder';
import { ObjectId } from 'mongodb';
import { AccessLevel } from '../schema/auth/access';
import { elasticClient } from '../elastic/init';
import { folderIndexName } from '../elastic/settings';

export const baseFolderName = '';
export const baseFolderPath = '';

interface FolderData {
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

export const getParentFolderPaths = (filePath: string): FolderData[] => {
  let currentFolderPath = filePath;
  const parentFolders: FolderData[] = [];
  while (currentFolderPath.length > 0) {
    const parentFolderData = getParentFolderPath(currentFolderPath);
    currentFolderPath = parentFolderData.path;
    if (currentFolderPath.length > 0) {
      parentFolders.push(parentFolderData);
    }
  }
  const orderedFolders = parentFolders.reverse();
  // remove base folder:
  orderedFolders.pop();
  return orderedFolders;
};

interface CreateFolderArgsType {
  name: string;
  path: string;
  project: ObjectId;
  repository: ObjectId;
  public: AccessLevel;
}

export const createFolder = async (args: CreateFolderArgsType): Promise<ObjectId> => {
  const currentTime = new Date().getTime();
  const id = new ObjectId();
  const baseFolder: BaseFolder = {
    ...args,
    branches: [],
    parent: id,
    created: currentTime,
    updated: currentTime
  };
  const elasticFolder: Folder = {
    ...baseFolder,
    numBranches: 0
  };
  await elasticClient.index({
    id: id.toHexString(),
    index: folderIndexName,
    body: elasticFolder
  });
  const dbFolder: FolderDB = {
    ...baseFolder,
    _id: id
  };
  await new FolderModel(dbFolder).save();
  return id;
};
