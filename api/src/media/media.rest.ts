import { Path, GET, QueryParam, ContextRequest, ContextResponse } from 'typescript-rest';
import { Request, Response } from 'express';
import { getFile } from './files.rest';

@Path('/media')
class Media {
  @GET
  @Path('/*')
  async rawFile(@ContextRequest req: Request, @ContextResponse res: Response,
    @QueryParam('text') text?: boolean,
    @QueryParam('download') download?: boolean): Promise<void> {

    await getFile({
      isFile: false,
      req,
      res,
      download,
      text
    });
  }
}

export default Media;
