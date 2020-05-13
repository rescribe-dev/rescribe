import { UserModel } from '../schema/user';

export const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
export const passwordMinLen = 6;
export const nameMinLen = 3;
export const saltRounds = 10;

export const authNotificationsTrigger = 'AUTH_NOTIFICATION';

export const accountExists = async (email: string): Promise<boolean> => {
  return await UserModel.countDocuments({
    email,
  }) !== 0;
};
