import { ObjectId } from 'mongodb';
import { checkAccess } from '../auth/checkAccess';
import { AccessLevel } from '../schema/auth/access';
import User from '../schema/auth/user';
import { ProjectDB, ProjectModel } from '../schema/structure/project';

export const checkProjectAccess = async (user: User, project: ObjectId | ProjectDB, accessLevel: AccessLevel): Promise<boolean> => {
  if (project instanceof ObjectId) {
    const projectData = await ProjectModel.findById(project);
    if (!projectData) {
      throw new Error(`cannot find project ${project.toHexString()}`);
    }
    project = projectData;
  }
  return checkAccess(project._id, user.projects, accessLevel);
};
