export const isDebug = (): boolean => {
  return process.env.DEBUG === 'true';
};
