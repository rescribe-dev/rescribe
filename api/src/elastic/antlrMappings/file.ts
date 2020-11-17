import commentMappings from './comment';
import { variableMappings } from './variable';
import importMappings from './import';
import functionMappings from './function';
import classMappings from './class';

const fileMappings = {
  content: {
    type: 'text'
  },
  language: {
    type: 'keyword'
  },
  repository: {
    type: 'keyword'
  },
  branches: {
    type: 'keyword'
  },
  name: {
    type: 'keyword',
    fields: {
      text: {
        type: 'text',
        analyzer: 'trigrams'
      }
    }
  },
  mime: {
    type: 'keyword'
  },
  fileSize: {
    type: 'integer'
  },
  importPath: {
    type: 'text',
    analyzer: 'trigrams'
  },
  path: {
    type: 'keyword'
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
