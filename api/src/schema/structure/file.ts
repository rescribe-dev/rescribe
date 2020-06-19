import { ObjectType, Field, Int } from 'type-graphql';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import AntlrFile from '../antlr/file';
import { AccessLevel } from '../auth/access';

@modelOptions({ schemaOptions: { collection: 'files' } })
export class FileDB {
  @Field()
  readonly _id: ObjectId;
  @Property({ required: true })
  project: ObjectId;
  @Property({ required: true })
  repository: ObjectId;
  @Property({ required: true })
  branches: string[];
  @Property({ required: true })
  public: AccessLevel;
  @Property({ required: false })
  folder?: ObjectId;
  @Property({ required: true })
  fileLength: number;
  @Property({ required: true })
  path: string;
  @Property({ required: true })
  name: string;
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}

export const FileModel = getModelForClass(FileDB);

// input / result from elastic
@ObjectType({ description: 'file' })
export default class File extends AntlrFile {
  @Field(_type => Int, { description: 'number of lines in file' })
  fileLength: number;
  @Field({ description: 'project id' })
  project: string;
  @Field({ description: 'repository id' })
  repository: string;
  @Field(_type => [String], { description: 'branches' })
  branches: string[];
  @Field(_type => Int, { description: 'number of branches' })
  numBranches: number;
  @Field(_type => AccessLevel, { description: 'public access level' })
  public: AccessLevel;
  @Field({ description: 'folder', nullable: true })
  folder?: ObjectId;
  @Field({ description: 'path' })
  path: string;
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}
