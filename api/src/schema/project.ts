import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';

// both
@ObjectType({ description: 'base project' })
export class BaseProject {
  @Field({ description: 'name' })
  @Property({ required: true })
  name: string;
  @Field(_type => [ObjectId], { description: 'repositories' })
  @Property({ required: true })
  repositories: ObjectId[];
}

// elastic & graphql
@ObjectType({ description: 'project' })
export class Project extends BaseProject {
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}

// database
@ObjectType({description: 'project database'})
@modelOptions({ schemaOptions: { collection: 'projects' } })
export class ProjectDB extends BaseProject {
  @Field()
  readonly _id: ObjectId;
}

export const ProjectModel = getModelForClass(ProjectDB);
