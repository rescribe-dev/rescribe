import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';

// for both
@ObjectType({ description: 'base branch' })
export class BaseBranch {
  @Field({ description: 'name' })
  @Property({ required: true })
  name: string;
  @Field({ description: 'repository id' })
  @Property({ required: true })
  repository: ObjectId;
  @Field({ description: 'project id' })
  @Property({ required: true })
  project: ObjectId;
  @Field(_type => [ObjectId], { description: 'files' })
  @Property({ required: true })
  files: ObjectId[];
}

@ObjectType({ description: 'branch' })
export class Branch {
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}

// database
@ObjectType({description: 'branch database'})
@modelOptions({ schemaOptions: { collection: 'branches' } })
export class BranchDB extends BaseBranch {
  @Field()
  readonly _id: ObjectId;
}

export const BranchModel = getModelForClass(BranchDB);
