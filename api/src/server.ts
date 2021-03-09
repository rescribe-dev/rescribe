import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import { Server } from 'typescript-rest';
import { connectLogger, getLogger } from 'log4js';
import statusMonitor from 'express-status-monitor';
import cookieParser from 'cookie-parser';
import { getContext, GraphQLContext, onSubscription, SubscriptionContextParams, SubscriptionContext } from './utils/context';
import { enableInitialization, isProduction } from './utils/mode';
import { createServer } from 'http';
import { buildSchema } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { ObjectIdScalar } from './scalars/ObjectId';
import { join } from 'path';
import { pubSub } from './utils/redis';
import { graphqlUploadExpress } from 'graphql-upload';
import { TypegooseMiddleware } from './db/typegoose';
import { configData } from './utils/config';
import { getSitemap } from './sitemap/getSitemap';
import { sitemapPaths } from './sitemap/sitemaps';

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
  app.use(connectLogger(logger, {}));
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
      host: '0.0.0.0',
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

  Server.buildServices(app);
  Server.loadServices(app, '**/*.rest.{ts,js}', __dirname);
  const swaggerSchemes = [];
  let swaggerHost = `localhost:${configData.PORT}`;
  if (isProduction()) {
    swaggerSchemes.push('https');
    swaggerHost = configData.API_HOST;
  }
  swaggerSchemes.push('http');
  Server.swagger(app, {
    endpoint: 'swagger',
    filePath: join(__dirname, '../swagger.yml'),
    host: swaggerHost,
    schemes: swaggerSchemes
  });

  // not included in typescript rest:
  for (const sitemapPath of sitemapPaths) {
    app.get(sitemapPath, getSitemap);
  }
  logger.info(`initialization is ${enableInitialization() ? 'enabled' : 'disabled'}`);
  const httpServer = createServer(app);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen(configData.PORT, '0.0.0.0', () => logger.info(`Api started: http://localhost:${configData.PORT}/graphql 🚀`));
};
