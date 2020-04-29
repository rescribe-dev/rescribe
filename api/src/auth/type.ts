import { ObjectId } from "mongodb";

export const plans = {
  free: 'free'
};

export const userTypes = {
  visitor: 'visitor',
  user: 'user',
  admin: 'admin',
  github: 'github'
};

export default interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  plan: string;
  type: string;
  emailVerified: boolean;
}
