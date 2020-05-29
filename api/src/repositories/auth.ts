import { ObjectId } from 'mongodb';
import { checkAccess, checkAccessLevel } from '../utils/checkAccess';
import { AccessLevel } from '../schema/auth/access';
import { checkProjectAccess } from '../projects/auth';
import User from '../schema/auth/user';
import { ProjectDB } from '../schema/structure/project';
import { RepositoryDB, RepositoryModel } from '../schema/structure/repository';

export const checkRepositoryAccess = async (user: User, project: ObjectId | ProjectDB, repository: ObjectId | RepositoryDB, accessLevel: AccessLevel): Promise<boolean> => {
  if (repository instanceof ObjectId) {
    const repositoryData = await RepositoryModel.findById(repository);
    if (!repositoryData) {
      throw new Error(`cannot find repository ${repository.toHexString()}`);
    }
    repository = repositoryData;
  }
  if (checkAccessLevel(repository.public, accessLevel)) {
    return true;
  }
  return ((await checkProjectAccess(user, project, accessLevel)) && 
    !checkAccess(repository._id, user.repositories, AccessLevel.none))
    || checkAccess(repository._id, user.repositories, accessLevel);
};
