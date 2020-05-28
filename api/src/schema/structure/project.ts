import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import Access, { AccessLevel } from '../auth/access';

// both
@ObjectType({ description: 'base project' })
export class BaseProject {
  @Field({ description: 'name' })
  @Property({ required: true })
  name: string;
  @Field(_type => [ObjectId], { description: 'repositories' })
  @Property({ required: true })
  repositories: ObjectId[];
  @Field(_type => [Access], { description: 'project access' })
  @Property({ required: true })
  access: Access[];
  @Field(_type => [Access], { description: 'public access level' })
  @Property({ required: true })
  public: AccessLevel;
}

// elastic & graphql
@ObjectType({ description: 'project' })
export class Project extends BaseProject {
  @Field()
  readonly _id?: ObjectId;
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
