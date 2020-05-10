import { ObjectType, Field } from "type-graphql";
import { ObjectId } from "mongodb";

@ObjectType({description: "class"})
export default class Class {
  @Field()
  readonly id: ObjectId;
  @Field({ description: "class location" })
  location: string;
  @Field({ description: "class name" })
  name: string;
  @Field({ description: "variables" })
  classVariables: ObjectId[];
  @Field({ description: "constructor" })
  constructorID: ObjectId;
  @Field({ description: "functions" })
  functions: ObjectId[];
  @Field({ description: "description" })
  description: string;
  @Field({ description: "variables" })
  variables: ObjectId[];
}
