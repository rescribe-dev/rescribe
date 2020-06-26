import { ObjectId } from 'mongodb';
import { checkAccess, checkAccessLevel } from '../utils/checkAccess';
import { AccessLevel } from '../schema/auth/access';
import { checkProjectAccess } from '../projects/auth';
import User from '../schema/auth/user';
import { RepositoryDB, RepositoryModel } from '../schema/structure/repository';

export const checkRepositoryPublic = async (repository: ObjectId | RepositoryDB, accessLevel: AccessLevel): Promise<boolean> => {
  if (repository instanceof ObjectId) {
    const repositoryData = await RepositoryModel.findById(repository);
    if (!repositoryData) {
      throw new Error(`cannot find repository ${repository.toHexString()}`);
    }
    repository = repositoryData;
  }
  return checkAccessLevel(repository.public, accessLevel);
};

export const checkRepositoryAccess = async (user: User, repository: ObjectId | RepositoryDB, accessLevel: AccessLevel): Promise<boolean> => {
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
  return ((await checkProjectAccess(user, repository.project, accessLevel)) && 
    !checkAccess(repository._id, user.repositories, AccessLevel.none))
    || checkAccess(repository._id, user.repositories, accessLevel);
};
