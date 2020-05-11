import { ObjectType, Field } from 'type-graphql';

@ObjectType({ description: 'auth notification' })
export class AuthNotification {
  @Field(_type => String)
  id: string;
  @Field(_type => String)
  token: string;
}

export interface AuthNotificationPayload {
  id: string;
  token: string;
}
