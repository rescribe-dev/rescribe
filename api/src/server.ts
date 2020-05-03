import "reflect-metadata";
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import HttpStatus from 'http-status-codes';
import { getLogger } from 'log4js';
import { initializeMappings } from './elastic/configure';
import { getContext, GraphQLContext, onSubscription, SubscriptionContextParams } from './utils/context';
import { isDebug } from './utils/mode';
import { createServer } from 'http';
import { buildSchema } from 'type-graphql';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from './scalars/ObjectId';
import Redis from 'ioredis';
import { join } from "path";
import exitHook from "exit-hook";
import { graphqlUploadExpress } from "graphql-upload";

const maxDepth = 7;
const logger = getLogger();

export const initializeServer = async (): Promise<void> => {
  if (!process.env.PORT) {
    const message = 'cannot find port';
    throw new Error(message);
  }
  const port = Number(process.env.PORT);
  if (!port) {
    const message = 'port is not numeric';
    throw new Error(message);
  }
  if (!process.env.REDIS_HOST) {
    const message = 'no redis host provided';
    throw new Error(message);
  }
  if (!process.env.REDIS_PORT) {
    const message = 'no redis port provided';
    throw new Error(message);
  }
  const redisPort = Number(process.env.REDIS_PORT);
  if (!port) {
    const message = 'redis port is not numeric';
    throw new Error(message);
  }
  if (!process.env.REDIS_PASSWORD) {
    const message = 'no redis password provided';
    throw new Error(message);
  }
  const app = express();
  app.use('*', cors());
  const redisOptions: Redis.RedisOptions = {
    host: process.env.REDIS_HOST,
    port: redisPort,
    db: 0,
    password: process.env.REDIS_PASSWORD
  };
  const pubSub = new RedisPubSub({
    publisher: new Redis(redisOptions),
    subscriber: new Redis(redisOptions)
  });
  exitHook(() => {
    logger.info("close pub sub");
    pubSub.close();
  });
  const schema = await buildSchema({
    resolvers: [join(__dirname, "/**/**/*.resolver.{ts,js}")],
    scalarsMap: [{
      type: ObjectId,
      scalar: ObjectIdScalar
    }],
    emitSchemaFile: {
      path: join(__dirname,  "../schema.graphql"),
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
      onConnect: (connectionParams: SubscriptionContextParams): Promise<GraphQLContext> => onSubscription(connectionParams),
    },
    context: async (req): Promise<GraphQLContext> => getContext(req),
    uploads: false
  });
  app.use(server.graphqlPath, compression());
  server.applyMiddleware({
    app,
    path: server.graphqlPath,
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
  if (isDebug()) {
    app.post('/initializeElastic', (_, res) => {
      initializeMappings().then(() => {
        res.json({
          message: 'initialized mappings'
        }).status(HttpStatus.OK);
      }).catch((err: Error) => {
        logger.error(err.message);
        res.json({
          message: err.message
        }).status(HttpStatus.BAD_REQUEST);
      });
    });
  }
  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen(port, () => logger.info(`Api started: http://localhost:${port}/graphql 🚀`));
};
