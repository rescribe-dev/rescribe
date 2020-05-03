import { ObjectType, Field } from "type-graphql";
import { ObjectId } from "mongodb";
import { registerEnumType } from "type-graphql";

export enum FunctionParentType {
  FILE = "file",
  CLASS = "class",
  FUNCTION = "function"
}

registerEnumType(FunctionParentType, {
  name: "FunctionParentType",
  description: "function parent type",
});

@ObjectType({description: "baseline function"})
export class BaselineFunction {
  @Field()
  readonly id: ObjectId;
  @Field({ description: "function name" })
  name: string;
  @Field({ description: "function arguments" })
  arguments: string[];
  @Field({ description: "return type" })
  returnType: string;
  @Field({ description: "contents" })
  contents: string;
}

@ObjectType({description: "function"})
export default class Function extends BaselineFunction {
  @Field()
  readonly id: ObjectId;
  @Field({ description: "parent" })
  parent: ObjectId;
  @Field({ description: "parent type" })
  parentType: FunctionParentType;
}

@ObjectType({description: "function"})
export class StandaloneFunction extends BaselineFunction {
  @Field({ description: "location" })
  location: string;
  @Field({ description: "description" })
  description: string;
}
