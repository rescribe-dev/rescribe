import { extname } from 'path';

export const supportedExtensions = ['.java'];

const checkFileExtension = (filePath: string): boolean => {
  return supportedExtensions.includes(extname(filePath));
};

export default checkFileExtension;
