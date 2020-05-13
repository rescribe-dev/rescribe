import { ObjectId } from 'mongodb';
import { checkAccess } from '../utils/checkAccess';
import { AccessLevel } from '../schema/access';
import { RepositoryDB } from '../schema/repository';
import { ProjectDB } from '../schema/project';
import { checkProjectAccess } from '../projects/auth';

export const checkRepositoryAccess = (userID: ObjectId, repository: RepositoryDB, project: ProjectDB, accessLevel: AccessLevel): boolean => {
  return checkProjectAccess(userID, project, accessLevel)
    || checkAccess(userID, repository.access, accessLevel);
};
