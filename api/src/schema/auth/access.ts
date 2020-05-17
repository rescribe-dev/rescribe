import { ObjectId } from 'mongodb';
import { prop as Property } from '@typegoose/typegoose';
import { ObjectType, Field, registerEnumType } from 'type-graphql';

export enum AccessLevel {
  admin = 'admin',
  edit = 'edit',
  view = 'view',
}

registerEnumType(AccessLevel, {
  name: 'AccessLevel',
  description: 'access level',
});

export enum AccessType {
  user = 'user',
  group = 'group',
}

registerEnumType(AccessType, {
  name: 'AccessType',
  description: 'access type',
});

@ObjectType({description: 'access data'})
export default class Access {
  @Field()
  @Property({ required: true })
  _id: ObjectId;

  @Field({ description: 'access level' })
  @Property({ required: true })
  level: AccessLevel;

  @Field({ description: 'access type' })
  @Property({ required: true })
  type: AccessType;
}
