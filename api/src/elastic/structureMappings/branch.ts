const branchMappings = {
  project: {
    type: 'keyword'
  },
  repository: {
    type: 'keyword'
  },
  name: {
    type: 'text'
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

export default branchMappings;
