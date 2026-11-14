import { createSlice } from '@reduxjs/toolkit';
import { api, makeThunk } from '../api';

export const login = makeThunk('auth/login', (body) => api('/auth/login', { method: 'POST', body }));
export const signup = makeThunk('auth/signup', (body) => api('/auth/signup', { method: 'POST', body }));
export const loadMe = makeThunk('auth/me', () => api('/auth/me'));

const token = localStorage.getItem('token');

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token, checking: Boolean(token), status: 'idle', error: null, errors: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    clearError(state) {
      state.error = null;
      state.errors = null;
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [login, signup]) {
      builder
        .addCase(thunk.pending, (s) => {
          s.status = 'loading';
          s.error = null;
          s.errors = null;
        })
        .addCase(thunk.fulfilled, (s, { payload }) => {
          s.status = 'idle';
          s.user = payload.user;
          s.token = payload.token;
          localStorage.setItem('token', payload.token);
        })
        .addCase(thunk.rejected, (s, { payload }) => {
          s.status = 'idle';
          s.error = payload?.message || 'Something went wrong. Please try again.';
          s.errors = payload?.errors || null;
        });
    }
    builder
      .addCase(loadMe.fulfilled, (s, { payload }) => {
        s.user = payload.user;
        s.checking = false;
      })
      .addCase(loadMe.rejected, (s) => {
        s.user = null;
        s.token = null;
        s.checking = false;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
