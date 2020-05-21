import { ObjectType, Field } from 'type-graphql';
import Location from './location';
import { ObjectId } from 'mongodb';
import Parent from './parent';

@ObjectType({description: 'class'})
export default class NestedObject {
  @Field()
  readonly _id: ObjectId;
  @Field(_type => Parent, { description: 'parent' })
  parent: Parent;
  @Field(_type => Location, { description: 'location' })
  location: Location;
}
