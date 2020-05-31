import nestedMappings from './nestedObject';

const commentMappings = {
  ...nestedMappings,
  data: {
    type: 'text',
    analyzer: 'trigrams'
  },
  type: {
    type: 'keyword'
  }
};

export default commentMappings;
