import nestedMappings from './nestedObject';

const classMappings = {
  ...nestedMappings,
  name: {
    type: 'text'
  }
};

export default classMappings;
