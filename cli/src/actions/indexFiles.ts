import fs, { readFileSync, lstatSync } from 'fs';
import { handleStringList } from '../utils/cli';
import { isBinaryFile } from 'isbinaryfile';
import indexFiles from '../utils/indexFiles';
import { Arguments } from 'yargs';
import { cacheData } from '../utils/config';
import glob from 'glob';
import prompts from 'prompts';
import { isLoggedIn } from '../utils/authToken';
import { normalize, sep, posix } from 'path';
import yesNoPrompt from '../utils/boolPrompt';
import { setRepoUtil } from './setRepository';
import { getBranchUtil } from './getBranch';
import selectBranch from '../utils/selectBranch';
import { getRepoDataUtil } from './getRepository';
import sleep from '../utils/sleep';


interface Args {
  files: string;
  branch: string
  'include-path': boolean;
};

export default async (args: Arguments<Args>): Promise<void> => {
  if (!isLoggedIn(cacheData.authToken)) {
    throw new Error('user must be logged in to index files');
  }

  let branch: string = args.branch ?
    args.branch : await getBranchUtil({});
  if (cacheData.repository.length === 0) {
    const setRepoData = await setRepoUtil({});
    if (!setRepoData) {
      return;
    }
  }

  let repoData = await getRepoDataUtil({});

  let confirmedSelect = false;
  const enum EditSelectType { Branch, Repo, Both };
  for (; ;) {
    console.log(`Using repository ${cacheData.repository} and branch ${branch}\n`);
    confirmedSelect = !(await yesNoPrompt('Would you like to change these?'));
    if (confirmedSelect) {
      break;
    }
    const editPromptRes = await prompts({
      type: 'select',
      name: 'Choice',
      choices: [
        {
          title: 'branch',
          value: EditSelectType.Branch,
        },
        {
          title: 'repository',
          value: EditSelectType.Repo,
        },
        {
          title: 'both',
          value: EditSelectType.Both,
        }
      ],
      message: 'Change branch, repository, or both?'
    });

    if ([EditSelectType.Repo, EditSelectType.Both].includes(editPromptRes.Choice)) {
      const setRepoData = await setRepoUtil({});
      if (!setRepoData) {
        return;
      }
      // NOTE - this sleep is here because of race conditions in elastic
      // where you save the repo, and then immediately query it.
      await sleep(2000);
      repoData = await getRepoDataUtil({});
    }
    if ([EditSelectType.Branch, EditSelectType.Both].includes(editPromptRes.Choice)) {
      const selectBranchRes = await selectBranch(repoData);
      if (!selectBranchRes) {
        return;
      }
      branch = selectBranchRes;
    }
  }

  const files: Buffer[] = [];
  const paths: string[] = [];
  const filesFound: { [key: string]: boolean } = {};
  const givenPaths = handleStringList(args.files);
  for (const globPath of givenPaths) {
    for (const path of glob.sync(globPath)) {
      if (!fs.existsSync(path)) {
        throw new Error(`cannot find file ${path}`);
      }
      filesFound[globPath] = true;
      const buffer = readFileSync(path);
      const stats = lstatSync(path);
      if (await isBinaryFile(buffer, stats.size)) {
        throw new Error(`file "${path}" is binary`);
      }
      // split join for windows nonsense
      let cleanPath = normalize(path).split(sep).join(posix.sep);
      if (cleanPath[0] !== '/') {
        cleanPath = `/${cleanPath}`;
      }
      paths.push(cleanPath);
      files.push(buffer);
    }
  }
  const notFound: string[] = [];
  for (const path of givenPaths) {
    if (!(path in filesFound)) {
      notFound.push(path);
    }
  }
  if (notFound.length > 0) {
    throw new Error(`cannot find files ${notFound.join(', ')}`);
  }
  console.log('start indexing');
  await indexFiles(paths, files, branch as string);
  console.log('done indexing files');
};
