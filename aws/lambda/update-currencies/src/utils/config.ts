import { initializeGlobalConfig } from '../shared/global-config';

export const initializeConfig = async (requireAWSConfig: boolean): Promise<void> => {
  await initializeGlobalConfig(requireAWSConfig, true);
};
