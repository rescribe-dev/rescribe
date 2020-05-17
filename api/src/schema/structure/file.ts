import { ObjectType, Field, registerEnumType, Int } from 'type-graphql';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import Location from '../antlr/location';
import AntlrFile from '../antlr/file';

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
  @Property({ required: true })
  fileLength: number;
  @Property({ required: true })
  path: string;
  @Property({ required: true })
  location: StorageType;
  @Property({ required: false })
  content: string;
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
  name = 'name',
  path = 'path',
  importPath = 'importPath',
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
  preview: string;
  @Field(_type => [String], { description: 'nested path' })
  structure: string[];
}
