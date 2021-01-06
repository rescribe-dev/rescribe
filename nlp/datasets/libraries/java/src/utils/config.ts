import { initializeGlobalConfig } from '../shared/global-config';
import { initializeLibrariesConfig } from '../shared/libraries_global_config';

export let dataFolder = 'java';
export let repositoryURL = 'https://repo1.maven.org/maven2';

export const initializeConfig = async (): Promise<void> => {
  await initializeGlobalConfig(false);
  initializeLibrariesConfig();
  if (process.env.DATA_FOLDER) {
    dataFolder = process.env.DATA_FOLDER;
  }
  if (process.env.REPOSITORY_URL) {
    repositoryURL = process.env.REPOSITORY_URL;
  }
};
