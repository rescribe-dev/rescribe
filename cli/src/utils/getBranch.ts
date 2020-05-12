import { ObjectId } from 'mongodb';
import { apolloClient } from './api';
import gql from 'graphql-tag';
import { cacheData } from './config';

export interface ResBranch {
  branch: {
    _id: string;
  }
}

export const getBranch = async (branchName: string): Promise<ResBranch> => {
  const branchRes = await apolloClient.query<ResBranch>({
    query: gql`
      query branch($repository: ObjectId!, $branch: String!) {
        branch(repository: $repository, branch: $branch) {
          _id
        }
      }
    `,
    variables: {
      repository: new ObjectId(cacheData.repository),
      branch: branchName
    }
  });
  return branchRes.data;
};