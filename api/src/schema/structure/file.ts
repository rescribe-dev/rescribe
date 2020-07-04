import { ObjectType, Field, Int } from 'type-graphql';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import AntlrFile from '../antlr/file';
import { AccessLevel } from '../auth/access';

export class BaseFile {
  @Property({ required: true })
  @Field({ description: 'file name' })
  name: string;

  @Property({ required: true })
  @Field({ description: 'has antlr data' })
  hasStructure: boolean;

  @Property({ required: true })
  @Field({ description: 'sha-1 hash' })
  hash: string;

  @Property({ required: true })
  @Field({ description: 'project id' })
  project: ObjectId;

  @Property({ required: true })
  @Field({ description: 'repository id' })
  repository: ObjectId;

  @Property({ required: true })
  @Field(_type => Int, { description: 'number of lines in file' })
  fileLength: number;

  @Property({ required: true })
  @Field(_type => [String], { description: 'branches' })
  branches: string[];

  @Property({ required: true })
  @Field(_type => AccessLevel, { description: 'public access level' })
  public: AccessLevel;

  @Property({ required: false })
  @Field({ description: 'folder', nullable: true })
  folder?: ObjectId;

  @Property({ required: true })
  @Field({ description: 'path' })
  path: string;

  @Property({ required: true })
  @Field({ description: 'date created' })
  created: number;

  @Property({ required: true })
  @Field({ description: 'date updated' })
  updated: number;
}

@modelOptions({ schemaOptions: { collection: 'files' } })
export class FileDB extends BaseFile {
  @Field()
  readonly _id: ObjectId;
}

export const FileModel = getModelForClass(FileDB);

export class BaseFileElastic extends BaseFile {
  @Field(_type => Int, { description: 'number of branches' })
  numBranches: number;

  @Field(_type => String, { description: 'file content' })
  content: string;
}

// input / result from elastic
@ObjectType({ description: 'file' })
export default class File extends AntlrFile implements BaseFileElastic {
  @Field({ description: 'sha-1 hash' })
  hash: string;

  @Field({ description: 'has antlr data' })
  hasStructure: boolean;

  @Field(_type => Int, { description: 'number of lines in file' })
  fileLength: number;

  @Field({ description: 'project id' })
  project: ObjectId;

  @Field({ description: 'repository id' })
  repository: ObjectId;

  @Field(_type => [String], { description: 'branches' })
  branches: string[];

  @Field(_type => Int, { description: 'number of branches' })
  numBranches: number;

  @Field(_type => AccessLevel, { description: 'public access level' })
  public: AccessLevel;

  @Field({ description: 'folder', nullable: true })
  folder?: ObjectId;

  @Field(_type => String, { description: 'file content' })
  content: string;

  @Field({ description: 'path' })
  path: string;

  @Field({ description: 'date created' })
  created: number;

  @Field({ description: 'date updated' })
  updated: number;
}
