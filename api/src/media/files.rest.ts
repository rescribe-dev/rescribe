import { Path, GET, QueryParam, PathParam, ContextRequest, ContextResponse } from 'typescript-rest';
import { Request, Response } from 'express';
import { basename, dirname } from 'path';
import { checkMedia, checkText, contentTypeHeader } from '../utils/misc';
import { BadRequestError, InternalServerError, NotFoundError } from 'typescript-rest/dist/server/model/errors';
import { ObjectId } from 'mongodb';
import { getFileKey, getMediaKey, getS3FileData, S3Data } from '../utils/aws';
import { getFileAuthenticated } from '../files/file.resolver';
import { getContext } from '../utils/context';
import { getMediaAuthenticated } from './media.resolver';

export const getFile = async (args: {
  owner?: string;
  repository?: string;
  branch?: string;
  req: Request;
  res: Response;
  text?: boolean;
  download?: boolean;
  isFile: boolean;
}): Promise<void> => {
  // default query params:
  if (args.download === undefined) {
    args.download = false;
  }
  if (args.text === undefined) {
    args.text = true;
  }
  // run quick validation of input:
  if (args.isFile && (!args.owner || !args.repository || !args.branch)) {
    throw new BadRequestError('get file must contain owner, repo, and branch');
  }

  let s3FileData: S3Data;
  let fileName: string;
  try {
    const ctx = await getContext({
      req: args.req,
      res: args.res
    });
    let key: string;
    if (args.isFile) {
      const fullFilePath = args.req.path.split(`/files/${args.owner}/${args.repository}`)[1];
      const folderPath = dirname(fullFilePath);
      fileName = basename(folderPath);
      const fileData = await getFileAuthenticated({
        path: folderPath,
        branch: args.branch,
        name: fileName,
        owner: args.owner,
        repository: args.repository
      }, ctx);
      key = getFileKey(fileData.repository, fileData._id as ObjectId);
    } else {
      const mediaID = args.req.path.split('/media/')[1];
      const mediaObjectID = new ObjectId(mediaID);
      const mediaData = await getMediaAuthenticated({
        id: mediaObjectID,
      }, ctx);
      fileName = mediaData.name;
      key = getMediaKey(mediaData._id);
    }
    s3FileData = await getS3FileData(key, true);
  } catch (err) {
    const errObj = err as Error;
    throw new NotFoundError(`problem getting file: ${errObj.message}`);
  }

  let resMimeType: string;
  let downloadFile: boolean;
  if (args.download || !s3FileData.mime) {
    // download
    resMimeType = s3FileData.mime ? s3FileData.mime : 'application/octet-stream';
    downloadFile = true;
  } else if (checkText(s3FileData.mime)) { // don't download
    resMimeType = args.text ? 'text/plain' : s3FileData.mime;
    downloadFile = false;
  } else if (checkMedia(s3FileData.mime)) {
    // media type that can be displayed
    resMimeType = s3FileData.mime;
    downloadFile = false;
  } else {
    // binary file
    downloadFile = true;
    resMimeType = s3FileData.mime;
  }
  args.res.setHeader(contentTypeHeader, resMimeType);
  if (downloadFile) {
    args.res.setHeader('content-disposition', `attachment; filename=${fileName}`);
  }
  return new Promise<void>((resolve, reject) => {
    s3FileData.file.on('end', () => resolve());
    s3FileData.file.on('error', _err => reject(new InternalServerError('problem writing file')));
    s3FileData.file.pipe(args.res);
  });
};

@Path('/files')
class Files {
  @GET
  @Path('/:owner/:repository/:branch/*')
  async rawFile(@PathParam('owner') owner: string, @PathParam('repository') repository: string,
    @PathParam('branch') branch: string, @ContextRequest req: Request, @ContextResponse res: Response,
    @QueryParam('text') text?: boolean,
    @QueryParam('download') download?: boolean): Promise<void> {

    await getFile({
      isFile: true,
      req,
      res,
      branch,
      download,
      owner,
      repository,
      text
    });
  }
}

export default Files;
