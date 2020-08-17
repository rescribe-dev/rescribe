import { prop as Property } from '@typegoose/typegoose';
import { Field, ObjectType, Float } from 'type-graphql';

@ObjectType({ description: 'restrictions' })
export default class Restrictions {
  @Field(_type => Float, { description: 'storage restrictions' })
  @Property({ required: true })
  storage: number;

  @Field(_type => Float, { description: 'number of private repositories allowed' })
  @Property({ required: true })
  privateRepositories: number;

  @Field(_type => Float, { description: 'number of public repositories allowed' })
  @Property({ required: true })
  publicRepositories: number;
}
