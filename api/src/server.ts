import Joi from '@hapi/joi';
import bodyParser from 'body-parser';
import express from 'express';
import HttpStatus from 'http-status-codes';
import { IProcessFileInput, processFile } from './antlrBridge';

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
  app.listen(port, () => console.log(`Api started: http://localhost:${port} 🚀`));
}
