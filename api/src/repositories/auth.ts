import { ObjectId } from 'mongodb';
import { checkAccess } from '../utils/checkAccess';
import { AccessLevel } from '../schema/access';
import { checkProjectAccess } from '../projects/auth';
import User from '../schema/user';

export const checkRepositoryAccess = (user: User, projectID: ObjectId, repositoryID: ObjectId, accessLevel: AccessLevel): boolean => {
  return checkProjectAccess(user, projectID, accessLevel)
    || checkAccess(repositoryID, user.repositories, accessLevel);
};
