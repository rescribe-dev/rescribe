import { store } from '../reduxWrapper';
import { RootState } from '..';

export const getSearchURL = (): string => {
  const state = (store.getState() as RootState).searchReducer;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const searchURL = new URL(`${baseUrl}/search`);
  searchURL.searchParams.append('q', state.query);
  return searchURL.toString();
};
