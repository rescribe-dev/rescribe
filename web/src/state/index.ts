import { combineReducers } from 'redux';
import { authReducer } from './auth/reducers';
import { searchReducer } from './search/reducers';

const rootReducer = combineReducers({
  authReducer,
  searchReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
