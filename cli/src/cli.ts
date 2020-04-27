import { program } from 'commander';
import chalk from 'chalk';
import indexFiles from './actions/indexFiles';
import { handleBool, appName, beforeAction } from './utils/cli';
import { logger } from './utils/logger';
import getBranch from './actions/getBranch';
import indexBranch from './actions/indexBranch';

export const cliVersion = '0.0.1';

interface ArgData {
  debug: boolean;
}

export const args: ArgData = {
  debug: false
};

const errorHandler = (error: Error): void => {
  console.error(chalk.red(error.message));
  logger.fatal(error.message);
};

const actionRunner = (fn: (...args: any[]) => Promise<any>): (...args: any[]) => Promise<any> => {
  beforeAction();
  return (...args: any[]): Promise<any> => fn(...args).catch(errorHandler);
};

export const startCLI = async (): Promise<void> => {
  program.version(cliVersion);
  program.name(appName);
  program.usage('-h');
  program.option('-d, --debug <bool>', 'output debug', (val) => args.debug = handleBool(val), args.debug);
  program.command('index-files <files>')
    .description('index files in repository').action(actionRunner(indexFiles));
  program.command('get-branch [path]')
    .description('get current branch in repository').action(actionRunner(getBranch));
  program.command('index-branch <branch> [path]')
    .description('index branch in repository').action(actionRunner(indexBranch));
  program.parseAsync(process.argv).catch(errorHandler);
};
