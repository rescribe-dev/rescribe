import {
  SearchActionTypes,
  SET_QUERY,
  SET_SEARCH_RESULTS,
  SET_PAGE,
  SET_PERPAGE,
  SET_PROJECTS,
  SET_REPOSITORIES,
  SET_SEARCHING,
  SET_HAS_SEARCHED,
  SET_LANGUAGES,
} from './types';
import { SearchQuery, Language } from 'lib/generated/datamodel';
import ObjectId from 'bson-objectid';

export const setSearchResults = (
  searchResultsInput: SearchQuery
): SearchActionTypes => {
  return {
    type: SET_SEARCH_RESULTS,
    payload: searchResultsInput,
  };
};

export const setSearching = (searchingInput: boolean): SearchActionTypes => {
  return {
    type: SET_SEARCHING,
    payload: searchingInput,
  };
};

export const setHasSearched = (
  hasSearchedInput: boolean
): SearchActionTypes => {
  return {
    type: SET_HAS_SEARCHED,
    payload: hasSearchedInput,
  };
};

export const setQuery = (queryInput: string): SearchActionTypes => {
  return {
    type: SET_QUERY,
    payload: queryInput,
  };
};

export const setPage = (pageInput: number): SearchActionTypes => {
  return {
    type: SET_PAGE,
    payload: pageInput,
  };
};

export const setPerpage = (perpageInput: number): SearchActionTypes => {
  return {
    type: SET_PERPAGE,
    payload: perpageInput,
  };
};

export const setProjects = (projectsInput: ObjectId[]): SearchActionTypes => {
  return {
    type: SET_PROJECTS,
    payload: projectsInput,
  };
};

export const setRepositories = (
  repositoriesInput: ObjectId[]
): SearchActionTypes => {
  return {
    type: SET_REPOSITORIES,
    payload: repositoriesInput,
  };
};

export const setLanguages = (languagesInput: Language[]): SearchActionTypes => {
  return {
    type: SET_LANGUAGES,
    payload: languagesInput,
  };
};
