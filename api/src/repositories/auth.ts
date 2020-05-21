import { ObjectId } from 'mongodb';
import { checkAccess } from '../utils/checkAccess';
import { AccessLevel } from '../schema/auth/access';
import { checkProjectAccess } from '../projects/auth';
import User from '../schema/auth/user';

export const checkRepositoryAccess = (user: User, project: ObjectId, repository: ObjectId, accessLevel: AccessLevel): boolean => {
  return checkProjectAccess(user, project, accessLevel)
    || checkAccess(repository, user.repositories, accessLevel);
};
