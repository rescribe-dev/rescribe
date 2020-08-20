import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import Access from './access';

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

@ObjectType({ description: 'public user data' })
export class PublicUser {
  @Field({ description: 'name' })
  @Property({ required: true })
  name: string;

  @Field({ description: 'username' })
  @Property({ required: true })
  username: string;

  @Field({ description: 'email' })
  @Property({ required: true })
  email: string;
}

@ObjectType({ description: 'user account' })
@modelOptions({ schemaOptions: { collection: 'users' } })
export default class User extends PublicUser {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'user plan name' })
  @Property({ required: true })
  plan: string;

  @Property({ required: false })
  subscriptionID: string;

  @Field({ description: 'user type' })
  @Property({ required: true })
  type: UserType;

  @Field({ description: 'github installation id' })
  @Property({ required: true })
  githubInstallationID: number;

  @Field({ description: 'github username' })
  @Property({ required: false })
  githubUsername: string;

  @Property({ required: false })
  password: string;

  @Field({ description: 'email verified' })
  @Property({ required: true })
  emailVerified: boolean;

  @Field({ description: 'current token version' })
  @Property({ required: true })
  tokenVersion: number;

  @Field(_type => [Access], { description: 'repository access' })
  @Property({ required: true, type: Access })
  repositories: Access[];

  @Field(_type => [Access], { description: 'project access' })
  @Property({ required: true, type: Access })
  projects: Access[];

  @Field({ description: 'default payment method', nullable: true })
  @Property({ required: false })
  defaultPaymentMethod?: ObjectId;

  @Field({ description: 'default address', nullable: true })
  @Property({ required: false })
  defaultAddress?: ObjectId;
}

export const UserModel = getModelForClass(User);
