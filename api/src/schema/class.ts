import { ObjectType, Field } from 'type-graphql';
import Variable from './variable';
import Function from './function';
import Location from './location';
import Comment from './comment';

@ObjectType({description: 'class'})
export default class Class {
  @Field({ description: 'class name' })
  name: string;
  @Field(_type => [Variable], { description: 'variables' })
  variables: Variable[];
  @Field(_type => Function, { description: 'constructor' })
  constructorFunction: Function;
  @Field(_type => [Function], { description: 'functions' })
  functions: Function[];
  @Field(_type => Location, { description: 'class location' })
  location: Location;
  @Field(_type => [Comment], { description: 'comments' })
  comments: Comment[];
}
