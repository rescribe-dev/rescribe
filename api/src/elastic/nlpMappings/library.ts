const libraryMappings = {
  library: {
    type: 'text',
    analyzer: 'trigrams'
  },
  language: {
    type: 'keyword'
  },
  package_manager: {
    type: 'keyword'
  }
};

export default libraryMappings;
