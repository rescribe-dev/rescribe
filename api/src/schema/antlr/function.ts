import { ObjectType, Field } from 'type-graphql';
import NestedObject from './nestedObject';

@ObjectType({description: 'baseline function'})
export default class Function extends NestedObject {
  @Field({ description: 'function name' })
  name: string;
  @Field({ description: 'return type' })
  returnType: string;
  @Field({ description: 'is a constructor' })
  isConstructor: boolean;
}
