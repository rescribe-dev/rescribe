import { Collection, Db, MongoClient } from 'mongodb';
import exitHook from 'exit-hook';
import User from '../auth/type';

export const userCollectionName = 'users';

export let db: Db;

export let userCollection: Collection<User>;

export const getUserCollection = (): Collection => {
  return userCollection;
};

export const initializeDB = async (): Promise<string> => {
  if (!process.env.DB_CONNECTION_URI) {
    throw new Error('cannot find database uri');
  }
  if (!process.env.DB_NAME) {
    throw new Error('cannot find database name');
  }
  const client = await MongoClient.connect(process.env.DB_CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = client.db(process.env.DB_NAME);
  exitHook(() => {
    client.close();
  });
  userCollection = db.collection(userCollectionName);
  return `database client connected to ${db.databaseName}`;
};
