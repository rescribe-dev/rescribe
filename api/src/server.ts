import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import HttpStatus from 'http-status-codes';
import { getLogger } from 'log4js';
import cookieParser from 'cookie-parser';
import { initializeMappings } from './elastic/configure';
import { getContext, GraphQLContext, onSubscription, SubscriptionContextParams, SubscriptionContext } from './utils/context';
import { isDebug } from './utils/mode';
import { createServer } from 'http';
import { buildSchema } from 'type-graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from './scalars/ObjectId';
import Redis from 'ioredis';
import { join } from 'path';
import exitHook from 'exit-hook';
import { graphqlUploadExpress } from 'graphql-upload';
import { TypegooseMiddleware } from './db/typegoose';
import { handleRefreshToken } from './utils/jwt';
import { configData } from './utils/config';

const maxDepth = 7;
const logger = getLogger();

export const initializeServer = async (): Promise<void> => {
  if (configData.REDIS_HOST.length === 0) {
    const message = 'no redis host provided';
    throw new Error(message);
  }
  if (configData.REDIS_PORT === 0) {
    const message = 'no redis port provided';
    throw new Error(message);
  }
  if (configData.REDIS_PASSWORD.length === 0) {
    const message = 'no redis password provided';
    logger.info(message);
  } else {
    const message = 'redis password provided';
    logger.info(message);
  }
  const redisOptions: Redis.RedisOptions = {
    host: configData.REDIS_HOST,
    port: configData.REDIS_PORT,
    db: 0,
    tls: {
      checkServerIdentity: (): undefined => undefined
    },
    password: configData.REDIS_PASSWORD.length > 0 ? configData.REDIS_PASSWORD : undefined
  };
  const publisher = new Redis(redisOptions);
  const subscriber = new Redis(redisOptions);
  const pubSub = new RedisPubSub({
    publisher,
    subscriber
  });
  const closeRedis = (): void => {
    logger.info('close pub sub');
    pubSub.close();
  };
  publisher.on('error', (err: Error) => {
    closeRedis();
    logger.error(err.message);
    process.exit(1);
  });
  await publisher.ping();
  logger.info('connected to redis');
  exitHook(closeRedis);
  const app = express();
  app.use(cors({
    origin: configData.WEBSITE_URL,
    credentials: true
  }));
  app.use(cookieParser());
  const schema = await buildSchema({
    resolvers: [join(__dirname, '/**/**/*.resolver.{ts,js}')],
    scalarsMap: [{
      type: ObjectId,
      scalar: ObjectIdScalar
    }],
    globalMiddlewares: [TypegooseMiddleware],
    emitSchemaFile: {
      path: join(__dirname, '../../schema.graphql'),
      commentDescriptions: true
    },
    pubSub
  });
  // https://github.com/MichalLytek/type-graphql/issues/37#issuecomment-592467594
  app.use(graphqlUploadExpress({
    maxFileSize: 10000000,
    maxFiles: 10
  }));
  const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(maxDepth)],
    subscriptions: {
      onConnect: (connectionParams: SubscriptionContextParams): Promise<SubscriptionContext> => onSubscription(connectionParams),
    },
    context: async (req): Promise<GraphQLContext> => getContext(req),
    uploads: false,
    introspection: true
  });
  app.use(server.graphqlPath, compression());
  server.applyMiddleware({
    app,
    path: server.graphqlPath,
    cors: false
  });
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.get('/hello', (_, res) => {
    res.json({
      message: 'hello world!'
    }).status(HttpStatus.OK);
  });
  app.get('/', (_, res) => {
    res.json({
      message: 'go to /graphql for playground'
    }).status(HttpStatus.OK);
  });
  app.post('/refreshToken', async (req, res) => {
    try {
      const accessToken = await handleRefreshToken(req);
      res.json({
        accessToken,
        message: 'got access token'
      }).status(HttpStatus.OK);
    } catch (err) {
      const errObj = err as Error;
      res.json({
        message: errObj.message
      }).status(HttpStatus.BAD_REQUEST);
    }
  });
  if (isDebug()) {
    app.post('/initializeElastic', async (_, res) => {
      try {
        await initializeMappings();
        res.json({
          message: 'initialized mappings'
        }).status(HttpStatus.OK);
      } catch (err) {
        const errObj = err as Error;
        logger.error(errObj.message);
        res.json({
          message: errObj.message
        }).status(HttpStatus.BAD_REQUEST);
      }
    });
  }
  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen(configData.PORT, () => logger.info(`Api started: http://localhost:${configData.PORT}/graphql 🚀`));
};
