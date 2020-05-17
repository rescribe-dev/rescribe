import nestedMappings from './nestedObject';

const importMappings = {
  ...nestedMappings,
  path: {
    type: 'text'
  },
  selection: {
    type: 'text'
  },
};

export default importMappings;
