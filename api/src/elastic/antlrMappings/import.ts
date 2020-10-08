import nestedMappings from './nestedObject';

const importMappings = {
  ...nestedMappings,
  path: {
    type: 'text'
  },
  selection: {
    type: 'text'
  },
  // if it's an external library
  // TODO - figure this out
  external: {
    type: 'boolean'
  }
};

export default importMappings;
