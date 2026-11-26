import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAllPosts, getPostById } from '../services/blogService';
import type { Post } from '../types/blog';
import { idleRequest, isFresh, type RequestState } from './request';

interface PostsState {
  entities: Record<number, Post>;
  ids: number[];
  list: RequestState;
  details: Record<string, RequestState>;
}
const initialState: PostsState = {
  entities: {},
  ids: [],
  list: idleRequest(),
  details: {},
};
type State = { posts: PostsState };
export const fetchPosts = createAsyncThunk(
  'posts/fetchList',
  async (_: boolean | undefined, { signal }) => ({
    posts: await getAllPosts(signal),
    at: Date.now(),
  }),
  {
    condition: (force, { getState }) => {
      const request = (getState() as State).posts.list;
      return request.status !== 'pending' && (force || !isFresh(request));
    },
  },
);
export const fetchPost = createAsyncThunk(
  'posts/fetchDetails',
  async ({ id }: { id: string; force?: boolean }, { signal, getState }) => {
    const state = (getState() as State).posts;
    const post =
      isFresh(state.list) && state.list.status === 'succeeded'
        ? (state.entities[Number(id)] ?? null)
        : await getPostById(id, signal);
    return { post, at: Date.now() };
  },
  {
    condition: ({ id, force }, { getState }) => {
      const request = (getState() as State).posts.details[id];
      return (
        !request ||
        (request.status !== 'pending' && (force || !isFresh(request)))
      );
    },
  },
);
export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.list = {
          ...state.list,
          status: 'pending',
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.ids = action.payload.posts.map((post) => post.id);
        for (const post of action.payload.posts) state.entities[post.id] = post;
        state.list.status = 'succeeded';
        state.list.updatedAt = action.payload.at;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.status = action.meta.aborted ? 'idle' : 'failed';
        state.list.error = action.meta.aborted
          ? null
          : (action.error.message ?? 'Unable to load stories.');
      })
      .addCase(fetchPost.pending, (state, action) => {
        state.details[action.meta.arg.id] = {
          ...idleRequest(),
          status: 'pending',
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        const request = state.details[action.meta.arg.id];
        if (request?.requestId !== action.meta.requestId) return;
        if (action.payload.post)
          state.entities[action.payload.post.id] = action.payload.post;
        else delete state.entities[Number(action.meta.arg.id)];
        request.status = 'succeeded';
        request.updatedAt = action.payload.at;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        const request = state.details[action.meta.arg.id];
        if (request?.requestId !== action.meta.requestId) return;
        request.status = action.meta.aborted ? 'idle' : 'failed';
        request.error = action.meta.aborted
          ? null
          : (action.error.message ?? 'Unable to open story.');
      });
  },
});
