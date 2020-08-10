import { GraphQLContext } from '../utils/context';
import { UserType } from '../schema/users/user';

export const verifyGuest = (ctx: GraphQLContext): boolean => {
  return ctx.auth !== undefined;
};

export const verifyLoggedIn = (ctx: GraphQLContext, checkEmailVerified?: boolean): boolean => {
  if (checkEmailVerified === undefined) {
    checkEmailVerified = true;
  }
  return verifyGuest(ctx) && ctx.auth !== undefined && ctx.auth.type !== UserType.visitor &&
    (checkEmailVerified ? ctx.auth.emailVerified : true);
};

export const verifyAdmin = (ctx: GraphQLContext): boolean => {
  return verifyLoggedIn(ctx) && ctx.auth?.type === UserType.admin;
};

export const verifyGithub = (ctx: GraphQLContext): boolean => {
  return verifyGuest(ctx) && ctx.auth?.type === UserType.github;
};
