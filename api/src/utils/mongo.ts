import { FileDB, FileModel } from '../schema/structure/file';
import { FolderDB, FolderModel } from '../schema/structure/folder';

type supportedTypes = typeof FolderDB | typeof FileDB;

export interface WriteMongoElement {
  data: object;
}

interface UpsertElement {
  updateOne: {
    update: object;
    upsert: boolean;
  }
}

export const bulkSaveToMongo = async (elements: WriteMongoElement[], type: supportedTypes): Promise<void> => {
  const operations: UpsertElement[] = [];
  for (const element of elements) {
    operations.push({
      updateOne: {
        update: element.data,
        upsert: true
      }
    });
  }
  switch (type) {
    case FolderDB:
      await FolderModel.bulkWrite(operations);
      break;
    case FileDB:
      await FileModel.bulkWrite(operations);
      break;
    default:
      throw new Error('mongo bulk save type not supported');
  }
};