import { combineReducers } from 'redux';
import { authReducer } from './auth/reducers';
import { searchReducer } from './search/reducers';
import { purchaseReducer } from './purchase/reducers';
import { settingsReducer } from './settings/reducers';

const rootReducer = combineReducers({
  authReducer,
  searchReducer,
  purchaseReducer,
  settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
