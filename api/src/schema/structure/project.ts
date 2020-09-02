import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { BaseTimestamp } from '../misc/timestamp';

// both
@ObjectType({ description: 'base project', isAbstract: true })
export class BaseProject extends BaseTimestamp {
  @Field({ description: 'name' })
  @Property({ required: true })
  name: string;

  @Field(_type => [ObjectId], { description: 'repositories' })
  @Property({ required: true, type: ObjectId })
  repositories: ObjectId[];

  @Field({ description: 'owner' })
  @Property({ required: true })
  owner: ObjectId;
}

// elastic & graphql
@ObjectType({ description: 'project' })
export class Project extends BaseProject {
  @Field()
  readonly _id?: ObjectId;
}

// database
@ObjectType({description: 'project database'})
@modelOptions({ schemaOptions: { collection: 'projects' } })
export class ProjectDB extends BaseProject {
  @Field()
  readonly _id: ObjectId;
}

export const ProjectModel = getModelForClass(ProjectDB);
