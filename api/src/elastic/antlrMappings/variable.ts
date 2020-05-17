import nestedMappings from './nestedObject';

export const variableMappings = {
  ...nestedMappings,
  name: {
    type: 'text'
  },
  type: {
    type: 'keyword'
  },
  isArgument: {
    type: 'boolean'
  }
};
