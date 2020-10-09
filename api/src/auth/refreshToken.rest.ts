import { Path, ContextRequest, POST, Errors } from 'typescript-rest';
import { Request } from 'express';
import { handleRefreshToken } from '../utils/jwt';
import { RestReturnObj } from '../schema/utils/returnObj';

@Path('/refreshToken')
export class RefreshToken {
  @POST
  async refreshToken(@ContextRequest req: Request): Promise<RestReturnObj> {
    try {
      const accessToken = await handleRefreshToken(req);
      return {
        data: accessToken,
        message: 'got access token'
      };
    } catch (err) {
      const errObj = err as Error;
      throw new Errors.BadRequestError(errObj.message);
    }
  }
}
