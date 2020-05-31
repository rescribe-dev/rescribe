import nestedMappings from './nestedObject';

export const variableMappings = {
  ...nestedMappings,
  name: {
    type: 'text',
    analyzer: 'trigrams'
  },
  type: {
    type: 'keyword'
  },
  isArgument: {
    type: 'boolean'
  }
};
