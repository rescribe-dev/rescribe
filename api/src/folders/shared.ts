import { BaseFolder, Folder, FolderDB, FolderModel } from '../schema/structure/folder';
import { ObjectId } from 'mongodb';
import { AccessLevel } from '../schema/auth/access';
import { elasticClient } from '../elastic/init';
import { folderIndexName } from '../elastic/settings';

interface CreateFolderArgsType {
  name: string;
  path: string;
  project: ObjectId;
  repository: ObjectId;
  public: AccessLevel;
}

export const baseFolderName = 'base';
export const baseFolderPath = '/';

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
