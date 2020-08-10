import { Resolver, Args, Query, Ctx, Int, ArgsType, Field, Info } from 'type-graphql';
import { GraphQLContext } from '../utils/context';
import Class from '../schema/antlr/class';
import FunctionType from '../schema/antlr/function';
import Variable from '../schema/antlr/variable';
import Import from '../schema/antlr/import';
import { FilesArgs, search } from './files.resolver';
import Comment from '../schema/antlr/comment';
import { verifyLoggedIn } from '../auth/checkAuth';
import User, { UserModel } from '../schema/users/user';
import File, { FileModel } from '../schema/structure/file';
import { SearchResult, ResultType, FileResult, FileLocation, Preview } from '../schema/structure/search';
import { ObjectId } from 'mongodb';
import NestedObject from '../schema/antlr/nestedObject';
import { getText, getLinesArray } from './fileText.resolver';
import { RepositoryModel, RepositoryDB } from '../schema/structure/repository';
import { Min } from 'class-validator';
import { getLogger } from 'log4js';
import graphqlFields from 'graphql-fields';
import { hasPagination } from '../elastic/pagination';
import Location from '../schema/antlr/location';
import { languageColorMap } from '../utils/variables';
import { GraphQLResolveInfo } from 'graphql';

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

const propertyOf = <TObj>(name: keyof TObj): string => name as string;

export const fileHitInclude = [
  propertyOf<File>('name'),
  propertyOf<File>('path'),
  propertyOf<File>('importPath')
];

interface DataRes {
  name: string;
  currentObject: NestedObject;
};

const getData = (currentData: Record<string, unknown>, type: ResultType): DataRes | null => {
  let currentObject: NestedObject | undefined = undefined;
  let currentClass: Class | undefined = undefined;
  let currentFunction: FunctionType | undefined = undefined;
  let currentVariable: Variable | undefined = undefined;
  let currentComment: Comment | undefined = undefined;
  let currentImport: Import | undefined = undefined;
  switch (type) {
    case ResultType.class:
      currentClass = currentData as unknown as Class;
      currentObject = currentClass;
      return {
        name: currentClass.name,
        currentObject
      };
    case ResultType.function:
      currentFunction = currentData as unknown as FunctionType;
      currentObject = currentFunction;
      return {
        name: currentFunction.name,
        currentObject
      };
    case ResultType.variable:
      currentVariable = currentData as unknown as Variable;
      currentObject = currentVariable;
      return {
        name: currentVariable.name,
        currentObject
      };
    case ResultType.comment:
      currentComment = currentData as unknown as Comment;
      currentObject = currentComment;
      return {
        name: 'comment',
        currentObject
      };
    case ResultType.import:
      currentImport = currentData as unknown as Import;
      currentObject = currentImport;
      return {
        name: 'import',
        currentObject
      };
    default:
      return null;
  }
};

const getPreview = async (fileData: { [key: string]: string[] }, fileID: ObjectId, preview: Preview, location?: Location): Promise<void> => {
  if (!location) {
    location = {
      start: 1,
      end: minLinesToSplit
    };
  }
  preview.startPreviewLineNumber = location.start;
  const delta = location.end - preview.startPreviewLineNumber;
  const useSplit = delta >= minLinesToSplit;
  let endStartPreviewLine: number;
  let endEndPreviewLine: number;
  if (useSplit) {
    endStartPreviewLine = preview.startPreviewLineNumber + splitLength - 1;
    preview.endPreviewLineNumber = location.end - splitLength + 1;
    endEndPreviewLine = location.end;
  } else {
    endStartPreviewLine = location.end;
    endEndPreviewLine = -1;
  }
  if (!(fileID.toHexString() in fileData)) {
    const file = await FileModel.findById(fileID);
    if (!file) {
      throw new Error(`cannot find file ${fileID.toHexString()}`);
    }
    const startTime2 = new Date();
    try {
      fileData[fileID.toHexString()] = await getText(file, {
        start: 1, // start at line 1
        end: file.fileLength
      });
    } catch (err) {
      // no text found
      // logger.info(err);
    }
    logger.info(`time for get text: ${new Date().getTime() - startTime2.getTime()}`);
  }
  if (fileData[fileID.toHexString()]) {
    preview.startPreviewContent = getLinesArray(fileData[fileID.toHexString()], {
      start: preview.startPreviewLineNumber,
      end: endStartPreviewLine
    }, true, maxPreviewLineLen);
    if (useSplit) {
      preview.endPreviewContent = getLinesArray(fileData[fileID.toHexString()], {
        start: preview.endPreviewLineNumber,
        end: endEndPreviewLine
      }, true, maxPreviewLineLen);
    }
  }
};

@Resolver()
class SearchResolver {
  @Query(_returns => [FileResult])
  async search(@Args() args: SearchArgs, @Ctx() ctx: GraphQLContext, @Info() info: GraphQLResolveInfo): Promise<FileResult[]> {
    const startTime = new Date();
    const oneFile = args.file !== undefined;
    if (args.maxResultsPerFile !== undefined && oneFile) {
      throw new Error('max results cannot be defined when searching through single file');
    }
    const userData: { [key: string]: User } = {};
    let user: User | null = null;
    if (verifyLoggedIn(ctx) && ctx.auth) {
      user = await UserModel.findById(ctx.auth.id);
      if (!user) {
        throw new Error('cannot find user');
      }
      userData[ctx.auth.id] = user;
    }
    const repositoryData: { [key: string]: RepositoryDB } = {};
    // do the actual search:
    const elasticFileData = await search(user, args, repositoryData);
    const results: FileResult[] = [];
    if (!elasticFileData) {
      return results;
    }

    // preprocessing the postprocessing:

    const fileData: { [key: string]: string[] } = {};
    const locationData: { [key: string]: FileLocation } = {};
    let resultIndex = 0;
    let resultStartIndex = 0;
    let resultEndIndex = -1;
    const paginateResults = oneFile && hasPagination(args);
    if (args.page !== undefined && args.perpage !== undefined) {
      resultStartIndex = args.page * args.perpage;
      resultEndIndex = resultStartIndex + args.perpage;
    }

    const topLevelFields = graphqlFields(info);
    const topLevelFieldNames = Object.keys(topLevelFields);

    // iterate over top-level hits

    for (const hit of elasticFileData.body.hits.hits) {
      const fileID = new ObjectId(hit._id as string);
      const currentFile: File = {
        ...hit._source as File,
        _id: new ObjectId(hit._id as string),
      };
      currentFile.repository = new ObjectId(currentFile.repository);

      // get file data

      if (!(fileID.toHexString() in locationData)) {
        if (!(currentFile.repository.toHexString() in repositoryData)) {
          const repository = await RepositoryModel.findById(currentFile.repository);
          if (!repository) {
            throw new Error(`cannot find repository ${currentFile.repository}`);
          }
          repositoryData[currentFile.repository.toHexString()] = repository;
        }
        const repository = repositoryData[currentFile.repository.toHexString()];
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

      // iterate over file highlights
      let resultCount = 0;
      if (topLevelFieldNames.includes(propertyOf<FileResult>('fileResult'))) {
        for (const highlightField in highlight) {
          if (fileHitInclude.includes(highlightField)) {
            if (!currentFileResult.fileResult) {
              if (paginateResults) {
                resultIndex++;
                if (resultIndex - 1 < resultStartIndex || resultIndex - 1 >= resultEndIndex) {
                  break;
                }
              }
              resultCount = 0;
              const preview: Preview = {
                startPreviewLineNumber: -1,
                endPreviewLineNumber: -1,
                startPreviewContent: [],
                endPreviewContent: [],
              };
              currentFileResult.fileResult = {
                preview,
                results: []
              };
              await getPreview(fileData, fileID, preview);
            }
            const currentResult: SearchResult = {
              type: ResultType.name,
              name: '',
              parents: []
            };
            switch (highlightField) {
              case fileHitInclude[0]:
                currentResult.type = ResultType.name;
                currentResult.name = highlight[highlightField][0];
                break;
              case fileHitInclude[1]:
                currentResult.type = ResultType.path;
                currentResult.name = highlight[highlightField][0];
                break;
              case fileHitInclude[2]:
                currentResult.type = ResultType.importPath;
                currentResult.name = highlight[highlightField][0];
                break;
              default:
                continue;
            }
            currentFileResult.fileResult.results.push(currentResult);
            resultCount++;
            if (args.maxResultsPerFile === resultCount) {
              break;
            }
          }
        }
        if (paginateResults && resultIndex - 1 >= resultEndIndex) {
          return results;
        }
        if (args.maxResultsPerFile === resultCount) {
          results.push(currentFileResult);
          continue;
        }
      }

      // at this point done with file results.
      // now look at inner hits

      if (topLevelFieldNames.includes(propertyOf<FileResult>('results'))) {
        // get the highest score
        const currentIndexes: { [key: string]: number } = {};
        let foundHit: boolean;
        let firstRound = true;
        for (; ;) {
          foundHit = false;
          let maxScore = -1;
          let field = '';
          for (const currentField in hit.inner_hits) {
            const currentFieldData = hit.inner_hits[currentField];
            const currentHits = currentFieldData.hits.hits;
            if (firstRound && currentHits.length > 0) {
              currentIndexes[currentField] = 0;
            }
            if (currentHits.length > currentIndexes[currentField]) {
              foundHit = true;
              const currentScore = currentHits[currentIndexes[currentField]]._score;
              if (currentScore > maxScore) {
                maxScore = currentScore;
                field = currentField;
              }
            }
          }
          if (!foundHit) {
            break;
          }
          firstRound = false;
          const currentIndex = currentIndexes[field];

          // pagination
          currentIndexes[field]++;
          if (paginateResults) {
            resultIndex++;
            if (resultIndex - 1 < resultStartIndex) {
              continue;
            } else if (resultIndex - 1 >= resultEndIndex) {
              break;
            }
          }

          const currentField = hit.inner_hits[field];
          const currentInnerHit = currentField.hits.hits[currentIndex];
          // now found max field score. iterate over it:
          const currentData: Record<string, unknown> = currentInnerHit._source;
          const currentResult: SearchResult = {
            type: ResultType.name,
            name: '',
            parents: [],
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
            const preview: Preview = {
              startPreviewLineNumber: -1,
              endPreviewLineNumber: -1,
              startPreviewContent: [],
              endPreviewContent: [],
            };
            await getPreview(fileData, fileID, preview, data.currentObject.location);
            currentResult.preview = preview;
            currentFileResult.results.push(currentResult);
            resultCount++;
            if (args.maxResultsPerFile === resultCount) {
              break;
            }
          }
        }
      }
      results.push(currentFileResult);
    }
    logger.info(`total time: ${new Date().getTime() - startTime.getTime()}`);
    return results;
  }
}

export default SearchResolver;
