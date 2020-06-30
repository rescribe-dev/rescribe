import { store } from '../reduxWrapper';
import { searchParamKeys } from 'utils/variables';
import { setQuery, setLanguages } from './actions';
import { RootState } from '..';
import { isEqual } from 'lodash';
import { Language } from 'lib/generated/datamodel';
import { capitalizeFirstLetter } from 'utils/misc';

export const processSearchParams = (searchParamsStr: string): boolean => {
  const state = (store.getState() as RootState).searchReducer;
  const searchParams = new URLSearchParams(searchParamsStr);
  let foundQuery = false;
  if (searchParams.has(searchParamKeys.query)) {
    const newQuery = searchParams.get(searchParamKeys.query) as string;
    if (newQuery !== state.query) {
      store.dispatch(setQuery(newQuery));
    }
    foundQuery = true;
  }
  if (searchParams.has(searchParamKeys.language)) {
    const newLanguages = (searchParams.get(searchParamKeys.language) as string)
      .split(',')
      .reduce((result, name) => {
        const capitalizedName = capitalizeFirstLetter(name);
        try {
          const language = Language[capitalizedName as keyof typeof Language];
          result.push(language);
        } catch (_err) {
          // handle error
        }
        return result;
      }, [] as Language[]);
    if (!isEqual(newLanguages, state.filters.languages)) {
      store.dispatch(setLanguages(newLanguages));
    }
  }
  return foundQuery;
};
