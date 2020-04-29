import { globalArgs } from './cli';

export const isDebug = (): boolean => {
  return globalArgs.debug || process.env.DEBUG === 'true';
};
