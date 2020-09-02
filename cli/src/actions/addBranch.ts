import { Arguments } from 'yargs';
import { apolloClient } from '../utils/api';
import {
  AddBranchMutation, AddBranchMutationVariables,
  AddBranch, RepositoryBaseDataFragment
} from '../lib/generated/datamodel';
import { getBranchUtil } from './getBranch';
import { getRepoDataUtil } from './getRepository';

interface Args {
  path?: string;
  branch?: string;
  repoData?: RepositoryBaseDataFragment;
}

export const addBranchUtil = async (args: Args): Promise<{
  repo: RepositoryBaseDataFragment,
  branch: string;
}> => {
  const currentBranch = args.branch ? args.branch :
    await getBranchUtil({
      path: args.path
    });
  const currentRepository = args.repoData ?
    args.repoData : await getRepoDataUtil({
      path: args.path,
    });
  if (currentRepository.branches.includes(currentBranch)) {
    throw new Error(`branch with name ${currentBranch} already exists`);
  }
  await apolloClient.mutate<AddBranchMutation, AddBranchMutationVariables>({
    mutation: AddBranch,
    variables: {
      name: currentBranch,
      repository: currentRepository._id
    }
  });
  return {
    branch: currentBranch,
    repo: currentRepository,
  };
};

export default async (args: Arguments<Args>): Promise<void> => {
  const { branch, repo } = await addBranchUtil(args);
  console.log(`added branch  ${branch} to ${repo.name}`);
};
