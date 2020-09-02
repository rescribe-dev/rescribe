const repositoryMappings = {
  owner: {
    type: 'keyword'
  },
  name: {
    type: 'keyword',
    fields: {
      text: {
        type: 'text'
      }
    }
  },
  branches: {
    type: 'keyword'
  },
  numBranches: {
    type: 'integer'
  },
  folder: {
    type: 'keyword'
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
