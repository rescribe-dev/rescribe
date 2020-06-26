import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import { createWhitelistFilter } from 'redux-persist-transform-filter';
import storage from 'redux-persist/lib/storage';
import rootReducer from '.';
import thunk from 'redux-thunk';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
    devToolsExtension: any;
  }
}

const loadDevTools = (): any =>
  process.env.NODE_ENV === 'development' && window && window.devToolsExtension
    ? window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__()
    : (f: any) => f;

// https://gist.github.com/azamatsmith/ab814c869e81dc01b07782be0493ebcd
const persistedReducer = persistReducer(
  {
    key: 'rescribe',
    storage,
    transforms: [
      createWhitelistFilter('authReducer', ['loggedIn', 'username']),
    ],
    blacklist: ['searchReducer'],
  },
  rootReducer
);

export const store = createStore(
  persistedReducer,
  compose(applyMiddleware(thunk), loadDevTools())
);

const persistor = persistStore(store as any);

export const WrapRedux = (element: JSX.Element): JSX.Element => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {element}
    </PersistGate>
  </Provider>
);
