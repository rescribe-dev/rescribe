import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions } from '@typegoose/typegoose';

@ObjectType({ description: 'access token for granting authorization for a given user' })
@modelOptions({ schemaOptions: { collection: 'tokens' } })
export default class Token {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'secret token hashed' })
  @Property({ required: true })
  token: string;
}
