import chalk from 'chalk';
import yargs from 'yargs';
import indexFiles from './actions/indexFiles';
import exitHook from 'exit-hook';
import { beforeAction, GlobalArgs } from './utils/cli';
import { logger } from './utils/logger';
import getBranch from './actions/getBranch';
import indexBranch from './actions/indexBranch';
import login, { closeLoginSubscription } from './actions/login';
import { appName } from './utils/config';
import getUser from './actions/getUser';
import setRepository from './actions/setRepository';

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
    } catch (err) {
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
    .alias('v', 'version')
    .usage('Usage: $0 <command> [options]')
    .help('h')
    .alias('h', 'help')
    .epilog(`© reScribe ${new Date().getFullYear()} 🚀`);
  yargs
    .option('d', {
      type: 'boolean',
      default: false,
      nargs: 1,
      alias: 'debug',
      describe: 'output debug'
    });
  yargs
    .command('set-repository <owner/repository | repository>', 'set current repository', conf => {
      return conf
        .example('$0 set-repository user/repo', 'set current repository to "repo" owned by "user"');
    }, actionRunner(setRepository));
  yargs
    .command('index-files <branch> <files>', 'index files in repository', conf => {
      return conf
        .option('i', {
          type: 'boolean',
          default: false,
          nargs: 1,
          alias: 'include-path',
          describe: 'include given path'
        })
        .example('$0 index-files main "src/test.js" -i true',
          'index test.js on main branch, including the given path (/src)');
    }, actionRunner(indexFiles));
  yargs
    .command('get-branch [path]', 'get current branch in repository', conf => {
      return conf
        .example('$0 get-branch ..', 'get branch of parent folder');
    }, actionRunner(getBranch));
  yargs
    .command('index-branch', 'index branch in repository', conf => {
      return conf
        .option('b', {
          type: 'string',
          nargs: 1,
          alias: 'branch',
          describe: 'branch name to index'
        })
        .option('p', {
          type: 'string',
          nargs: 1,
          alias: 'path',
          describe: 'path to git repo'
        })
        .example('$0 index-branch main .', 'index main branch of current git repo');
    }, actionRunner(indexBranch));
  yargs.command('login', 'login to service', {}, actionRunner(login));
  yargs.command('get-user', 'get user data', {}, actionRunner(getUser));
  // yargs
  //   .command('index-repo [path] [branches]', 'index selected remote branches in repository', {}, actionRunner(indexRepository))
  //   .example('$0 index-repo .', 'index all remote branches in the current git repository');
  yargs
    .completion()
    .demandCommand()
    .recommendCommands()
    .strict()
    .argv;
};
