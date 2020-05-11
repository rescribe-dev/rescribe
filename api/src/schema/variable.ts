import { ObjectType, Field } from 'type-graphql';
import Comment from './comment';
import Location from './location';

@ObjectType({ description: 'variable' })
export default class Variable {
  @Field({ description: 'name' })
  name: string;
  @Field({ description: 'type' })
  type: string;
  @Field(_type => Location, { description: 'location' })
  location: Location;
  @Field(_type => [Comment], { description: 'comments' })
  comments: Comment[];
}
