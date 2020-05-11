import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

@ObjectType({ description: 'file' })
export class File {
  @Field()
  readonly id: ObjectId;
  @Field({ description: 'file name' })
  name: string;
  @Field({ description: 'mime type' })
  mime: string;
  @Field({ description: 'file encoding' })
  encoding: string;
  @Field({ description: 'file path' })
  path: string;
}

@ObjectType({ description: 'branch' })
export class Branch {
  @Field()
  readonly id: ObjectId;
  @Field({ description: 'name' })
  name: string;
  @Field(_type => [File], { description: 'files' })
  files: File[];
}

@ObjectType({ description: 'repository' })
export class Repository {
  @Field()
  readonly id: ObjectId;
  @Field({ description: 'name' })
  name: string;
  @Field({ description: 'project' })
  project: ObjectId;
  @Field(_type => [Branch], { description: 'branches' })
  branches: Branch[];
}

@ObjectType({ description: 'project' })
export class Project {
  @Field()
  readonly id: ObjectId;
  @Field({ description: 'name' })
  name: string;
  @Field(_type => [Repository], { description: 'repositories' })
  repositories: Repository[];
}
