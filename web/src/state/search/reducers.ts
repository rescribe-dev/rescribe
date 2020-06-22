import {
  SET_QUERY,
  SearchState,
  SearchActionTypes,
  SET_SEARCH_RESULTS,
  SET_PAGE,
  SET_PERPAGE,
  SET_PROJECTS,
  SET_REPOSITORIES,
  SET_SEARCHING,
  SET_HAS_SEARCHED,
  SET_LANGUAGES,
} from './types';
import { perpageOptions } from '../../utils/variables';

const initialState: SearchState = {
  searchResults: null,
  searching: false,
  hasSearched: false,
  query: '',
  page: 0,
  perpage: perpageOptions[0],
  filters: {
    projects: [],
    repositories: [],
    languages: [],
  },
};

export const searchReducer = (
  state = initialState,
  action: SearchActionTypes
): SearchState => {
  switch (action.type) {
    case SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
      };
    case SET_SEARCHING:
      return {
        ...state,
        searching: action.payload,
      };
    case SET_HAS_SEARCHED:
      return {
        ...state,
        hasSearched: action.payload,
      };
    case SET_QUERY:
      return {
        ...state,
        query: action.payload,
      };
    case SET_PAGE:
      return {
        ...state,
        page: action.payload,
      };
    case SET_PERPAGE:
      return {
        ...state,
        perpage: action.payload,
      };
    case SET_PROJECTS:
      return {
        ...state,
        filters: {
          ...state.filters,
          projects: action.payload,
        },
      };
    case SET_REPOSITORIES:
      return {
        ...state,
        filters: {
          ...state.filters,
          repositories: action.payload,
        },
      };
    case SET_LANGUAGES:
      return {
        ...state,
        filters: {
          ...state.filters,
          languages: action.payload,
        },
      };
    default:
      return state;
  }
};
