import { startCLI } from './cli';
import { initializeAPIClient } from './utils/api';

import { initializeConfig } from './utils/config';

const runCLI = async (): Promise<void> => {
  try {
    await initializeConfig();
    await initializeAPIClient();
  } catch(err) {
    console.error((err as Error).message);
    return;
  }
  await startCLI();
};

if (require.main) {
  runCLI();
}

export default runCLI;
