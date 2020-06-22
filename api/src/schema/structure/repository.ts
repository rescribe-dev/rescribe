import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import Access, { AccessLevel } from '../auth/access';

@ObjectType({ description : 'base repository' })
export class BaseRepository {
  @Field({description : 'name'})
  @Property({required: true})
  name: string;

  @Field({ description: 'owner' })
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

  @Property({ required: false })
  @Field({ description: 'repository image' })
  image: string;

  @Field({ description: 'base folder containing files' })
  @Property({required: true})
  folder: ObjectId;

  @Field({ description: 'date created' })
  @Property({required: true})
  created: number;

  @Field({ description: 'date updated' })
  @Property({required: true})
  updated: number;

  // TODO - potentially add num files / num lines of code aggregates
}

// elastic
@ObjectType({ description: 'repository' })
export class Repository extends BaseRepository {
  @Field()
  readonly _id?: ObjectId;

  nameSearch: string;
}

// database
@ObjectType({ description: 'repository db' })
@modelOptions({schemaOptions: {collection: 'repositories'}})
export class RepositoryDB extends BaseRepository {
  @Field()
  readonly _id: ObjectId;
}

export const RepositoryModel = getModelForClass(RepositoryDB);
