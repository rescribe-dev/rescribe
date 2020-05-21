import { ObjectType, Field } from 'type-graphql';
import NestedObject from './nestedObject';

@ObjectType({description: 'class'})
export default class Class extends NestedObject {
  @Field({ description: 'class name' })
  name: string;
}
