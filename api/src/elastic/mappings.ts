export const projectMappings = {
  repositories: {
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

export const repositoryMappings = {
  projectID: {
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

export const branchMappings = {
  projectID: {
    type: 'keyword'
  },
  repositoryID: {
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

export const locationMappings = {
  start: {
    type: 'integer'
  },
  end: {
    type: 'integer'
  }
};

export const commentMappings = {
  data: {
    type: 'text'
  },
  type: {
    type: 'keyword'
  }
};

export const variableMappings = {
  name: {
    type: 'text'
  },
  type: {
    type: 'keyword'
  },
  location: {
    type: 'object',
    properties: locationMappings
  },
  comments: {
    type: 'object',
    properties: commentMappings
  }
};

export const functionMappings = {
  name: {
    type: 'text'
  },
  arguments: {
    type: 'object',
    properties: variableMappings
  },
  returnType: {
    type: 'text'
  },
  variables: {
    type: 'object',
    properties: variableMappings
  },
  comments: {
    type: 'object',
    properties: commentMappings
  },
  location: {
    type: 'object',
    properties: locationMappings
  }
};

export const classMappings = {
  name: {
    type: 'text'
  },
  variables: {
    type: 'object',
    properties: variableMappings
  },
  constructorFunction: {
    type: 'object',
    properties: functionMappings
  },
  functions: {
    type: 'object',
    properties: functionMappings
  },
  location: {
    type: 'object',
    properties: locationMappings
  },
  comments: {
    type: 'object',
    properties: commentMappings
  }
};

export const importMappings = {
  path: {
    type: 'text'
  },
  selection: {
    type: 'text'
  },
  location: {
    type: 'object',
    properties: locationMappings
  }
};

export const fileMappings = {
  projectID: {
    type: 'keyword'
  },
  repositoryID: {
    type: 'keyword'
  },
  branchID: {
    type: 'keyword'
  },
  created: {
    type: 'date',
    format: 'epoch_millis'
  },
  updated: {
    type: 'date',
    format: 'epoch_millis'
  },
  name: {
    type: 'text'
  },
  comments: {
    type: 'object',
    properties: commentMappings
  },
  importPath: {
    type: 'text'
  },
  path: {
    type: 'text'
  },
  variables: {
    type: 'object',
    properties: variableMappings
  },
  imports: {
    type: 'object',
    properties: importMappings
  },
  functions: {
    type: 'object',
    properties: functionMappings
  },
  classes: {
    type: 'object',
    properties: classMappings
  }
};
