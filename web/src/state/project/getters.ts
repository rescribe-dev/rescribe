import { store } from '../reduxWrapper';
import { RootState } from '..';

export const isInProject = () => {
  const state = (store.getState() as RootState).projectReducer;
  return state.id !== null;
};
