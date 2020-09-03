import { ObjectType, Field, registerEnumType, InputType } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { BaseTimestamp } from '../misc/timestamp';

export enum ScopeCategory {
  all = 'all',
};

registerEnumType(ScopeCategory, {
  name: 'ScopeCategory',
  description: 'scope category',
});

export enum ScopeLevel {
  read = 'read',
  write = 'write',
};

registerEnumType(ScopeLevel, {
  name: 'ScopeLevel',
  description: 'scope level',
});

@ObjectType({ description: 'given scope' })
@InputType('scope', {
  description: 'scope for token'
})
export class Scope {
  @Field(_type => ScopeCategory, { description: 'category' })
  @Property({ required: true })
  category: ScopeCategory;

  @Field(_type => ScopeLevel, { description: 'how long the token is valid for (in seconds)' })
  @Property({ required: true })
  level: ScopeLevel;
}

@ObjectType({ description: 'access token for granting authorization for a given user' })
@modelOptions({ schemaOptions: { collection: 'tokens' } })
export default class Token extends BaseTimestamp {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'token notes' })
  @Property({ required: true })
  notes: string;

  @Field({ description: 'unique token key' })
  @Property({ required: true, unique: true })
  key: string;

  @Field({ description: 'hashed token' })
  @Property({ required: true })
  hashedToken: string;

  @Field({ description: 'how long the token is valid for (in milliseconds)' })
  @Property({ required: true })
  duration: number;

  @Field({ description: 'user id for token' })
  @Property({ required: true })
  user: ObjectId;

  @Field(_type => [Scope], { description: 'scopes of access for given token' })
  @Property({ required: true, type: Scope })
  scopes: Scope[];
}

export const TokenModel = getModelForClass(Token);
