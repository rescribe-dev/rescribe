import { ObjectType, Field, registerEnumType, Int } from 'type-graphql';
import Class from './class';
import Import from './import';
import Variable from './variable';
import Comment from './comment';
import Function from './function';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import Location from './location';

export enum StorageType {
  local = 'local',
  github = 'github',
}

registerEnumType(StorageType, {
  name: 'StorageType',
  description: 'storage type',
});

@modelOptions({ schemaOptions: { collection: 'files' } })
export class FileDB {
  @Field()
  readonly _id: ObjectId;
  @Property({ required: true })
  projectID: ObjectId;
  @Property({ required: true })
  repositoryID: ObjectId;
  @Property({ required: true })
  branchID: ObjectId;
  @Property({ required: true })
  path: string;
  @Property({ required: true })
  location: StorageType;
  @Property({ required: false })
  content: string;
}

export const FileModel = getModelForClass(FileDB);

// output from antlr
@ObjectType({ description: 'base file' })
export class AntlrFile {
  @Field({ description: 'file name' })
  name: string;
  @Field(_type => [Class], { description: 'classes' })
  classes: Class[];
  @Field(_type => [Function], { description: 'functions' })
  functions: Function[];
  @Field(_type => [Variable], { description: 'variables' })
  variables: Variable[];
  @Field(_type => [Import], { description: 'imports' })
  imports: Import[];
  @Field(_type => [Comment], { description: 'comments' })
  comments: Comment[];
  @Field({ description: 'import path' })
  importPath: string;
}

// input / result from elastic
@ObjectType({ description: 'file' })
export default class File extends AntlrFile {
  @Field()
  readonly _id?: ObjectId;
  @Field(_type => Int, { description: 'number of lines in file' })
  fileLength: number;
  @Field({ description: 'project id' })
  projectID: string;
  @Field({ description: 'repository id' })
  repositoryID: string;
  @Field({ description: 'branch id' })
  branchID: string;
  @Field({ description: 'path' })
  path: string;
  @Field({ description: 'storage location' })
  location: StorageType;
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}

export enum ResultType {
  file = 'file',
  import = 'import',
  class = 'class',
  function = 'function',
  variable = 'variable',
  comment = 'comment',
}

registerEnumType(ResultType, {
  name: 'ResultType',
  description: 'result type',
});

// result from api
@ObjectType({ description: 'search result' })
export class SearchResult {
  @Field({ description: 'file id' })
  readonly _id: ObjectId;
  @Field({ description: 'location - line numbers' })
  location: Location;
  @Field({ description: 'name' })
  name: string;
  @Field({ description: 'type' })
  type: ResultType;
  @Field({ description: 'main description' })
  description: string;
  @Field({ description: 'nested path' })
  structure: string[];
}
