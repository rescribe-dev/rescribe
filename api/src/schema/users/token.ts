import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions } from '@typegoose/typegoose';
import { BaseTimestamp } from '../misc/timestamp';

@ObjectType({ description: 'access token for granting authorization for a given user' })
@modelOptions({ schemaOptions: { collection: 'tokens' } })
export default class Token extends BaseTimestamp {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'secret token hashed' })
  @Property({ required: true })
  token: string;

  @Field({ description: 'how long the token is valid for (in seconds)' })
  @Property({ required: true })
  duration: number;
}
