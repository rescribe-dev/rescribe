export const absolutePath = /^([a-zA-Z0-9*:_\\/.\-()])+(\.[a-zA-Z0-9]+)$/;

export const getEnding = /\.[0-9a-z]+$/i;

export const getPathData = (uri: string): URL => {
  return new URL('http://localhost' + uri);
};
