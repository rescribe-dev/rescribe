import User, { UserModel } from '../schema/users/user';

export const getUser = async (username: string): Promise<User> => {
  const user = await UserModel.findOne({
    username
  });
  if (!user) {
    throw new Error(`cannot find user with username ${username}`);
  }
  return user;
};

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
