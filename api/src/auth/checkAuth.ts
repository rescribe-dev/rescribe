import { GraphQLContext } from "../utils/context";
import { userTypes } from "./type";

export const verifyGuest = (ctx: GraphQLContext): boolean => {
  return ctx.auth !== undefined;
};

export const verifyLoggedIn = (ctx: GraphQLContext): boolean => {
  return verifyGuest(ctx) && ctx.auth?.type !== userTypes.visitor; // TODO && ctx.auth.emailVerified;
};

export const verifyAdmin = (ctx: GraphQLContext): boolean => {
  return verifyLoggedIn(ctx) && ctx.auth?.type === userTypes.admin;
};

export const verifyGithub = (ctx: GraphQLContext): boolean => {
  return verifyGuest(ctx) && ctx.auth?.type === userTypes.github;
};
