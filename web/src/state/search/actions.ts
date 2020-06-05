import {
  SearchActionTypes,
  SET_QUERY,
  SetQueryInput,
  SetSearchResultsInput,
  SET_SEARCH_RESULTS,
  SetPageInput,
  SET_PAGE,
  SetPerpageInput,
  SET_PERPAGE,
  SetProjectsInput,
  SET_PROJECTS,
  SetRepositoriesInput,
  SET_REPOSITORIES,
  SetSearchingInput,
  SET_SEARCHING,
  SetHasSearchedInput,
  SET_HAS_SEARCHED,
} from './types';

export const setSearchResults = (
  searchResultsInput: SetSearchResultsInput
): SearchActionTypes => {
  return {
    type: SET_SEARCH_RESULTS,
    payload: searchResultsInput,
  };
};

export const setSearching = (
  searchingInput: SetSearchingInput
): SearchActionTypes => {
  return {
    type: SET_SEARCHING,
    payload: searchingInput,
  };
};

export const setHasSearched = (
  hasSearchedInput: SetHasSearchedInput
): SearchActionTypes => {
  return {
    type: SET_HAS_SEARCHED,
    payload: hasSearchedInput,
  };
};

export const setQuery = (queryInput: SetQueryInput): SearchActionTypes => {
  return {
    type: SET_QUERY,
    payload: queryInput,
  };
};

export const setPage = (pageInput: SetPageInput): SearchActionTypes => {
  return {
    type: SET_PAGE,
    payload: pageInput,
  };
};

export const setPerpage = (
  perpageInput: SetPerpageInput
): SearchActionTypes => {
  return {
    type: SET_PERPAGE,
    payload: perpageInput,
  };
};

export const setProjects = (
  projectsInput: SetProjectsInput
): SearchActionTypes => {
  return {
    type: SET_PROJECTS,
    payload: projectsInput,
  };
};

export const setRepositories = (
  repositoriesInput: SetRepositoriesInput
): SearchActionTypes => {
  return {
    type: SET_REPOSITORIES,
    payload: repositoriesInput,
  };
};
