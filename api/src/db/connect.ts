import { connect, Mongoose } from 'mongoose';
import exitHook from 'exit-hook';
import { getLogger } from 'log4js';

const logger = getLogger();

export let client: Mongoose;

export const initializeDB = async (dbConnectionURI: string, dbName: string): Promise<string> => {
  if (dbConnectionURI.length === 0) {
    throw new Error('cannot find database uri');
  }
  if (dbName.length === 0) {
    throw new Error('cannot find database name');
  }
  client = await connect(dbConnectionURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    dbName
  });
  exitHook(() => {
    logger.info('close database');
    client.connection.close();
  });
  return `database client connected to ${client.connection.name}`;
};
