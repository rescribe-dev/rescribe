import { ObjectType, Field } from 'type-graphql';
import { ObjectId } from 'mongodb';

@ObjectType({ description: 'return object for graphql mutations' })
export default class ReturnObj {
  @Field({ description: 'object id', nullable: true })
  _id?: ObjectId;

  @Field({ description: 'message' })
  message: string;

  @Field({ description: 'other data', nullable: true })
  data?: string;
}
