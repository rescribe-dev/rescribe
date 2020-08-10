import { ObjectType, Field, Int } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import Access, { AccessLevel } from '../users/access';

@ObjectType({ description : 'base folder' })
export class BaseFolder {
  @Field({description : 'name'})
  @Property({required: false})
  name: string;

  @Field({description : 'path'})
  @Property({required: false})
  path: string;

  @Field(_type => [String], { description: 'branches' })
  @Property({ required: true, type: String })
  branches: string[];

  @Field({ description: 'repository' })
  @Property({ required: true })
  repository: ObjectId;

  @Field({ description: 'parent folder or repository' })
  @Property({ required: true })
  parent: ObjectId;

  @Field(_type => [Access], { description: 'public access level' })
  @Property({ required: true })
  public: AccessLevel;

  @Field({ description: 'date created' })
  @Property({required: true})
  created: number;

  @Field({ description: 'date updated' })
  @Property({required: true})
  updated: number;
}

// elastic
@ObjectType({ description: 'folder' })
export class Folder extends BaseFolder {
  @Field()
  readonly _id?: ObjectId;

  @Field(_type => Int, { description: 'number of branches' })
  numBranches: number;
}

// database
@ObjectType({ description: 'folder db' })
@modelOptions({schemaOptions: {collection: 'folders'}})
export class FolderDB extends BaseFolder {
  @Field()
  readonly _id: ObjectId;
}

export const FolderModel = getModelForClass(FolderDB);
