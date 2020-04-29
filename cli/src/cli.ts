import chalk from 'chalk';
import yargs from 'yargs';
import indexFiles from './actions/indexFiles';
import exitHook from 'exit-hook';
import { appName, beforeAction, GlobalArgs } from './utils/cli';
import { logger } from './utils/logger';
import getBranch from './actions/getBranch';
import indexBranch from './actions/indexBranch';
import login, { closeLoginSubscription } from './actions/login';

const errorHandler = (error: Error): void => {
  console.error(chalk.red(error.message));
  logger.fatal(error.message);
};

const actionRunner = (fn: (args: yargs.Arguments<GlobalArgs & any>) => Promise<void>): (args: yargs.Arguments<GlobalArgs & any>) => Promise<void> => {
  return async (args: yargs.Arguments<GlobalArgs & any>): Promise<void> => {
    try {
      beforeAction(args);
      await fn(args);
      process.exit(0);
    } catch(err) {
      errorHandler(err as Error);
      process.exit(1);
    }
  };
};

export const createCLIExitHooks = (): void => {
  exitHook(closeLoginSubscription);
};

export const startCLI = async (): Promise<void> => {
  createCLIExitHooks();
  yargs
    .scriptName(appName)
    .version()
    .usage('Usage: $0 <command> [options]')
    .help('h')
    .alias('h', 'help')
    .epilog('© 2020 🚀');
  yargs
    .option('d', {
      type: 'boolean',
      default: false,
      nargs: 1,
      alias: 'debug',
      describe: 'output debug'
    });
  yargs
    .command('index-files <files> <branch>', 'index files in repository', {}, actionRunner(indexFiles))
    .example('$0 index-files test.js master', 'index test.js on master branch');
  yargs
    .command('get-branch [path]', 'get current branch in repository', {}, actionRunner(getBranch))
    .example('$0 get-branch ..', 'get branch of parent folder');
  yargs
    .command('index-branch <branch> [path]', 'index branch in repository', {}, actionRunner(indexBranch))
    .example('$0 index-branch master .', 'index master branch of current git repo');
  yargs.command('login', 'login to service', {}, actionRunner(login));
  yargs
    .completion()
    .demandCommand()
    .recommendCommands()
    .strict()
    .argv;
};
