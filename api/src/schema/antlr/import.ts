import { ObjectType, Field } from 'type-graphql';
import NestedObject from './nestedObject';

@ObjectType({ description: 'import' })
export default class Import extends NestedObject {
  @Field({ description: 'path' })
  path: string;
  @Field({ description: 'selection' })
  selection: string;
}
