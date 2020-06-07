import { ObjectType, Field } from 'type-graphql';
import Class from './class';
import Function from './function';
import Variable from './variable';
import Comment from './comment';
import Import from './import';
import { ObjectId } from 'mongodb';
import { Language } from '../../utils/variables';

// output from antlr
@ObjectType({ description: 'base file' })
export default class AntlrFile {
  @Field()
  _id?: ObjectId;
  @Field({ description: 'file name' })
  name: string;
  @Field({ description: 'import path' })
  importPath: string;
  @Field({ description: 'file path' })
  path: string;
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
  @Field(_type => [Language], { description: 'language type' })
  language: Language;
}
