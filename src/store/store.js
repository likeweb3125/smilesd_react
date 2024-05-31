import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import sessionStorage from 'redux-persist/es/storage/session';
import user from './userSlice';
import common from './commonSlice';
import popup from './popupSlice';
import etc from './etcSlice';

const reducers = combineReducers({
  user: user.reducer,
  common: common.reducer,
  popup: popup.reducer,
  etc: etc.reducer,
});

const persistConfig = {
  key: 'root',
  storage: sessionStorage,
  whitelist: ['user','common']
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export default store;