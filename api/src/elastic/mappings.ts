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
    type: 'string'
  },
  location: {
    type: 'nested',
    properties: locationMappings
  },
  comments: {
    type: 'nested',
    properties: commentMappings
  }
};

export const functionMappings = {
  name: {
    type: 'text'
  },
  arguments: {
    type: 'nested',
    properties: variableMappings
  },
  returnType: {
    type: 'text'
  },
  variables: {
    type: 'nested',
    properties: variableMappings
  },
  comments: {
    type: 'nested',
    properties: commentMappings
  },
  location: {
    type: 'nested',
    properties: locationMappings
  }
};

export const classMappings = {
  name: {
    type: 'text'
  },
  variables: {
    type: 'nested',
    properties: variableMappings
  },
  constructor: {
    type: 'nested',
    properties: functionMappings
  },
  functions: {
    type: 'nested',
    properties: functionMappings
  },
  location: {
    type: 'nested',
    properties: locationMappings
  },
  comments: {
    type: 'nested',
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
    type: 'nested',
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
  name: {
    type: 'text'
  },
  classes: {
    type: 'nested',
    properties: classMappings
  },
  functions: {
    type: 'nested',
    properties: functionMappings
  },
  variables: {
    type: 'nested',
    properties: variableMappings
  },
  imports: {
    type: 'nested',
    properties: importMappings
  },
  comments: {
    type: 'nested',
    properties: commentMappings
  },
  importPath: {
    type: 'text'
  },
  path: {
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

/**
 *
 * mappings
 *
 * search(fuzzysearch: "test")
 * projects -> repositories, files, functions, comment in function "test"
 *
 * advanced search -> filtering repos, files, functions, etc.
 * exclude / include all of above
 * maybe you only want to search in functions for comments - not in
 * class level or variable level
 *
 * authentication -> based off of id
 *
 * list of projects you have access to
 * query -> mustHaveIn([project ids])
 * function needs to have project id so that we can filter for authentication
 * alternative is overfetching
 *
 * user id
 *
 * https://stackoverflow.com/questions/9605292/make-elasticsearch-only-return-certain-fields
 * https://www.elastic.co/guide/en/elasticsearch/reference/7.0/search-request-source-filtering.html
 * https://discuss.elastic.co/t/how-many-indexes-is-too-many-indexes/20139
 *
 *
 *        project
 *        repos[]
 *        files[]
 *
 *
 *    User access:
 *    project must be in [project access]
 *    repo can be in [repo access]*
 *    saved in database!
 *
 *    project _id
 *    repos[] _id project_id
 *    files[]  _id repo_id, project_id
 *    classes[] _id repo_id, project_id, file_id
 *    functions[] _id, parent_id, repo_id, project_id
 *    variables[] _id, parent_id, repo_id, project_id
 *
 *    project _id
 *    repos[] _id, project_id
 *    branches[] _id, repo_id, project_id
 *    files[]  _id, branch_id, repo_id, project_id, classes[{
 *      variables: {
 *        variableInterface
 *      },
 *      functions: [{
 *        name
 *        variables: [{
 *          name
 *        }]
 *      }]
 *    }]
 * https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-types.html
 *
 * https://mothereff.in/byte-counter
 *
 * https://www.elastic.co/guide/en/elasticsearch/reference/current/general-recommendations.html
 *
 *    IAM - organization system
 *    groups of users with special privileges
 *      for project, repo, etc.
 *
 */
