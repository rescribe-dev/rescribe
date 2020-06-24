import { FileModel } from '../schema/structure/file';
import { FolderModel } from '../schema/structure/folder';
import { ObjectId } from 'mongodb';
import { UpdateType } from '../files/shared';

type models = typeof FolderModel | typeof FileModel;

export interface WriteMongoElement {
  data: object;
  id?: ObjectId;
  action: UpdateType;
}

export const bulkSaveToMongo = async (elements: WriteMongoElement[], model: models): Promise<void> => {
  if (elements.length === 0) {
    return;
  }
  const operations: object[] = [];
  for (const element of elements) {
    switch (element.action) {
      case UpdateType.add:
        operations.push({
          insertOne: {
            document: element.data
          }
        });
        break;
      case UpdateType.update:
        if (!element.id) {
          throw new Error('id is not defined for element update');
        }
        operations.push({
          updateOne: {
            filter: {
              _id: element.id
            },
            update: element.data
          }
        });
        break;
      default:
        break;
    }
  }
  await model.bulkWrite(operations);
};
