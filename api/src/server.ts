import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import { BAD_REQUEST } from 'http-status-codes';
import { getLogger } from 'log4js';
import statusMonitor from 'express-status-monitor';
import cookieParser from 'cookie-parser';
import { initializeMappings } from './elastic/configure';
import { getContext, GraphQLContext, onSubscription, SubscriptionContextParams, SubscriptionContext } from './utils/context';
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
import { getSitemap } from './sitemap/getSitemap';
import { sitemapPaths } from './sitemap/sitemaps';
import { initializeProducts } from './products/init';
import { authHandler } from './utils/express';

const maxDepth = 7;
const logger = getLogger();

export const initializeServer = async (): Promise<void> => {
  const app = express();
  const corsConfig: CorsOptions = {
    credentials: true,
    origin: [configData.WEBSITE_URL, configData.STATIC_WEBSITE_URL, configData.DOCS_WEBSITE_URL]
  };
  app.use(cors(corsConfig));
  app.use(cookieParser());
  // use in proxy that you trust (like aws)
  // see http://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true);
  const schema = await buildSchema({
    resolvers: [join(__dirname, '/**/*.resolver.{ts,js}')],
    scalarsMap: [{
      type: ObjectId,
      scalar: ObjectIdScalar
    }],
    globalMiddlewares: [TypegooseMiddleware],
    emitSchemaFile: {
      path: join(__dirname, '../../schema.graphql')
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
  // api status monitor page
  app.use(statusMonitor({
    path: '/status',
    healthChecks: [{
      host: 'localhost',
      path: '/',
      port: configData.PORT,
      protocol: 'http'
    }]
  }));
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
  for (const sitemapPath of sitemapPaths) {
    app.get(sitemapPath, getSitemap);
  }
  app.post('/refreshToken', async (req, res) => {
    try {
      const accessToken = await handleRefreshToken(req);
      res.json({
        accessToken,
        message: 'got access token'
      });
    } catch (err) {
      const errObj = err as Error;
      res.status(BAD_REQUEST).json({
        message: errObj.message
      });
    }
  });
  if (enableInitialization()) {
    logger.info('initialization is enabled');
    app.post('/initializeElastic', (req, res) =>
      authHandler(configData.INITIALIZATION_KEY, initializeMappings, req, res));
    app.post('/initializeProducts', (req, res) =>
      authHandler(configData.INITIALIZATION_KEY, initializeProducts, req, res));
  }
  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen(configData.PORT, () => logger.info(`Api started: http://localhost:${configData.PORT}/graphql 🚀`));
};
