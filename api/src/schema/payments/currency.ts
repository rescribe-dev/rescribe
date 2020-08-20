import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { ObjectType, Field, Float } from 'type-graphql';
import { ObjectId } from 'mongodb';

@ObjectType({ description: 'currency data' })
@modelOptions({ schemaOptions: { collection: 'currencies' } })
export default class Currency {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'currency name' })
  @Property({ required: true, unique: true })
  name: string;

  @Field(_type => Float, { description: 'exchange rate to usd' })
  @Property({ required: true, type: Number })
  exchangeRate: number;

  @Field({ description: 'accepted as payment' })
  @Property({ required: true })
  acceptedPayment: boolean;
}

export const CurrencyModel = getModelForClass(Currency);
