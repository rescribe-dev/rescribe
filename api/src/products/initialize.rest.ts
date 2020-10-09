import { Path, ContextRequest, ContextResponse, POST, Errors } from 'typescript-rest';
import { Request, Response } from 'express';
import { authHandler } from '../utils/express';
import { configData } from '../utils/config';
import { initializeProducts } from './configure';
import { enableInitialization } from '../utils/mode';

@Path('/initializeProducts')
export class InitializeProducts {
  @POST
  async initializeProducts(@ContextRequest req: Request, @ContextResponse res: Response): Promise<void> {
    if (!enableInitialization()) {
      throw new Errors.ForbiddenError('initialization is disabled');
    }
    await authHandler(configData.INITIALIZATION_KEY, initializeProducts, req, res);
  }
}
