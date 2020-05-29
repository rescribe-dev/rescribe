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

export const fileType = 'file';
export const fileIndexName = 'files';
// the min_gram determines the minimum search query length, otherwise you get no results
export const fileIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 0,
  analysis: {
    filter: {
      trigrams_filter: {
        type: 'ngram',
        min_gram: 5,
        max_gram: 5
      }
    },
    analyzer: {
      trigrams: {
        type: 'custom',
        tokenizer: 'standard',
        filter: [
          'lowercase',
          'trigrams_filter'
        ]
      }
    }
  }
};
