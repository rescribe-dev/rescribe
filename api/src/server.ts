import Joi from '@hapi/joi';
import bodyParser from 'body-parser';
import express from 'express';
import HttpStatus from 'http-status-codes';
import { getLogger } from 'log4js'
import { IProcessFileInput, processFile } from './antlrBridge';
import { initializeMappings } from './elaticInit';
import { isDebug } from './mode';

const logger = getLogger()

export const initializeServer = (port: number) => {
  const app = express();
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  const validateProcessFileInput = Joi.object({
    contents: Joi.string().required(),
    name: Joi.string().required()
  })
  app.get('/hello', (_, res) => {
    res.json({
      message: 'hello world!'
    }).status(HttpStatus.OK)
  })
  if (isDebug()) {
    app.post('/initializeElastic', (_, res) => {
      initializeMappings().then(() => {
        res.json({
          message: 'initialized mappings'
        }).status(HttpStatus.OK)
      }).catch((err: Error) => {
        logger.error(err.message)
        res.json({
          message: err.message
        }).status(HttpStatus.BAD_REQUEST)
      })
    })
  }
  app.post('/processFile', (req, res) => {
    const validationRes = validateProcessFileInput.validate(req.body)
    if (validationRes.error) {
      throw validationRes.error
    }
    processFile(req.body as IProcessFileInput).then(antlrRes => {
      res.json(antlrRes).status(HttpStatus.OK);
    }).catch((err: Error) => {
      throw err;
    })
  })
  app.listen(port, () => logger.info(`Api started: http://localhost:${port} 🚀`));
}
