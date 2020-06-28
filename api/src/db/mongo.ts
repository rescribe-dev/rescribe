import { FileModel } from '../schema/structure/file';
import { FolderModel } from '../schema/structure/folder';
import { ObjectId } from 'mongodb';
import { WriteType } from '../files/shared';

type models = typeof FolderModel | typeof FileModel;

export interface WriteMongoElement {
  data?: Record<string, unknown>;
  id?: ObjectId;
  action: WriteType;
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
      case WriteType.add:
        if (!element.data) {
          throw new Error('no data provided for element add');
        }
        operations.push({
          insertOne: {
            document: element.data
          }
        });
        break;
      case WriteType.update:
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
      case WriteType.delete:
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
