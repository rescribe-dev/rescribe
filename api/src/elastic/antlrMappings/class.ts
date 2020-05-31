import nestedMappings from './nestedObject';

const classMappings = {
  ...nestedMappings,
  name: {
    type: 'text',
    analyzer: 'trigrams'
  }
};

export default classMappings;
