import { createSlice } from '@reduxjs/toolkit';
import { api, makeThunk } from '../api';
import { logout } from './authSlice';

export const fetchApps = makeThunk('apps/fetch', async ({ status, search }) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  return (await api(`/applications?${params}`)).applications;
});
export const fetchStats = makeThunk('apps/stats', () => api('/applications/stats'));
export const createApp = makeThunk('apps/create', (body) => api('/applications', { method: 'POST', body }));
export const updateApp = makeThunk('apps/update', ({ id, body }) => api(`/applications/${id}`, { method: 'PUT', body }));
export const deleteApp = makeThunk('apps/delete', async (id) => {
  await api(`/applications/${id}`, { method: 'DELETE' });
  return id;
});

const initialState = {
  items: [],
  stats: null,
  total: 0,
  listStatus: 'idle', // idle | loading | ready | failed
  listError: null,
  listReq: null, // latest request id, so slow older responses are ignored
  statsError: null,
  deletingId: null,
  deleteError: null,
};

const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApps.pending, (s, { meta }) => {
        s.listStatus = 'loading';
        s.listError = null;
        s.listReq = meta.requestId;
      })
      .addCase(fetchApps.fulfilled, (s, { meta, payload }) => {
        if (meta.requestId !== s.listReq) return;
        s.listStatus = 'ready';
        s.items = payload;
      })
      .addCase(fetchApps.rejected, (s, { meta, payload }) => {
        if (meta.requestId !== s.listReq) return;
        s.listStatus = 'failed';
        s.listError = payload?.message || 'Could not load your applications.';
      })
      .addCase(fetchStats.fulfilled, (s, { payload }) => {
        s.stats = payload.stats;
        s.total = payload.total;
        s.statsError = null;
      })
      .addCase(fetchStats.rejected, (s, { payload }) => {
        s.statsError = payload?.message || 'Could not load the status counts.';
      })
      .addCase(deleteApp.pending, (s, { meta }) => {
        s.deletingId = meta.arg;
        s.deleteError = null;
      })
      .addCase(deleteApp.fulfilled, (s, { payload }) => {
        s.deletingId = null;
        s.items = s.items.filter((a) => a._id !== payload);
      })
      .addCase(deleteApp.rejected, (s, { payload }) => {
        s.deletingId = null;
        s.deleteError = payload?.message || 'Could not delete that application.';
      })
      .addCase(logout, () => initialState);
  },
});

export default appsSlice.reducer;
