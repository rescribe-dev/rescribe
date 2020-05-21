import nestedMappings from './nestedObject';

const functionMappings = {
  ...nestedMappings,
  name: {
    type: 'text'
  },
  returnType: {
    type: 'text'
  },
  isConstructor: {
    type: 'boolean'
  }
};

export default functionMappings;
