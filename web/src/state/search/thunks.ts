import { AppThunkAction } from '../thunk';
import { client } from 'utils/apollo';
import {
  SearchQueryVariables,
  SearchQuery,
  Search,
} from 'lib/generated/datamodel';
import { store } from '../reduxWrapper';
import { RootState } from '..';
import { setSearchResults, setSearching, setHasSearched } from './actions';
import { queryMinLength } from 'shared/variables';

const search = async (): Promise<SearchQuery> => {
  const state = (store.getState() as RootState).searchReducer;
  if (state.query.length < queryMinLength) {
    throw new Error('no query provided');
  }
  const variables: SearchQueryVariables = {
    query: state.query,
    page: state.page,
    perpage: state.perpage,
    maxResultsPerFile: 1,
  };
  if (state.filters.projects.length > 0) {
    if (state.filters.repositories.length > 0) {
      variables.repositories = state.filters.repositories;
    } else {
      variables.projects = state.filters.projects;
    }
  }
  if (state.filters.languages.length > 0) {
    variables.languages = state.filters.languages;
  }
  const queryRes = await client.query<SearchQuery, SearchQueryVariables>({
    query: Search,
    variables,
    fetchPolicy: 'no-cache', // disable cache
  });
  if (queryRes.errors) {
    throw new Error(queryRes.errors.join(', '));
  }
  return queryRes.data;
};

export const thunkSearch = (): AppThunkAction<Promise<void>> => async (
  dispatch
) => {
  dispatch(setHasSearched(true));
  dispatch(setSearching(true));
  try {
    const searchResults = await search();
    dispatch(setSearchResults(searchResults));
    dispatch(setSearching(false));
  } catch (err) {
    dispatch(setSearching(false));
    throw err;
  }
};
