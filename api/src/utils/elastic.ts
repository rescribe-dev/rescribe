import { UpdateType } from '../files/shared';
import { ObjectId } from 'mongodb';
import { getLogger } from 'log4js';
import { elasticClient } from '../elastic/init';

const logger = getLogger();

export interface SaveElasticElement {
  id: ObjectId;
  data: object;
  action: UpdateType;
  index: string;
}

export const bulkSaveToElastic = async (elements: SaveElasticElement[]): Promise<void> => {
  let indexBody: object[] = [];
  let updateBody: object[] = [];
  for (const element of elements) {
    if (element.action === UpdateType.add) {
      indexBody.push([{
        index: {
          _index: element.index,
          _id: element.id.toHexString()
        }
      }, element.data]);
    } else if (element.action === UpdateType.update) {
      updateBody.push([{
        update: {
          _index: element.index,
          _id: element.id.toHexString()
        }
      }, element.data]);
    }
  }
  indexBody = indexBody.flat();
  updateBody = updateBody.flat();
  logger.info('start index');
  if (indexBody.length > 0) {
    await elasticClient.bulk({
      refresh: 'true',
      body: indexBody
    });
  }
  if (updateBody.length > 0) {
    await elasticClient.bulk({
      refresh: 'true',
      body: updateBody
    });
  }
  logger.info('end index');
};