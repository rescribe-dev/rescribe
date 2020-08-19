import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectType, Field, Int, registerEnumType } from 'type-graphql';

// directly from stripe
export enum CreditCardBrand {
  amex,
  diners,
  discover,
  jcb,
  mastercard,
  unionpay,
  visa,
  unknown,
}

registerEnumType(CreditCardBrand, {
  name: 'CreditCardBrand',
  description: 'credit card brand',
});

@ObjectType({ description: 'payment method object' })
@modelOptions({ schemaOptions: { collection: 'PaymentMethods' } })
export default class PaymentMethod {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'user' })
  @Property({ required: true })
  user: ObjectId;

  @Field({ description: 'currency' })
  @Property({ required: true })
  currency: string;

  @Field({ description: 'payment method stripe id' })
  @Property({ required: true })
  method: string;

  @Field(_type => Int, { description: 'credit card last four digits' })
  @Property({ required: true })
  lastFourDigits: number;

  @Field(_type => CreditCardBrand, { description: 'credit card type' })
  @Property({ required: true })
  brand: CreditCardBrand;
}

export const PaymentMethodModel = getModelForClass(PaymentMethod);
