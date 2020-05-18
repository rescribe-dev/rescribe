/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, Args, Query, Ctx } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import Class from '../schema/antlr/class';
import Function from '../schema/antlr/function';
import Variable from '../schema/antlr/variable';
import Import from '../schema/antlr/import';
import { FilesArgs, search } from './files.resolver';
import Comment from '../schema/antlr/comment';
import { verifyLoggedIn } from '../auth/checkAuth';
import { UserModel } from '../schema/auth/user';
import File, { SearchResult, ResultType, FileModel } from '../schema/structure/file';
import { ObjectId } from 'mongodb';
import NestedObject from '../schema/antlr/nestedObject';
import { getText, getLines } from './fileText.resolver';


const maxPreviewLen = 30;
const propertyOf = <TObj>(name: keyof TObj): string => name as string;

interface DataRes {
  name: string;
  currentObject: NestedObject;
};

const getData = (currentData: object, type: ResultType): DataRes | null => {
  let currentObject: NestedObject | undefined = undefined;
  let currentClass: Class | undefined = undefined;
  let currentFunction: Function | undefined = undefined;
  let currentVariable: Variable | undefined = undefined;
  let currentComment: Comment | undefined = undefined;
  let currentImport: Import | undefined = undefined;
  switch (type) {
    case ResultType.class:
      currentClass = currentData as Class;
      currentObject = currentClass;
      return {
        name: currentClass.name,
        currentObject
      };
    case ResultType.function:
      currentFunction = currentData as Function;
      currentObject = currentFunction;
      return {
        name: currentFunction.name,
        currentObject
      };
    case ResultType.variable:
      currentVariable = currentData as Variable;
      currentObject = currentVariable;
      return {
        name: currentVariable.name,
        currentObject
      };
    case ResultType.comment:
      currentComment = currentData as Comment;
      currentObject = currentComment;
      return {
        name: 'comment',
        currentObject
      };
    case ResultType.import:
      currentImport = currentData as Import;
      currentObject = currentImport;
      return {
        name: 'import',
        currentObject
      };
    default:
      return null;
  }
};

export const hitExclude = ['project', 'repository'];

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
    const fileData: { [key: string]: string } = {};
    for (const hit of elasticFileData.body.hits.hits) {
      const fileID = new ObjectId(hit._id as string);
      const highlight = hit.highlight as { [key: string]: string[] };
      for (const highlightField in highlight) {
        if (!hitExclude.includes(highlightField)) {
          const currentResult: SearchResult = {
            _id: fileID,
            preview: '',
            structure: [],
            location: {
              start: 1,
              end: 1,
            },
            type: ResultType.file,
            name: '',
          };
          switch (highlightField) {
            case propertyOf<File>('name'):
              currentResult.type = ResultType.name;
              currentResult.preview = highlight[highlightField][0];
              break;
            case propertyOf<File>('path'):
              currentResult.type = ResultType.path;
              currentResult.preview = highlight[highlightField][0];
              break;
            case propertyOf<File>('importPath'):
              currentResult.type = ResultType.importPath;
              currentResult.preview = highlight[highlightField][0];
              break;
            default:
              break;
          }
          results.push(currentResult);
        }
      }
      for (const field in hit.inner_hits) {
        const currentField = hit.inner_hits[field];
        for(const innerHit in currentField.hits.hits) {
          const currentInnerHit = currentField.hits.hits[innerHit];
          const currentData: object = currentInnerHit._source;
          const currentResult: SearchResult = {
            _id: fileID,
            preview: '',
            structure: [],
            location: {
              start: 1,
              end: 1,
            },
            type: ResultType.file,
            name: '',
          };
          switch (field) {
            case propertyOf<File>('classes'):
              currentResult.type = ResultType.class;
              break;
            case propertyOf<File>('functions'):
              currentResult.type = ResultType.function;
              break;
            case propertyOf<File>('variables'):
              currentResult.type = ResultType.variable;
              break;
            case propertyOf<File>('comments'):
              currentResult.type = ResultType.comment;
              break;
            case propertyOf<File>('imports'):
              currentResult.type = ResultType.import;
              break;
            default:
              break;
          }
          const data = getData(currentData, currentResult.type);
          if (data) {
            currentResult.name = data.name;
            currentResult.location = data.currentObject.location;
            const structure: string[] = [];
            currentResult.structure = structure;
            if (!(fileID.toHexString() in fileData)) {
              const file = await FileModel.findById(fileID);
              if (!file) {
                throw new Error(`cannot find file ${fileID.toHexString()}`);
              }
              try {
                fileData[fileID.toHexString()] = await getText(file, user, {
                  start: 1,
                  end: file.fileLength
                });
              } catch (err) {
                // no text found
              }
            }
            if (fileData[fileID.toHexString()]) {
              const preview = getLines(fileData[fileID.toHexString()], currentResult.location);
              if (preview.length > maxPreviewLen) {
                currentResult.preview = preview.substr(0, maxPreviewLen);
              } else {
                currentResult.preview = preview;
              }
              currentResult.preview = currentResult.preview.trim();
            }
            results.push(currentResult);
          }
        }
      }
    }
    return results;
  }
}

export default SearchResolver;
