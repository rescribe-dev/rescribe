const repositoryMappings = {
  project: {
    type: 'keyword'
  },
  branches: {
    type: 'keyword'
  },
  numBranches: {
    type: 'integer'
  },
  name: {
    type: 'text'
  },
  public: {
    type: 'keyword'
  },
  created: {
    type: 'date',
    format: 'epoch_millis'
  },
  updated: {
    type: 'date',
    format: 'epoch_millis'
  }
};

export default repositoryMappings;
