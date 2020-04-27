import { config } from 'dotenv';
import { startCLI } from './cli';
import { initializeAPIClient } from './utils/api';

const runCLI = async (): Promise<void> => {
  config();
  try {
    initializeAPIClient();
  } catch(err) {
    console.error((err as Error).message);
    return;
  }
  await startCLI();
};

if (!module.parent) {
  runCLI();
}

export default runCLI;
