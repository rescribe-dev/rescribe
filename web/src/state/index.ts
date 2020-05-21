import { combineReducers } from 'redux';
import { authReducer } from './auth/reducers';
import { projectReducer } from './project/reducers';

const rootReducer = combineReducers({
  authReducer,
  projectReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
