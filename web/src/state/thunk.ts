import { Action } from 'redux';
import { RootState } from '.';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

export type AppThunkAction<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export type AppThunkDispatch<ActionTypes extends Action<any>> = ThunkDispatch<
  RootState,
  undefined,
  ActionTypes
>;
