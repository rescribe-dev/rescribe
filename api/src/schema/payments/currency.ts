import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { ObjectType, Field, Float } from 'type-graphql';

@ObjectType({ description: 'currency data' })
@modelOptions({ schemaOptions: { collection: 'currencies' } })
export default class Currency {
  @Field({ description: 'currency name' })
  @Property({ required: true })
  name: string;

  @Field(_type => Float, { description: 'exchange rate to usd' })
  @Property({ required: true, type: Number })
  exchangeRate: number;

  @Field({ description: 'accepted as payment' })
  @Property({ required: true })
  acceptedPayment: boolean;
}

export const CurrencyModel = getModelForClass(Currency);
