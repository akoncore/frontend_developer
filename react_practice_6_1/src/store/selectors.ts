import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';
import type { PostFilters } from '../types/blog';
import { filterPosts } from '../services/blogService';
import { readerKey } from './communitySlice';
const emptyIds: number[] = [];
export const selectPostsRequest = (state: RootState) => state.posts.list;
export const selectAllPosts = createSelector(
  [
    (state: RootState) => state.posts.ids,
    (state: RootState) => state.posts.entities,
  ],
  (ids, entities) => ids.map((id) => entities[id]),
);
export const makeSelectFilteredPosts = () =>
  createSelector(
    [selectAllPosts, (_: RootState, filters: PostFilters) => filters],
    (posts, filters) => filterPosts(posts, filters),
  );
export const selectSavedIds = (state: RootState, uid: string | null) =>
  state.reading.byReader[readerKey(uid)] ?? emptyIds;
export const selectSavedCount = createSelector(
  [selectSavedIds],
  (ids) => ids.length,
);
