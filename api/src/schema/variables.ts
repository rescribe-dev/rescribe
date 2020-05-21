import { ObjectType, Field } from "type-graphql";
import { ObjectId } from "mongodb";
import { registerEnumType } from "type-graphql";

export enum VariableParentType {
  FILE = "file",
  CLASS = "class",
  FUNCTION = "function"
}

registerEnumType(VariableParentType, {
  name: "VariableParentType",
  description: "variable parent type",
});

@ObjectType({ description: "variable" })
export class Variable {
  @Field()
  readonly id: ObjectId;
  @Field({ description: "name" })
  name: string;
  @Field({ description: "type" })
  type: string;
  @Field({ description: "parent type" })
  parentType: VariableParentType;
  @Field({ description: "parent" })
  parent: ObjectId;
}
