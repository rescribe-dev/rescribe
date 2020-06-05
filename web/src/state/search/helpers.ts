import { store } from '../reduxWrapper';
import { searchParamKeys } from '../../utils/config';
import { setQuery } from './actions';
import { RootState } from '..';

export const processSearchParams = (searchParamsStr: string): boolean => {
  const state = (store.getState() as RootState).searchReducer;
  const searchParams = new URLSearchParams(searchParamsStr);
  const hasQuery = searchParams.has(searchParamKeys.query);
  if (hasQuery) {
    const newQuery = searchParams.get(searchParamKeys.query) as string;
    if (newQuery !== state.query) {
      store.dispatch(
        setQuery({
          query: searchParams.get(searchParamKeys.query) as string,
        })
      );
    }
    return true;
  }
  return false;
};
