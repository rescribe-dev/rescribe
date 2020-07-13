export const absolutePath = /^([a-zA-Z0-9_\\/.\-()])+(\.[a-zA-Z0-9]+)$/;

export const getPath = (uri: string): string => {
  const parsedURL = new URL('http://localhost' + uri);
  return parsedURL.pathname;
};
