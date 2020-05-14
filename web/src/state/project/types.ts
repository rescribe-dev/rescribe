export const SET_PROJECT = 'SET_PROJECT';

export interface ProjectState {
  id: string | null;
  name: string;
}

export interface SetProjectInput {
  name: string;
  id: string | null;
}

interface SetProjectAction {
  type: typeof SET_PROJECT;
  payload: SetProjectInput;
}

export type ProjectActionTypes = SetProjectAction;
