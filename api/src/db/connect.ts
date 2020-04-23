import { Collection, Db, MongoClient } from 'mongodb';

export const userCollectionName = 'users';

export let db: Db;

export let userCollection: Collection;

export const getUserCollection = (): Collection => {
  return userCollection;
};

export const initializeDB = async () => {
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
  (process as NodeJS.EventEmitter).on('exit', () => {
    client.close();
  });
  userCollection = db.collection(userCollectionName);
  return `database client connected to ${db.databaseName}`;
};
