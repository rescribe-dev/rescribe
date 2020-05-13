import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';

export enum Plan {
  free = 'free',
}

registerEnumType(Plan, {
  name: 'Plan',
  description: 'user plan',
});

export enum UserType {
  user = 'user',
  visitor = 'vistor',
  admin = 'admin',
  github = 'github',
}

registerEnumType(UserType, {
  name: 'UserType',
  description: 'user type',
});

@ObjectType({description: 'user account'})
@modelOptions({ schemaOptions: { collection: 'users' } })
export default class User {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'user name' })
  @Property({ required: true })
  name: string;

  @Field({ description: 'user email' })
  @Property({ required: true })
  email: string;

  @Field({ description: 'user plan' })
  @Property({ required: true })
  plan: Plan;

  @Field({ description: 'user type' })
  @Property({ required: true })
  type: UserType;

  @Field({ description: 'github installation id' })
  @Property({ required: true })
  githubInstallationID: number;

  @Field({ description: 'github username' })
  @Property({ required: true })
  githubUsername: string;

  @Property({ required: true })
  password: string;

  @Field({ description: 'email verified' })
  @Property({ required: true })
  emailVerified: boolean;

  @Field({ description: 'current token version' })
  @Property({ required: true })
  tokenVersion: number;
}

export const UserModel = getModelForClass(User);
