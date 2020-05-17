import commentMappings from './comment';
import { variableMappings } from './variable';
import importMappings from './import';
import functionMappings from './function';
import classMappings from './class';

const fileMappings = {
  project: {
    type: 'keyword'
  },
  repository: {
    type: 'keyword'
  },
  branch: {
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
  importPath: {
    type: 'text'
  },
  path: {
    type: 'text'
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
