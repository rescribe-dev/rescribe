import yesNoPrompt from './boolPrompt';
import prompts from 'prompts';
import { addBranchUtil } from '../actions/addBranch';
import { PaginationSelectType } from './pagination';
import { RepositoryBaseDataFragment } from '../lib/generated/datamodel';

interface BranchSelectVal {
  name?: string;
  type: PaginationSelectType;
};

interface BranchesData {
  title: string; // name
  value: BranchSelectVal;
};

const addBranchPrompt = async (repoData: RepositoryBaseDataFragment): Promise<string> => {
  const branchChoice = await prompts({
    type: 'text',
    name: 'branch',
    message: 'branch name',
  });
  const branch = branchChoice.branch as string;
  await addBranchUtil({
    branch,
    repoData,
  });
  repoData.branches.push(branch);
  return branch;
};

export default async (repoData: RepositoryBaseDataFragment): Promise<string | null> => {
  if (repoData.branches.length === 0) {
    console.log(`No branches within the current repository: "${repoData.name}"\n`);
    const res = await yesNoPrompt('would you like to create a new branch? (y/n)');
    if (!res) {
      return null;
    }
    return await addBranchPrompt(repoData);
  }

  const branches: BranchesData[] = repoData.branches.map(branch => {
    return {
      title: branch,
      value: {
        name: branch,
        type: PaginationSelectType.Selection,
      }
    };
  });
  branches.push({
    title: 'new branch',
    value: {
      type: PaginationSelectType.New,
    }
  });
  const branchChoice = await prompts({
    type: 'select',
    name: 'branch',
    message: 'Choose the branch to activate',
    choices: branches
  });
  const branchSelect = branchChoice.branch as BranchSelectVal;
  if (branchSelect.type === PaginationSelectType.Selection) {
    return branchSelect.name as string;
  }
  // for new branch
  return await addBranchPrompt(repoData);
};
