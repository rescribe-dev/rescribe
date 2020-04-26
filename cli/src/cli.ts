import { program } from 'commander';
import chalk from 'chalk';
import indexFiles from './actions/indexFiles';
import { handleBool, appName } from './utils/cli';
import { logger } from './utils/logger';

export const cliVersion = '0.0.1';

interface ArgData {
  debug: boolean;
}

export const args: ArgData = {
  debug: false
};

export const startCLI = async (): Promise<void> => {
  program.version(cliVersion);
  program.name(appName);
  program.usage('-h');
  program.option('-d, --debug <bool>', 'output debug', (val) => args.debug = handleBool(val), args.debug);
  program.command('index-files <files>')
    .description('index files in repository').action(indexFiles);
  try {
    await program.parseAsync(process.argv);
  } catch(err) {
    const errObj = err as Error;
    console.log(chalk.red(errObj.message));
    logger.fatal(errObj.message);
  }
};
