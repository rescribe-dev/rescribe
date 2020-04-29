import chalk from 'chalk';
import yargs from 'yargs';
import indexFiles from './actions/indexFiles';
import { appName, beforeAction, GlobalArgs } from './utils/cli';
import { logger } from './utils/logger';
import getBranch from './actions/getBranch';
import indexBranch from './actions/indexBranch';

const errorHandler = (error: Error): void => {
  console.error(chalk.red(error.message));
  logger.fatal(error.message);
};

const actionRunner = (fn: (args: yargs.Arguments<GlobalArgs & any>) => Promise<void>): (args: yargs.Arguments<GlobalArgs & any>) => Promise<void> => {
  return (args: yargs.Arguments<GlobalArgs & any>): Promise<void> => {
    return new Promise((resolve, _reject) => {
      try {
        beforeAction(args);
      } catch(err) {
        errorHandler(err as Error);
        resolve();
      }
      fn(args)
        .then(resolve)
        .catch((err) => {
          errorHandler(err);
          resolve();
        });
    });
  };
};

export const startCLI = async (): Promise<void> => {
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
  yargs
    .completion()
    .demandCommand()
    .recommendCommands()
    .strict()
    .argv;
};
