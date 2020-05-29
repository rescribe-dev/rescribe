/* eslint-disable @typescript-eslint/camelcase */

import { Resolver, Args, Query, Ctx, Int, ArgsType, Field } from 'type-graphql';
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
import { Min } from 'class-validator';
import { getLogger } from 'log4js';
import { hasPagination } from '../utils/pagination';

@ArgsType()
class SearchArgs extends FilesArgs {
  @Min(1, {
    message: 'page number must be greater than or equal to 0'
  })
  @Field(_type => Int, { description: 'end line', nullable: true })
  maxResultsPerFile?: number;
}

const logger = getLogger();

const maxPreviewLineLen = 100;
const minLinesToSplit = 7;
const splitLength = Math.floor(minLinesToSplit / 2);

export const hitExclude = ['project', 'repository'];

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

interface Sortable {
  score: number;
}

const sortByScore = (a: Sortable, b: Sortable): number => (a.score < b.score) ? 1 : ((b.score < a.score) ? -1 : 0);

@Resolver()
class SearchResolver {
  @Query(_returns => [FileResult])
  async search(@Args() args: SearchArgs, @Ctx() ctx: GraphQLContext): Promise<FileResult[]> {
    const startTime = new Date();
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
    let resultIndex = 0;
    let resultStartIndex = 0;
    let resultEndIndex = -1;
    const oneFile = args.file !== undefined;
    const paginateResults = oneFile && hasPagination(args);
    if (args.page !== undefined && args.perpage !== undefined) {
      resultStartIndex = args.page * args.perpage;
      resultEndIndex = resultStartIndex + args.perpage;
    }
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
        if (!(repository.owner.toHexString() in userData)) {
          const currentUser = await UserModel.findById(repository.owner);
          if (!currentUser) {
            throw new Error(`cannot find user with id ${repository.owner.toHexString()}`);
          }
          userData[repository.owner.toHexString()] = currentUser;
        }
        locationData[fileID.toHexString()] = {
          image: repository.image,
          owner: userData[repository.owner.toHexString()].name,
          repository: repository.name
        };
      }
      const currentFileResult: FileResult = {
        _id: fileID,
        lines: {
          start: 1,
          end: currentFile.fileLength + 1
        },
        language: {
          color: languageColorMap[currentFile.language],
          name: currentFile.language
        },
        location: locationData[fileID.toHexString()],
        name: currentFile.name,
        path: currentFile.path,
        branches: currentFile.branches,
        results: [],
        score: hit._score
      };
      const highlight = hit.highlight as { [key: string]: string[] };
      for (const highlightField in highlight) {
        if (!hitExclude.includes(highlightField)) {
          resultIndex++;
          if (paginateResults && (resultIndex - 1 < resultStartIndex || resultIndex - 1 >= resultEndIndex)) {
            continue;
          }
          const currentResult: SearchResult = {
            type: ResultType.file,
            name: '',
            parents: [],
            startPreviewLineNumber: -1,
            endPreviewLineNumber: -1,
            startPreviewContent: [],
            endPreviewContent: [],
            score: hit._score
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
          if (currentFileResult.results.length === args.maxResultsPerFile) {
            break;
          }
        }
      }
      if (currentFileResult.results.length === args.maxResultsPerFile) {
        results.push(currentFileResult);
        continue;
      }
      for (const field in hit.inner_hits) {
        const currentField = hit.inner_hits[field];
        for(const innerHit in currentField.hits.hits) {
          resultIndex++;
          if (paginateResults && (resultIndex - 1 < resultStartIndex || resultIndex - 1 >= resultEndIndex)) {
            continue;
          }
          const currentInnerHit = currentField.hits.hits[innerHit];
          const currentData: object = currentInnerHit._source;
          const currentResult: SearchResult = {
            type: ResultType.file,
            name: '',
            parents: [],
            startPreviewLineNumber: -1,
            endPreviewLineNumber: -1,
            startPreviewContent: [],
            endPreviewContent: [],
            score: currentInnerHit._score
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
              endStartPreviewLine = currentResult.startPreviewLineNumber + splitLength - 1;
              currentResult.endPreviewLineNumber = data.currentObject.location.end - splitLength + 1;
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
              const startTime2 = new Date();
              try {
                fileData[fileID.toHexString()] = await getText(file, file.branches[0], user, {
                  start: 1, // start at line 1
                  end: file.fileLength
                });
              } catch (err) {
                // no text found
              }
              logger.info(`time for get text: ${new Date().getTime() - startTime2.getTime()}`);
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
            if (currentFileResult.results.length === args.maxResultsPerFile) {
              break;
            }
          }
        }
        if (currentFileResult.results.length === args.maxResultsPerFile) {
          break;
        }
      }
      currentFileResult.results = currentFileResult.results.sort(sortByScore);
      results.push(currentFileResult);
    }
    logger.info(`total time: ${new Date().getTime() - startTime.getTime()}`);
    return results.sort(sortByScore);
  }
}

export default SearchResolver;
