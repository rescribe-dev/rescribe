import { ObjectType, Field } from 'type-graphql';
import { registerEnumType } from 'type-graphql';

export enum CommentType {
  multilineComment = 'multilineComment',
  singleLineComment = 'singleLineComment'
}

registerEnumType(CommentType, {
  name: 'CommentType',
  description: 'comment type',
});

@ObjectType({ description: 'comment' })
export default class Comment {
  @Field({ description: 'data' })
  data: string;
  @Field(_type => CommentType, { description: 'type' })
  type: CommentType;
}
