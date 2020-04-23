import { ObjectId } from "mongodb";

export const plans = {
  free: 'free'
};

export const userTypes = {
  user: 'user',
  admin: 'admin'
};

export default interface IUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  plan: string;
  type: string;
}
