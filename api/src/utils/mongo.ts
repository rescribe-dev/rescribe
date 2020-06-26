import { FileModel } from '../schema/structure/file';
import { FolderModel } from '../schema/structure/folder';
import { ObjectId } from 'mongodb';
import { UpdateType } from '../files/shared';

type models = typeof FolderModel | typeof FileModel;

export interface WriteMongoElement {
  data?: Record<string, unknown>;
  id?: ObjectId;
  action: UpdateType;
  filter?: Record<string, unknown>;
}

export const bulkSaveToMongo = async (elements: WriteMongoElement[], model: models): Promise<void> => {
  if (elements.length === 0) {
    return;
  }
  const operations: Record<string, unknown>[] = [];
  for (const element of elements) {
    let filter: Record<string, unknown>;
    switch (element.action) {
      case UpdateType.add:
        if (!element.data) {
          throw new Error('no data provided for element add');
        }
        operations.push({
          insertOne: {
            document: element.data
          }
        });
        break;
      case UpdateType.update:
        if (!element.data) {
          throw new Error('no data provided for element update');
        }
        if (element.filter) {
          filter = element.filter;
        } else if (!element.id) {
          throw new Error('id is not defined for element update');
        } else {
          filter = {
            _id: element.id
          };
        }
        operations.push({
          updateOne: {
            filter,
            update: element.data
          }
        });
        break;
      case UpdateType.delete:
        if (element.filter) {
          filter = element.filter;
        } else if (!element.id) {
          throw new Error('id is not defined for element deletion');
        } else {
          filter = {
            _id: element.id
          };
        }
        operations.push({
          deleteOne: {
            filter
          }
        });
        break;
      default:
        break;
    }
  }
  await model.bulkWrite(operations);
};
