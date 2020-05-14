import { ProjectActionTypes, SET_PROJECT, SetProjectInput } from './types';

export const setProject = (
  projectInput: SetProjectInput
): ProjectActionTypes => {
  return {
    type: SET_PROJECT,
    payload: projectInput,
  };
};
