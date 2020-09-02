const projectMappings = {
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
  repositories: {
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

export default projectMappings;
