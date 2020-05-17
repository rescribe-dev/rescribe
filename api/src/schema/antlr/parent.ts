import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { ObjectId } from 'mongodb';

export enum ParentType {
  File,
  Class,
  Function,
  Variable
}

registerEnumType(ParentType, {
  name: 'ParentType',
  description: 'parent type',
});

@ObjectType({description: 'parent'})
export default class Parent {
  @Field()
  readonly _id: ObjectId;
  @Field(_type => ParentType, { description: 'parent type' })
  type: ParentType;
}
