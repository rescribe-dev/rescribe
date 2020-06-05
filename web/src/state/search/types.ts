import { SearchQuery } from '../../lib/generated/datamodel';
import ObjectId from 'bson-objectid';

export interface SearchState {
  searchResults: SearchQuery | null;
  searching: boolean;
  hasSearched: boolean;
  query: string;
  page: number;
  perpage: number;
  filters: {
    projects: ObjectId[];
    repositories: ObjectId[];
  };
}

export interface SetSearchResultsInput {
  searchResults: SearchQuery;
}
export interface SetSearchingInput {
  searching: boolean;
}
export interface SetHasSearchedInput {
  hasSearched: boolean;
}
export interface SetQueryInput {
  query: string;
}
export interface SetPageInput {
  page: number;
}
export interface SetPerpageInput {
  perpage: number;
}
export interface SetProjectsInput {
  projects: ObjectId[];
}
export interface SetRepositoriesInput {
  repositories: ObjectId[];
}

export const SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS';
export const SET_SEARCHING = 'SET_SEARCHING';
export const SET_HAS_SEARCHED = 'SET_HAS_SEARCHED';
export const SET_QUERY = 'SET_QUERY';
export const SET_PAGE = 'SET_PAGE';
export const SET_PERPAGE = 'SET_PERPAGE';
export const SET_PROJECTS = 'SET_PROJECTS';
export const SET_REPOSITORIES = 'SET_REPOSITORIES';

interface SetSearchResultsAction {
  type: typeof SET_SEARCH_RESULTS;
  payload: SetSearchResultsInput;
}
interface SetSearchingAction {
  type: typeof SET_SEARCHING;
  payload: SetSearchingInput;
}
interface SetHasSearchedAction {
  type: typeof SET_HAS_SEARCHED;
  payload: SetHasSearchedInput;
}
interface SetQueryAction {
  type: typeof SET_QUERY;
  payload: SetQueryInput;
}
interface SetPageAction {
  type: typeof SET_PAGE;
  payload: SetPageInput;
}
interface SetPerpageAction {
  type: typeof SET_PERPAGE;
  payload: SetPerpageInput;
}
interface SetProjectsAction {
  type: typeof SET_PROJECTS;
  payload: SetProjectsInput;
}
interface SetRepositoriesAction {
  type: typeof SET_REPOSITORIES;
  payload: SetRepositoriesInput;
}

export type SearchActionTypes =
  | SetSearchResultsAction
  | SetSearchingAction
  | SetHasSearchedAction
  | SetQueryAction
  | SetPageAction
  | SetPerpageAction
  | SetProjectsAction
  | SetRepositoriesAction;
