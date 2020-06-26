import { extname } from 'path';
import { supportedExtensions } from './supportedExtensions.resolver';

const checkFileExtension = (filePath: string): boolean => {
  return supportedExtensions.includes(extname(filePath));
};

export default checkFileExtension;
