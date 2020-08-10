import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';

@ObjectType({description: 'payment method object'})
@modelOptions({ schemaOptions: { collection: 'PaymentMethods' } })
export default class PaymentMethod {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'user' })
  @Property({ required: true, unique: true })
  user: ObjectId;

  @Field({ description: 'currency' })
  @Property({ required: true })
  currency: string;

  @Field({ description: 'payment method stripe id' })
  @Property({ required: true })
  method: string;
}

export const PaymentMethodModel = getModelForClass(PaymentMethod);
