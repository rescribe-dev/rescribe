import { ObjectType, Field, Int } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import Access, { AccessLevel } from '../auth/access';

@ObjectType({ description : 'base repository' })
export class BaseRepository {
  @Field({description : 'name'})
  @Property({required: true})
  name:string;

  @Field({ description: 'branches' })
  @Property({required: true})
  owner: ObjectId;

  @Field(_type => [String], { description: 'branches' })
  @Property({required: true})
  branches: string[];

  @Field({ description: 'project' })
  @Property({required: true})
  project: ObjectId;

  @Field(_type => [Access], { description: 'public access level' })
  @Property({ required: true })
  public: AccessLevel;
}

@ObjectType({ description: 'repository' })
export class Repository extends BaseRepository {
  @Field()
  readonly _id?: ObjectId;
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
  @Field(_type => Int, { description: 'number of branches' })
  numBranches: number;
}
@ObjectType({ description: 'repository db' })
@modelOptions({schemaOptions: {collection: 'repositories'}})
export class RepositoryDB extends BaseRepository {
  @Field()
  readonly _id: ObjectId;
  @Field({ description: 'repository image' })
  image: string;
}

export const RepositoryModel = getModelForClass(RepositoryDB);
