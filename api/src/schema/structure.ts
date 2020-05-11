import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import File from './file';

@ObjectType({ description: 'branch' })
export class Branch {
  @Field()
  readonly _id?: ObjectId;
  @Field({ description: 'name' })
  name: string;
  @Field(_type => [File], { description: 'files' })
  files: File[];
}

@ObjectType({ description: 'repository' })
export class Repository {
  @Field()
  readonly _id?: ObjectId;
  @Field({ description: 'name' })
  name: string;
  @Field({ description: 'project' })
  project: ObjectId;
  @Field(_type => [Branch], { description: 'branches' })
  branches: Branch[];
}

@ObjectType({ description: 'base project' })
export class BaseProject {
  @Field()
  readonly _id?: ObjectId;
  @Field({ description: 'name' })
  name: string;
  @Field(_type => [Repository], { description: 'repositories' })
  repositories: Repository[];
}

@ObjectType({ description: 'project' })
export class Project extends BaseProject {
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}
