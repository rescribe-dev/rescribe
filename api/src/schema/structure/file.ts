import { ObjectType, Field, registerEnumType, Int } from 'type-graphql';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import AntlrFile from '../antlr/file';
import { AccessLevel } from '../auth/access';

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
  project: ObjectId;
  @Property({ required: true })
  repository: ObjectId;
  @Property({ required: true })
  branch: ObjectId;
  @Property({ required: true, type: AccessLevel })
  public: AccessLevel;
  @Property({ required: true })
  fileLength: number;
  @Property({ required: true })
  path: string;
  @Property({ required: true })
  location: StorageType;
  @Property({ required: true })
  saveContent: boolean;
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
  @Field({ description: 'branch id' })
  branch: string;
  @Field(_type => AccessLevel, { description: 'public access level' })
  public: AccessLevel;
  @Field({ description: 'path' })
  path: string;
  @Field({ description: 'storage location' })
  location: StorageType;
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}
