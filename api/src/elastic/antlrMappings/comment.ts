import nestedMappings from './nestedObject';

const commentMappings = {
  ...nestedMappings,
  data: {
    type: 'text'
  },
  type: {
    type: 'keyword'
  }
};

export default commentMappings;
