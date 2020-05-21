import { ObjectType, Field } from 'type-graphql';
import NestedObject from './nestedObject';

@ObjectType({ description: 'variable' })
export default class Variable extends NestedObject {
  @Field({ description: 'name' })
  name: string;
  @Field({ description: 'type' })
  type: string;
  @Field({ description: 'is function argument' })
  isArgument: boolean;
}
