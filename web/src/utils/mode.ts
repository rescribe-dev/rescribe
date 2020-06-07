const isDebug = (): boolean => {
  return process.env.GATSBY_MODE === 'debug';
};

export default isDebug;
