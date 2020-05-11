/* eslint-disable @typescript-eslint/camelcase */

export const projectType = 'project';
export const projectIndexName = 'projects';
export const projectIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 0
};

export const repositoryType = 'repository';
export const repositoryIndexName = 'repositories';
export const repositoryIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 0
};

export const branchType = 'branch';
export const branchIndexName = 'branches';
export const branchIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 0
};

export const fileType = 'file';
export const fileIndexName = 'files';
export const fileIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 0
};
