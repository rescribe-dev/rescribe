import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import depthLimit from 'graphql-depth-limit';
import HttpStatus from 'http-status-codes';
import { getLogger } from 'log4js';
import { fileLoader, mergeTypes } from 'merge-graphql-schemas';
import { join } from 'path';
import { initializeMappings } from './elastic/configure';
import resolvers from './resolvers';
import { isDebug } from './utils/mode';

const maxDepth = 7;
const logger = getLogger();

export const initializeServer = async () => {
  if (!process.env.PORT) {
    const message = 'cannot find port';
    throw new Error(message);
  }
  const port = Number(process.env.PORT);
  if (!port) {
    const message = 'port is not numeric';
    throw new Error(message);
  }
  const app = express();
  app.use('*', cors());
  const typeDefs = mergeTypes(fileLoader(join(__dirname, './schemas/*.graphql'), {
    recursive: true
  }), {
    all: true
  });
  const server = new ApolloServer({
    resolvers,
    typeDefs,
    validationRules: [depthLimit(maxDepth)],
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
  app.listen(port, () => logger.info(`Api started: http://localhost:${port}/graphql 🚀`));
};
