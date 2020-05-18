import { connect, Mongoose } from 'mongoose';
import exitHook from 'exit-hook';
import { getLogger } from 'log4js';
import { configData } from '../utils/config';

const logger = getLogger();

export let client: Mongoose;

export const initializeDB = async (): Promise<string> => {
  if (!configData.DB_CONNECTION_URI) {
    throw new Error('cannot find database uri');
  }
  client = await connect(configData.DB_CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: configData.DB_NAME
  });
  exitHook(() => {
    logger.info('close database');
    client.connection.close();
  });
  return `database client connected to ${client.connection.name}`;
};
