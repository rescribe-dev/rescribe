import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';

@ObjectType({description: 'user currency object'})
@modelOptions({ schemaOptions: { collection: 'UserCurrencies' } })
export default class UserCurrency {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'user' })
  @Property({ required: true })
  user: ObjectId;

  @Field({ description: 'currency' })
  @Property({ required: true })
  currency: string;

  @Field({ description: 'stripe customer id' })
  @Property({ required: true })
  customer: string;
}

export const UserCurrencyModel = getModelForClass(UserCurrency);
