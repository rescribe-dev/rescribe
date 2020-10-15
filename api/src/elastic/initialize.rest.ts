import { Path, ContextRequest, ContextResponse, POST, Errors, HeaderParam } from 'typescript-rest';
import { Request, Response } from 'express';
import { authHandler } from '../utils/express';
import { configData } from '../utils/config';
import { initializeMappings } from './configure';
import { enableInitialization } from '../utils/mode';

@Path('/initializeElastic')
export class InitializeElastic {
  @POST
  async initializeElastic(@HeaderParam('authorization') _auth: string, @ContextRequest req: Request,
    @ContextResponse res: Response): Promise<void> {
    if (!enableInitialization()) {
      throw new Errors.ForbiddenError('initialization is disabled');
    }
    await authHandler(configData.INITIALIZATION_KEY, initializeMappings, req, res);
  }
}
