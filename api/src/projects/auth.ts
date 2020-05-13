import { ObjectId } from 'mongodb';
import { checkAccess } from '../utils/checkAccess';
import { AccessLevel } from '../schema/access';
import { ProjectDB } from '../schema/project';

export const checkProjectAccess = (userID: ObjectId, project: ProjectDB, accessLevel: AccessLevel): boolean => {
  return checkAccess(userID, project.access, accessLevel);
};
