import nestedMappings from './nestedObject';

const functionMappings = {
  ...nestedMappings,
  name: {
    type: 'text',
    analyzer: 'trigrams'
  },
  returnType: {
    type: 'text'
  },
  isConstructor: {
    type: 'boolean'
  }
};

export default functionMappings;
