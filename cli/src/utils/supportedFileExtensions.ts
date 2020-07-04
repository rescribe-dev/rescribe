import { extname } from 'path';
import { getLogger } from 'log4js';
import { apolloClient } from './api';
import { SupportedExtensionsQuery, SupportedExtensionsQueryVariables, SupportedExtensions } from '../lib/generated/datamodel';

const logger = getLogger();

export let supportedExtensions: string[] = [];

export const getSupportedFileExtensions = async (): Promise<void> => {
  logger.info('get supported extensions');
  const extensionsRes = await apolloClient.query<SupportedExtensionsQuery, SupportedExtensionsQueryVariables>({
    query: SupportedExtensions,
    variables: {},
    fetchPolicy: 'no-cache' // TODO - cache this
  });
  if (!extensionsRes.data) {
    throw new Error('cannot get supported extensions');
  }
  supportedExtensions = extensionsRes.data.supportedExtensions;
};

const checkFileExtension = (filePath: string): boolean => {
  return supportedExtensions.includes(extname(filePath));
};

export default checkFileExtension;
