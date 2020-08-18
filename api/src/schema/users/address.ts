import { ObjectId } from 'mongodb';
import { prop as Property, modelOptions, getModelForClass } from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';

@ObjectType({description: 'address object'})
@modelOptions({ schemaOptions: { collection: 'addresses' } })
export default class Address {
  @Field()
  readonly _id: ObjectId;

  @Field({ description: 'name' })
  @Property({ required: true })
  name: string;

  @Field({ description: 'user' })
  @Property({ required: true, unique: true })
  user: ObjectId;

  @Field({ description: 'line 1' })
  @Property({ required: true })
  line1: string;

  @Field({ description: 'line 2', nullable: true })
  @Property({ required: false })
  line2?: string;

  @Field({ description: 'city' })
  @Property({ required: true })
  city: string;

  @Field({ description: 'state' })
  @Property({ required: true })
  state: string;

  @Field({ description: 'postal code' })
  @Property({ required: true })
  postal_code: string;

  @Field({ description: 'country' })
  @Property({ required: true })
  country: string;
}

export const AddressModel = getModelForClass(Address);
