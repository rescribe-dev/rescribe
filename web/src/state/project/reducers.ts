import { SET_PROJECT, ProjectState, ProjectActionTypes } from './types';

const initialState: ProjectState = {
  id: null,
  name: '',
};

export const projectReducer = (
  state = initialState,
  action: ProjectActionTypes
): ProjectState => {
  switch (action.type) {
    case SET_PROJECT:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
