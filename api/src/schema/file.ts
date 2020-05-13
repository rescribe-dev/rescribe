import { ObjectType, Field } from 'type-graphql';
import Class from './class';
import Import from './import';
import Variable from './variable';
import Comment from './comment';
import Function from './function';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';

export enum StorageType {
  local = 'local',
  github = 'github',
}

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
  @Field({ description: 'project id' })
  projectID: string;
  @Field({ description: 'repository id' })
  repositoryID: string;
  @Field({ description: 'branch id' })
  branchID: string;
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}

// result from api
@ObjectType({ description: 'file search result' })
export class FileSearchResult extends File {
  @Field()
  readonly _id: ObjectId;
  @Field(_type => [String], { description: 'matching field' })
  fields: string[];
}
