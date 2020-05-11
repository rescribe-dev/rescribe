import { ObjectType, Field } from 'type-graphql';
import Location from './location';

@ObjectType({ description: 'import' })
export default class Import {
  @Field({ description: 'path' })
  path: string;
  @Field({ description: 'selection' })
  selection: string;
  @Field(_type => Location, { description: 'location' })
  location: Location;
}
