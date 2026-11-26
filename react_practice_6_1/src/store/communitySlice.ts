import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import * as api from '../services/communityService';
import { idleRequest, isFresh, type RequestState } from './request';

interface Feed extends RequestState {
  data?: api.CommunityPost[];
}
interface Detail extends RequestState {
  data?: api.CommunityPost;
}
interface CommunityState {
  feeds: Record<string, Feed>;
  details: Record<string, Detail>;
  writes: Record<string, RequestState>;
}
const initialState: CommunityState = { feeds: {}, details: {}, writes: {} };
type State = { community: CommunityState };
export const readerKey = (uid: string | null) =>
  uid ? `user:${uid}` : 'guest';
export const fetchCommunity = createAsyncThunk(
  'community/fetchList',
  async ({ uid }: { uid: string | null; force?: boolean }, { signal }) => ({
    data: await api.getCommunityPosts(uid, signal),
    at: Date.now(),
  }),
  {
    condition: ({ uid, force }, { getState }) => {
      const request = (getState() as State).community.feeds[readerKey(uid)];
      return force || !request || !isFresh(request);
    },
  },
);
export const fetchCommunityDetail = createAsyncThunk(
  'community/fetchDetails',
  async ({ id }: { id: string; force?: boolean }, { signal }) => ({
    data: await api.getCommunityPost(id, signal),
    at: Date.now(),
  }),
  {
    condition: ({ id, force }, { getState }) => {
      const request = (getState() as State).community.details[id];
      return (
        !request ||
        (request.status !== 'pending' && (force || !isFresh(request)))
      );
    },
  },
);
export const writeCommunity = createAsyncThunk(
  'community/write',
  async (
    args:
      | { uid: string; operation: 'save'; input: api.PostInput; id?: number }
      | { uid: string; operation: 'delete'; id: number },
    { dispatch },
  ) => {
    if (args.operation === 'save')
      await api.saveCommunityPost(args.uid, args.input, args.id);
    else await api.deleteCommunityPost(args.uid, args.id);
    // Force a newer request. requestId guards prevent an older GET undoing this refresh.
    // A refresh failure belongs to the list; the successful write must not be repeated.
    await dispatch(fetchCommunity({ uid: args.uid, force: true }));
  },
  {
    condition: ({ uid }, { getState }) =>
      (getState() as State).community.writes[readerKey(uid)]?.status !==
      'pending',
  },
);
export const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearWriteError: (state, action: PayloadAction<string | null>) => {
      const request = state.writes[readerKey(action.payload)];
      if (request && request.status !== 'pending')
        state.writes[readerKey(action.payload)] = idleRequest();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunity.pending, (state, action) => {
        const key = readerKey(action.meta.arg.uid);
        state.feeds[key] = {
          ...state.feeds[key],
          ...idleRequest(),
          status: 'pending',
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchCommunity.fulfilled, (state, action) => {
        const request = state.feeds[readerKey(action.meta.arg.uid)];
        if (request?.requestId !== action.meta.requestId) return;
        Object.assign(request, {
          data: action.payload.data,
          status: 'succeeded',
          updatedAt: action.payload.at,
        });
      })
      .addCase(fetchCommunity.rejected, (state, action) => {
        const request = state.feeds[readerKey(action.meta.arg.uid)];
        if (request?.requestId !== action.meta.requestId) return;
        request.status = action.meta.aborted ? 'idle' : 'failed';
        request.error = action.meta.aborted
          ? null
          : (action.error.message ?? 'Unable to load community.');
      })
      .addCase(fetchCommunityDetail.pending, (state, action) => {
        state.details[action.meta.arg.id] = {
          ...idleRequest(),
          status: 'pending',
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchCommunityDetail.fulfilled, (state, action) => {
        const request = state.details[action.meta.arg.id];
        if (request?.requestId !== action.meta.requestId) return;
        Object.assign(request, {
          data: action.payload.data,
          status: 'succeeded',
          updatedAt: action.payload.at,
        });
      })
      .addCase(fetchCommunityDetail.rejected, (state, action) => {
        const request = state.details[action.meta.arg.id];
        if (request?.requestId !== action.meta.requestId) return;
        request.status = action.meta.aborted ? 'idle' : 'failed';
        request.error = action.meta.aborted
          ? null
          : (action.error.message ?? 'Unable to open community story.');
      })
      .addCase(writeCommunity.pending, (state, action) => {
        state.writes[readerKey(action.meta.arg.uid)] = {
          ...idleRequest(),
          status: 'pending',
          requestId: action.meta.requestId,
        };
      })
      .addCase(writeCommunity.fulfilled, (state, action) => {
        const request = state.writes[readerKey(action.meta.arg.uid)];
        if (request?.requestId === action.meta.requestId)
          request.status = 'succeeded';
      })
      .addCase(writeCommunity.rejected, (state, action) => {
        const request = state.writes[readerKey(action.meta.arg.uid)];
        if (request?.requestId !== action.meta.requestId) return;
        request.status = 'failed';
        request.error = action.error.message ?? 'Unable to save changes.';
      });
  },
});
export const { clearWriteError } = communitySlice.actions;
