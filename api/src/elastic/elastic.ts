/* eslint-disable @typescript-eslint/ban-types */

import { ObjectId } from 'mongodb';
import { getLogger } from 'log4js';
import { elasticClient } from './init';
import { WriteType } from '../utils/writeType';

const logger = getLogger();

export interface SaveElasticElement {
  id: ObjectId;
  data?: object;
  action: WriteType;
  index: string;
}

export const bulkSaveToElastic = async (elements: SaveElasticElement[]): Promise<void> => {
  let writeBody: object[] = [];
  for (const element of elements) {
    if (element.action === WriteType.add) {
      if (!element.data) {
        throw new Error('no data provided for elastic add request');
      }
      writeBody.push([{
        index: {
          _index: element.index,
          _id: element.id.toHexString()
        }
      }, element.data]);
    } else if (element.action === WriteType.update) {
      if (!element.data) {
        throw new Error('no data provided for elastic update request');
      }
      writeBody.push([{
        update: {
          _index: element.index,
          _id: element.id.toHexString()
        }
      }, element.data]);
    } else if (element.action === WriteType.delete) {
      writeBody.push([{
        delete: {
          _index: element.index,
          _id: element.id.toHexString()
        }
      }]);
    } else {
      throw new Error(`update type ${element.action} is not supported for elastic bulk update`);
    }
  }
  writeBody = writeBody.flat();
  logger.info('start bulk write elastic');
  if (writeBody.length > 0) {
    await elasticClient.bulk({
      refresh: 'true',
      body: writeBody
    });
  }
  logger.info('end write elastic');
};