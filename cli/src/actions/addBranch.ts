import { Arguments } from 'yargs';
import { apolloClient } from '../utils/api';
import { AddBranchMutation, AddBranchMutationVariables, AddBranch } from '../lib/generated/datamodel';
import { getBranchUtil } from './getBranch';
import { getRepoDataUtil } from './getRepository';

interface Args {
  path?: string;
  branch?: string;
}

export default async (args: Arguments<Args>): Promise<void> => {
  const currentBranch = args.branch ? args.branch :
    await getBranchUtil({
      path: args.path
    });
  const currentRepository = await getRepoDataUtil({
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
  console.log(`added branch  ${currentBranch} to ${currentRepository.name}`);
};
