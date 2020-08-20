import { prop as Property, getModelForClass, modelOptions } from '@typegoose/typegoose';
import { ObjectType, Field, Int } from 'type-graphql';
import { ObjectId } from 'mongodb';

@ObjectType({ description: 'coupons' })
@modelOptions({ schemaOptions: { collection: 'coupons' } })
export default class Coupon {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'coupon name' })
  @Property({ required: true, unique: true })
  name: string;

  @Field(_type => Int, { description: 'coupon amount' })
  @Property({ required: true })
  amount: number;

  @Field({ description: 'coupon is percent off' })
  @Property({ required: true })
  isPercent: boolean;
}

export const CouponModel = getModelForClass(Coupon);
