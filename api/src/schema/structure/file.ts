import { ObjectType, Field, Int } from 'type-graphql';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import AntlrFile from '../antlr/file';
import { AccessLevel } from '../users/access';
import { Language } from '../misc/language';
import { BaseTimestamp } from '../misc/timestamp';

export class BaseFile {
  @Property({ required: true })
  name: string;

  @Property({ required: true })
  hasStructure: boolean;

  @Property({ required: true })
  hash: string;

  @Property({ required: true })
  repository: ObjectId;

  @Property({ required: true })
  fileLength: number;

  @Property({ required: true, type: String })
  branches: string[];

  @Property({ required: true })
  public: AccessLevel;

  @Property({ required: false })
  folder?: ObjectId;

  @Property({ required: true })
  path: string;

  @Property({ required: true })
  created: number;

  @Property({ required: true })
  updated: number;
}

@modelOptions({ schemaOptions: { collection: 'files' } })
export class FileDB extends BaseFile {
  @Field()
  readonly _id: ObjectId;
}

export const FileModel = getModelForClass(FileDB);

export class BaseFileElastic extends BaseFile {
  numBranches: number;

  content: string;

  nameSearch: string;

  @Field(_type => Language, { description: 'language type' })
  language: Language;
}

// input / result from elastic
@ObjectType({ description: 'file' })
export default class File extends AntlrFile implements BaseFileElastic, BaseTimestamp {
  nameSearch: string;

  @Field({ description: 'sha-1 hash' })
  hash: string;

  @Field({ description: 'has antlr data' })
  hasStructure: boolean;

  @Field(_type => Int, { description: 'number of lines in file' })
  fileLength: number;

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

  content: string;

  @Field({ description: 'path' })
  path: string;

  @Field({ description: 'date created' })
  created: number;

  @Field({ description: 'date updated' })
  updated: number;
}
