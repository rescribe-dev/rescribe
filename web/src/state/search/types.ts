import { SearchQuery, Language } from '../../lib/generated/datamodel';
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
    languages: Language[];
  };
}

export const SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS';
export const SET_SEARCHING = 'SET_SEARCHING';
export const SET_HAS_SEARCHED = 'SET_HAS_SEARCHED';
export const SET_QUERY = 'SET_QUERY';
export const SET_PAGE = 'SET_PAGE';
export const SET_PERPAGE = 'SET_PERPAGE';
export const SET_PROJECTS = 'SET_PROJECTS';
export const SET_REPOSITORIES = 'SET_REPOSITORIES';
export const SET_LANGUAGES = 'SET_LANGUAGES';

interface SetSearchResultsAction {
  type: typeof SET_SEARCH_RESULTS;
  payload: SearchQuery;
}
interface SetSearchingAction {
  type: typeof SET_SEARCHING;
  payload: boolean;
}
interface SetHasSearchedAction {
  type: typeof SET_HAS_SEARCHED;
  payload: boolean;
}
interface SetQueryAction {
  type: typeof SET_QUERY;
  payload: string;
}
interface SetPageAction {
  type: typeof SET_PAGE;
  payload: number;
}
interface SetPerpageAction {
  type: typeof SET_PERPAGE;
  payload: number;
}
interface SetProjectsAction {
  type: typeof SET_PROJECTS;
  payload: ObjectId[];
}
interface SetRepositoriesAction {
  type: typeof SET_REPOSITORIES;
  payload: ObjectId[];
}

interface SetLanguagesAction {
  type: typeof SET_LANGUAGES;
  payload: Language[];
}

export type SearchActionTypes =
  | SetSearchResultsAction
  | SetSearchingAction
  | SetHasSearchedAction
  | SetQueryAction
  | SetPageAction
  | SetPerpageAction
  | SetProjectsAction
  | SetRepositoriesAction
  | SetLanguagesAction;
