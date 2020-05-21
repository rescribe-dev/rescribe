import { ObjectId } from 'mongodb';
import { checkAccess } from '../utils/checkAccess';
import { AccessLevel } from '../schema/auth/access';
import User from '../schema/auth/user';

export const checkProjectAccess = (user: User, project: ObjectId, accessLevel: AccessLevel): boolean => {
  return checkAccess(project, user.projects, accessLevel);
};
