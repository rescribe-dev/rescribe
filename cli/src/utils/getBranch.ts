import { ObjectId } from 'mongodb';
import { apolloClient } from './api';
import { cacheData } from './config';
import { Branch, BranchQuery, BranchQueryVariables } from '../lib/generated/datamodel';

export const getBranch = async (branchName: string): Promise<BranchQuery> => {
  const variables: BranchQueryVariables = {
    repository: new ObjectId(cacheData.repository),
    name: branchName
  };
  const branchRes = await apolloClient.query<BranchQuery, BranchQueryVariables>({
    query: Branch,
    variables
  });
  return branchRes.data;
};
