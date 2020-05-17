import locationMappings from './location';
import parentMappings from './parent';

const nestedMappings = {
  _id: {
    type: 'keyword'
  },
  parent: {
    type: 'object',
    properties: parentMappings
  },
  location: {
    type: 'object',
    properties: locationMappings
  }
};

export default nestedMappings;
