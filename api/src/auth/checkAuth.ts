import { GraphQLContext } from '../utils/context';
import { UserType } from '../schema/user';

export const verifyGuest = (ctx: GraphQLContext): boolean => {
  return ctx.auth !== undefined;
};

export const verifyLoggedIn = (ctx: GraphQLContext): boolean => {
  return verifyGuest(ctx) && ctx.auth?.type !== UserType.visitor; // TODO && ctx.auth.emailVerified;
};

export const verifyAdmin = (ctx: GraphQLContext): boolean => {
  return verifyLoggedIn(ctx) && ctx.auth?.type === UserType.admin;
};

export const verifyGithub = (ctx: GraphQLContext): boolean => {
  return verifyGuest(ctx) && ctx.auth?.type === UserType.github;
};
