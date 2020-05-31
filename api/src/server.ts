import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import HttpStatus from 'http-status-codes';
import { getLogger } from 'log4js';
import cookieParser from 'cookie-parser';
import { initializeMappings } from './elastic/configure';
import { getContext, GraphQLContext, onSubscription, SubscriptionContextParams, SubscriptionContext, getToken } from './utils/context';
import { enableInitialization } from './utils/mode';
import { createServer } from 'http';
import { buildSchema } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from './scalars/ObjectId';
import { join } from 'path';
import { pubSub } from './utils/redis';
import { graphqlUploadExpress } from 'graphql-upload';
import { TypegooseMiddleware } from './db/typegoose';
import { handleRefreshToken } from './utils/jwt';
import { configData } from './utils/config';

const maxDepth = 7;
const logger = getLogger();

export const initializeServer = async (): Promise<void> => {
  const app = express();
  const corsConfig: CorsOptions = {
    credentials: true,
    origin: configData.WEBSITE_URL
  };
  app.use(cors(corsConfig));
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
    });
  });
  app.get('/', (_, res) => {
    res.json({
      message: 'go to /graphql for playground'
    });
  });
  app.post('/refreshToken', async (req, res) => {
    try {
      const accessToken = await handleRefreshToken(req);
      res.json({
        accessToken,
        message: 'got access token'
      });
    } catch (err) {
      const errObj = err as Error;
      res.status(HttpStatus.BAD_REQUEST).json({
        message: errObj.message
      });
    }
  });
  if (enableInitialization()) {
    app.post('/initializeElastic', async (req, res) => {
      try {
        const token = getToken(req);
        if (token.length === 0) {
          throw new Error('no authentication provided');
        }
        if (token !== configData.INITIALIZATION_KEY) {
          throw new Error('invalid token provided');
        }
        await initializeMappings();
        res.status(HttpStatus.OK).json({
          message: 'initialized mappings'
        });
      } catch (err) {
        const errObj = err as Error;
        logger.error(errObj.message);
        res.status(HttpStatus.BAD_REQUEST).json({
          message: errObj.message
        });
      }
    });
  }
  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen(configData.PORT, () => logger.info(`Api started: http://localhost:${configData.PORT}/graphql 🚀`));
};
