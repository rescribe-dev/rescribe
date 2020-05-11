import { ObjectType, Field } from 'type-graphql';
import Variable from './variable';
import Comment from './comment';
import Location from './location';

@ObjectType({description: 'baseline function'})
export default class Function {
  @Field({ description: 'function name' })
  name: string;
  @Field(_type => [Variable], { description: 'function arguments' })
  arguments: Variable[];
  @Field({ description: 'return type' })
  returnType: string;
  @Field(_type => [Variable], { description: 'variables' })
  variables: Variable[];
  @Field(_type => [Comment], { description: 'comments' })
  comments: Comment[];
  @Field(_type => Location, { description: 'location' })
  location: Location;
}
