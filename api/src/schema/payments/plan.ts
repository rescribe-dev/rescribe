import { prop as Property } from '@typegoose/typegoose';
import { ObjectType, Field, registerEnumType } from 'type-graphql';

export enum Interval {
  year = 'year',
  month = 'month',
  once = 'once'
}

registerEnumType(Interval, {
  name: 'IntervalType',
  description: 'interval type',
});

export const singlePurchase = Interval.once;

@ObjectType()
export default class Plan {
  @Property({ required: true })
  @Field({ description: 'interval' })
  interval: Interval;

  // map of currency to stripe id
  @Property({ required: true, type: String })
  @Field(_type => String, { description: 'currencies' })
  currencies: Record<string, string>;

  // cost of plan in USD
  @Property({ required: true, type: Number })
  @Field({ description: 'amount' })
  amount: number;
}
