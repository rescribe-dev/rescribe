import { prop as Property } from '@typegoose/typegoose';
import { Field } from 'type-graphql';

export default class Restrictions {
  @Field({ description: 'storage restrictions' })
  @Property({ required: true })
  storage: number;
}
