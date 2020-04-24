import { GraphQLContext } from "../utils/context";
import { userTypes } from "./type";

export const verifyAdmin = (ctx: GraphQLContext): boolean => {
  if (!ctx.auth) {
    return false;
  }
  return ctx.auth.type === userTypes.admin;
};

export const verifyLoggedIn = (ctx: GraphQLContext): boolean => {
  return ctx.auth !== undefined;
};
