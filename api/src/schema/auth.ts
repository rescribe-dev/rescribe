import { ObjectType, Field } from "type-graphql";
import { ObjectId } from "mongodb";
import { registerEnumType } from "type-graphql";

export enum Plan {
  free = "free",
}

registerEnumType(Plan, {
  name: "Plan",
  description: "user plan",
});

export enum UserType {
  user = "user",
  visitor = "vistor",
  admin = "admin",
  github = "github",
}

registerEnumType(UserType, {
  name: "UserType",
  description: "user type",
});

@ObjectType({description: "user account"})
export default class User {
  @Field()
  readonly id: ObjectId;
  @Field({ description: "user name" })
  name: string;
  @Field({ description: "user email" })
  email: string;
  @Field({ description: "user plan" })
  plan: Plan;
  @Field({ description: "user type" })
  type: UserType;
  password: string;
  @Field({ description: "email verified" })
  emailVerified: boolean;
}
