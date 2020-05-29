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
export const fileIndexSettings = {
  number_of_shards: 1,
  number_of_replicas: 0,
  analysis: {
    filter: {
      nGram_filter: {
        type: 'nGram',
        min_gram: 4,
        max_gram: 5,
        token_chars: [
          'letter',
          'digit',
          'punctuation',
          'symbol'
        ]
      }
    },
    analyzer: {
      nGram_analyzer: {
        type: 'custom',
        tokenizer: 'whitespace',
        filter: [
          'lowercase',
          'asciifolding',
          'nGram_filter'
        ]
      },
      whitespace_analyzer: {
        type: 'custom',
        tokenizer: 'whitespace',
        filter: [
          'lowercase',
          'asciifolding'
        ]
      }
    }
  }
};
export const fileAllSettings = {
  index_analyzer: 'nGram_analyzer',
  search_analyzer: 'whitespace_analyzer'
};
