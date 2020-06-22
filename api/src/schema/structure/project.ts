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

  @Field({ description: 'owner' })
  @Property({ required: true })
  owner: ObjectId;

  @Field({ description: 'date created' })
  @Property({ required: true })
  created: number;

  @Field({ description: 'date updated' })
  @Property({ required: true })
  updated: number;
}

// elastic & graphql
@ObjectType({ description: 'project' })
export class Project extends BaseProject {
  @Field()
  readonly _id?: ObjectId;

  nameSearch: string;
}

// database
@ObjectType({description: 'project database'})
@modelOptions({ schemaOptions: { collection: 'projects' } })
export class ProjectDB extends BaseProject {
  @Field()
  readonly _id: ObjectId;
}

export const ProjectModel = getModelForClass(ProjectDB);
