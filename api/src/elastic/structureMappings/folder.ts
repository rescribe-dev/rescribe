const folderMappings = {
  name: {
    type: 'text'
  },
  path: {
    type: 'keyword'
  },
  branches: {
    type: 'keyword'
  },
  repository: {
    type: 'keyword'
  },
  parent: {
    type: 'keyword'
  },
  public: {
    type: 'keyword'
  },
  numBranches: {
    type: 'integer'
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

export default folderMappings;
