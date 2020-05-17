/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, Args, Query, Ctx } from 'type-graphql';
// import File, { SearchResult, ResultType, FileModel } from '../schema/structure/file';
// import { ObjectId } from 'mongodb';
import { GraphQLContext } from '../utils/context';
// import Class from '../schema/antlr/class';
// import Function from '../schema/antlr/function';
// import Variable from '../schema/antlr/variable';
// import AntlrFile from '../schema/antlr/file';
// import Import from '../schema/antlr/import';
import { FilesArgs, search } from './files.resolver';
// import Comment from '../schema/antlr/comment';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
// import { getText } from './fileText.resolver';
import { SearchResult, ResultType } from '../schema/structure/file';
import { getLogger } from 'log4js';
import { ObjectId } from 'mongodb';

const logger = getLogger();

// const maxDescriptionLen = 30;

@Resolver()
class SearchResolver {
  @Query(_returns => [SearchResult])
  async search(@Args() args: FilesArgs, @Ctx() ctx: GraphQLContext): Promise<SearchResult[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    const elasticFileData = await search(user, args);
    const results: SearchResult[] = [];
    if (!elasticFileData) {
      return results;
    }
    logger.info(elasticFileData);
    logger.info(elasticFileData.body.hits.hits);

    // const fileData: { [key: string]: string } = {};
    for (const hit of elasticFileData.body.hits.hits) {
      logger.info(hit.highlight);
      logger.info(hit.inner_hits);
      for (const innerHit of hit.inner_hits.classes.hits.hits) {
        const currentResult: SearchResult = {
          _id: new ObjectId(hit._id as string),
          preview: '',
          structure: [],
          location: {
            start: 0,
            end: 0
          },
          type: ResultType.file,
          name: ''
        };
        logger.info(innerHit);
        results.push(currentResult);
      } 
    //   const highlights = hit.highlight as { [key: string]: string };
    //   for (const path in highlights) {
    //     const currentResult: SearchResult = {
    //       _id: new ObjectId(hit._id as string),
    //       description: '',
    //       structure: [],
    //       location: { now they're all read-write committing now on my bash 5
    //         start: 0,
    //         end: 0
    //       },
    //       type: ResultType.file,
    //       name: ''
    //     };
    //     const pathSplit = path.split('.');
    //     const lastKey = pathSplit.pop() as string;
    //     const value = highlights[path];
    //     const currentFile = hit._source as File;
    //     let currentElement = currentFile as any;
    //     let currentClass: Class | undefined = undefined;
    //     let currentFunction: Function | undefined = undefined;
    //     let currentVariable: Variable | undefined = undefined;
    //     let currentComment: Comment | undefined = undefined;
    //     let currentImport: Import | undefined = undefined;
    //     const propertyOf = <TObj>(name: keyof TObj): string => name as string;
    //     for (let i = 0; i < pathSplit.length; i++) {
    //       const key = pathSplit[i];
    //       currentElement = currentElement[key];
    //       switch (key) {
    //         case propertyOf<AntlrFile>('classes'):
    //           currentClass = currentElement as Class;
    //           currentResult.structure.push(currentClass.name);
    //           break;
    //         case propertyOf<AntlrFile>('functions'):
    //           currentFunction = currentElement as Function;
    //           currentResult.structure.push(currentFunction.name);
    //           break;
    //         case propertyOf<AntlrFile>('variables'):
    //           currentVariable = currentElement as Variable;
    //           currentResult.structure.push(currentVariable.name);
    //           break;
    //         case propertyOf<AntlrFile>('comments'):
    //           currentComment = currentElement as Comment;
    //           currentResult.structure.push('comment');
    //           break;
    //         case propertyOf<AntlrFile>('imports'):
    //           currentImport = currentElement as Import;
    //           currentResult.structure.push(currentImport.selection);
    //           break;
    //         default:
    //           break;
    //       }
    //     }
    //     if (currentComment !== undefined) {
    //       currentResult.type = ResultType.comment;
    //       if (currentVariable !== undefined) {
    //         currentResult.location = currentVariable.location;
    //       } else if (currentFunction !== undefined) {
    //         currentResult.location = currentFunction.location;
    //       } else if (currentClass !== undefined) {
    //         currentResult.location = currentClass.location;
    //       } else {
    //         currentResult.location = {
    //           start: 0,
    //           end: currentFile.fileLength - 1
    //         };
    //       }
    //     } else if (currentVariable !== undefined) {
    //       currentResult.type = ResultType.variable;
    //       currentResult.description = `variable ${currentVariable.name}`;
    //       currentResult.location = currentVariable.location;
    //     } else if (currentImport !== undefined) {
    //       currentResult.type = ResultType.import;
    //       currentResult.description = `import ${currentImport.selection}`;
    //       currentResult.location = currentImport.location;
    //     } else if (currentFunction !== undefined) {
    //       currentResult.type = ResultType.function;
    //       currentResult.description = `function ${currentFunction.name}`;
    //       currentResult.location = currentFunction.location;
    //     } else if (currentClass !== undefined) {
    //       currentResult.type = ResultType.class;
    //       currentResult.description = `class ${currentClass.name}`;
    //       currentResult.location = currentClass.location;
    //     } else if (pathSplit.length === 0) {
    //       // top level
    //       currentResult.location = {
    //         start: 0,
    //         end: currentFile.fileLength - 1
    //       };
    //       currentResult.structure.push(lastKey);
    //       switch (lastKey) {
    //         case propertyOf<AntlrFile>('name'):
    //           currentResult.description = `name of file: ${value}`;
    //           break;
    //         case propertyOf<AntlrFile>('importPath'):
    //           currentResult.description = `import path ${value}`;
    //           break;
    //         default:
    //           break;
    //       }
    //     } else {
    //       continue;
    //     }
    //     if (!currentFile._id) {
    //       continue;
    //     }
    //     if (!(currentFile._id.toHexString() in fileData)) {
    //       const file = await FileModel.findById(currentFile._id);
    //       if (!file) {
    //         throw new Error(`cannot find file ${currentFile._id.toHexString()}`);
    //       }
    //       const delta = maxDescriptionLen - currentResult.description.length;
    //       if (delta > 0) {
    //         if (Math.abs(currentResult.location.end
    //           - currentResult.location.start) > delta) {
    //           currentResult.location.end = currentResult.location.start + delta;
    //         }
    //         currentResult.description += await getText(file, user, currentResult.location);
    //       }
    //     }
    //     results.push(currentResult);
    //   }
    }
    return results;
  }
}

/*
"highlight": {
  "classes.functions.arguments.name": [
    "asdf"
  ]
}
*/

export default SearchResolver;
