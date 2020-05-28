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
import User, { UserModel } from '../schema/auth/user';
import File, { FileModel } from '../schema/structure/file';
import { SearchResult, ResultType, FileResult, FileLocation } from '../schema/structure/search';
import { ObjectId } from 'mongodb';
import NestedObject from '../schema/antlr/nestedObject';
import { getText, getLinesArray } from './fileText.resolver';
import { languageColorMap } from '../schema/structure/language';
import { RepositoryModel, RepositoryDB } from '../schema/structure/repository';
import { AccessLevel } from '../schema/auth/access';


const maxPreviewLineLen = 30;
const minLinesToSplit = 7;
const splitLength = Math.floor(minLinesToSplit / 2);

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
  @Query(_returns => [FileResult])
  async search(@Args() args: FilesArgs, @Ctx() ctx: GraphQLContext): Promise<FileResult[]> {
    if (!verifyLoggedIn(ctx) || !ctx.auth) {
      throw new Error('user not logged in');
    }
    const userData: { [key: string]: User } = {};
    const user = await UserModel.findById(ctx.auth.id);
    if (!user) {
      throw new Error('cannot find user');
    }
    userData[ctx.auth.id] = user;
    const repositoryData: { [key: string]: RepositoryDB } = {};
    const elasticFileData = await search(user, args, repositoryData);
    const results: FileResult[] = [];
    if (!elasticFileData) {
      return results;
    }
    const fileData: { [key: string]: string[] } = {};
    const locationData: { [key: string]: FileLocation } = {};
    for (const hit of elasticFileData.body.hits.hits) {
      const fileID = new ObjectId(hit._id as string);
      const currentFile: File = {
        ...hit._source as File,
        _id: new ObjectId(hit._id as string),
      };
      if (!(fileID.toHexString() in locationData)) {
        if (!(currentFile.repository in repositoryData)) {
          const repository = await RepositoryModel.findById(currentFile.repository);
          if (!repository) {
            throw new Error(`cannot find repository ${currentFile.repository}`);
          }
          repositoryData[currentFile.repository] = repository;
        }
        const repository = repositoryData[currentFile.repository];
        const userAccess = repository.access.find(access => access.level === AccessLevel.owner);
        if (!userAccess) {
          throw new Error('no owner found for repository');
        }
        if (!(userAccess._id.toHexString() in userData)) {
          const currentUser = await UserModel.findById(userAccess._id);
          if (!currentUser) {
            throw new Error(`cannot find user with id ${userAccess._id.toHexString()}`);
          }
          userData[userAccess._id.toHexString()] = currentUser;
        }
        locationData[fileID.toHexString()] = {
          image: repository.image,
          owner: userData[userAccess._id.toHexString()].name,
          repository: repository.name
        };
      }
      const currentFileResult: FileResult = {
        _id: fileID,
        lines: {
          start: 1,
          end: currentFile.fileLength
        },
        language: {
          color: languageColorMap[currentFile.language],
          name: currentFile.language
        },
        location: locationData[fileID.toHexString()],
        name: currentFile.name,
        path: currentFile.path,
        branches: currentFile.branches,
        results: []
      };
      const highlight = hit.highlight as { [key: string]: string[] };
      for (const highlightField in highlight) {
        if (!hitExclude.includes(highlightField)) {
          const currentResult: SearchResult = {
            type: ResultType.file,
            name: '',
            parents: [],
            startPreviewLineNumber: -1,
            endPreviewLineNumber: -1,
            startPreviewContent: [],
            endPreviewContent: []
          };
          switch (highlightField) {
            case propertyOf<File>('name'):
              currentResult.type = ResultType.name;
              currentResult.name = highlight[highlightField][0];
              break;
            case propertyOf<File>('path'):
              currentResult.type = ResultType.path;
              currentResult.name = highlight[highlightField][0];
              break;
            case propertyOf<File>('importPath'):
              currentResult.type = ResultType.importPath;
              currentResult.name = highlight[highlightField][0];
              break;
            default:
              continue;
          }
          currentFileResult.results.push(currentResult);
        }
      }
      for (const field in hit.inner_hits) {
        const currentField = hit.inner_hits[field];
        for(const innerHit in currentField.hits.hits) {
          const currentInnerHit = currentField.hits.hits[innerHit];
          const currentData: object = currentInnerHit._source;
          const currentResult: SearchResult = {
            type: ResultType.file,
            name: '',
            parents: [],
            startPreviewLineNumber: -1,
            endPreviewLineNumber: -1,
            startPreviewContent: [],
            endPreviewContent: []
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
            currentResult.startPreviewLineNumber = data.currentObject.location.start;
            const delta = data.currentObject.location.end - currentResult.startPreviewLineNumber;
            const useSplit = delta >= minLinesToSplit;
            let endStartPreviewLine: number;
            let endEndPreviewLine: number;
            if (useSplit) {
              currentResult.endPreviewLineNumber = data.currentObject.location.end - splitLength + 1;
              endStartPreviewLine = currentResult.startPreviewLineNumber + splitLength - 1;
              endEndPreviewLine = data.currentObject.location.end;
            } else {
              endStartPreviewLine = data.currentObject.location.end;
              endEndPreviewLine = -1;
            }
            if (!(fileID.toHexString() in fileData)) {
              const file = await FileModel.findById(fileID);
              if (!file) {
                throw new Error(`cannot find file ${fileID.toHexString()}`);
              }
              try {
                fileData[fileID.toHexString()] = await getText(file, file.branches[0], user, {
                  start: 1, // start at line 1
                  end: file.fileLength
                });
              } catch (err) {
                // no text found
              }
            }
            if (fileData[fileID.toHexString()]) {
              currentResult.startPreviewContent = getLinesArray(fileData[fileID.toHexString()], {
                start: currentResult.startPreviewLineNumber,
                end: endStartPreviewLine
              }, true, maxPreviewLineLen);
              if (useSplit) {
                currentResult.endPreviewContent = getLinesArray(fileData[fileID.toHexString()], {
                  start: currentResult.endPreviewLineNumber,
                  end: endEndPreviewLine
                }, true, maxPreviewLineLen);
              }
            }
            currentFileResult.results.push(currentResult);
          }
        }
      }
      results.push(currentFileResult);
    }
    return results;
  }
}

export default SearchResolver;
