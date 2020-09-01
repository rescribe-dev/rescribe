import { ObjectType, Field } from 'type-graphql';
import { prop as Property } from '@typegoose/typegoose';

@ObjectType({ description : 'timestamp base class', isAbstract: true })
export class BaseTimestamp {
  @Field({ description: 'date created' })
  @Property({ required: true })
  created: number;

  @Field({ description: 'date updated' })
  @Property({ required: true })
  updated: number;
}
