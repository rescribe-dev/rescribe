import { args } from '../cli';

export const isDebug = (): boolean => {
  return args.debug as boolean || process.env.DEBUG === 'true';
};
