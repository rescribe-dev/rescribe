import { ObjectType, Field } from 'type-graphql';

@ObjectType({ description: 'location' })
export default class Location {
  @Field({ description: 'start' })
  start: number;
  @Field({ description: 'end' })
  end: number;
}
