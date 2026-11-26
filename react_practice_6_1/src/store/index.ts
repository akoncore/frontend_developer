import { configureStore } from '@reduxjs/toolkit';
import { postsSlice } from './postsSlice';
import { communitySlice } from './communitySlice';
import { readingSlice } from './readingSlice';
export const createAppStore = () =>
  configureStore({
    reducer: {
      posts: postsSlice.reducer,
      community: communitySlice.reducer,
      reading: readingSlice.reducer,
    },
  });
export const store = createAppStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
