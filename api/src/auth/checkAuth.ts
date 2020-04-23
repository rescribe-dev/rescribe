import { IGraphQLContext } from "../utils/context";
import { userTypes } from "./type";

export const verifyAdmin = (ctx: IGraphQLContext): boolean => {
  if (!ctx.auth) {
    return false;
  }
  return ctx.auth.type === userTypes.admin;
};

export const verifyLoggedIn = (ctx: IGraphQLContext): boolean => {
  return ctx.auth !== undefined;
};
