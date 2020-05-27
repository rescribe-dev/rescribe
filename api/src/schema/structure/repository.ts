import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import Access from '../auth/access';

@ObjectType({ description : 'base repository' })
export class BaseRepository {
  @Field({description : 'name'})
  @Property({required: true})
  name:string;

  @Field(_type => [ObjectId], { description: 'branches' })
  @Property({required: true})
  branches: ObjectId[];

  @Field({ description: 'project' })
  @Property({required: true})
  project: ObjectId;

  @Field(_type => [Access], { description: 'repository access' })
  @Property({ required: true })
  access: Access[];
}

@ObjectType({ description: 'repository' })
export class Repository extends BaseRepository {
  @Field()
  readonly _id?: ObjectId;
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
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
