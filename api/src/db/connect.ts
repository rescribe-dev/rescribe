import { connect, Mongoose } from 'mongoose';
import exitHook from 'exit-hook';
import { getLogger } from 'log4js';

const logger = getLogger();

export let client: Mongoose;

export const initializeDB = async (): Promise<string> => {
  if (!process.env.DB_CONNECTION_URI) {
    throw new Error('cannot find database uri');
  }
  if (!process.env.DB_NAME) {
    throw new Error('cannot find database name');
  }
  client = await connect(process.env.DB_CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.DB_NAME
  });
  exitHook(() => {
    logger.info('close database');
    client.connection.close();
  });
  return `database client connected to ${client.connection.name}`;
};
