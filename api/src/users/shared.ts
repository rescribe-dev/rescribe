import { UserModel } from '../schema/auth/user';

export const accountExistsEmail = async (email: string): Promise<boolean> => {
  return await UserModel.countDocuments({
    email,
  }) !== 0;
};

export const accountExistsUsername = async (username: string): Promise<boolean> => {
  return await UserModel.countDocuments({
    username,
  }) !== 0;
};
