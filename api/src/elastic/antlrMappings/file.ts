import commentMappings from './comment';
import { variableMappings } from './variable';
import importMappings from './import';
import functionMappings from './function';
import classMappings from './class';

const fileMappings = {
  language: {
    type: 'keyword'
  },
  project: {
    type: 'keyword'
  },
  repository: {
    type: 'keyword'
  },
  branches: {
    type: 'keyword'
  },
  name: {
    type: 'text',
    analyzer: 'trigrams'
  },
  importPath: {
    type: 'text',
    analyzer: 'trigrams'
  },
  path: {
    type: 'text',
    analyzer: 'trigrams'
  },
  numBranches: {
    type: 'integer'
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
  },
  comments: {
    type: 'nested',
    properties: commentMappings
  },
  variables: {
    type: 'nested',
    properties: variableMappings
  },
  imports: {
    type: 'nested',
    properties: importMappings
  },
  functions: {
    type: 'nested',
    properties: functionMappings
  },
  classes: {
    type: 'nested',
    properties: classMappings
  }
};

export default fileMappings;
