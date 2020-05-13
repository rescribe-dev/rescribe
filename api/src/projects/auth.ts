import { ObjectId } from 'mongodb';
import { checkAccess } from '../utils/checkAccess';
import { AccessLevel } from '../schema/access';
import User from '../schema/user';

export const checkProjectAccess = (user: User, projectID: ObjectId, accessLevel: AccessLevel): boolean => {
  return checkAccess(projectID, user.projects, accessLevel);
};
