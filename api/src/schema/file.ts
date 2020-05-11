import { ObjectType, Field } from 'type-graphql';
import Class from './class';
import Import from './import';
import Variable from './variable';
import Comment from './comment';
import Function from './function';

@ObjectType({ description: 'base file' })
export class BaseFile {
  @Field()
  _id: string;
  @Field({ description: 'file name' })
  name: string;
  @Field(_type => [Class], { description: 'classes' })
  classes: Class[];
  @Field(_type => [Function], { description: 'functions' })
  functions: Function[];
  @Field(_type => [Variable], { description: 'variables' })
  variables: Variable[];
  @Field(_type => [Import], { description: 'imports' })
  imports: Import[];
  @Field(_type => [Comment], { description: 'comments' })
  comments: Comment[];
  @Field({ description: 'import path' })
  importPath: string;
  @Field({ description: 'path' })
  path: string;
}

@ObjectType({ description: 'file' })
export default class File extends BaseFile {
  @Field({ description: 'project id' })
  projectID: string;
  @Field({ description: 'repository id' })
  repositoryID: string;
  @Field({ description: 'branch id' })
  branchID: string;
  @Field({ description: 'date created' })
  created: number;
  @Field({ description: 'date updated' })
  updated: number;
}
