import { combineReducers } from 'redux';
import { authReducer } from './auth/reducers';

const rootReducer = combineReducers({ authReducer });

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
