import { config } from 'dotenv';
import { startCLI } from './cli';
import { initializeAPIClient } from './utils/api';

const runCLI = async (): Promise<void> => {
  config();
  initializeAPIClient();
  await startCLI();
};

if (!module.parent) {
  runCLI();
}

export default runCLI;
