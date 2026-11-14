import { configureStore } from '@reduxjs/toolkit';
import auth, { logout } from './authSlice';
import apps from './appsSlice';
import { setUnauthorizedHandler } from '../api';

const store = configureStore({ reducer: { auth, apps } });
setUnauthorizedHandler(() => store.dispatch(logout()));

export default store;
