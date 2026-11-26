import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchPost, fetchPosts } from '../store/postsSlice';
import {
  selectAllPosts,
  selectPostsRequest,
  makeSelectFilteredPosts,
} from '../store/selectors';
import type { PostFilters } from '../types/blog';
import { useRefresh } from './useRefresh';
export function useAllPosts() {
  const dispatch = useAppDispatch();
  const load = useCallback(() => {
    void dispatch(fetchPosts());
  }, [dispatch]);
  const retry = useCallback(() => {
    void dispatch(fetchPosts(true));
  }, [dispatch]);
  useRefresh(load, retry);
  const request = useAppSelector(selectPostsRequest);
  const data = useAppSelector(selectAllPosts);
  return {
    data,
    loading: request.status === 'idle' || request.status === 'pending',
    error: request.error,
    retry,
  };
}
export function usePosts(filters: PostFilters) {
  const { loading, error, retry } = useAllPosts();
  const selector = useMemo(makeSelectFilteredPosts, []);
  const data = useAppSelector((state) => selector(state, filters));
  return { data, loading, error, retry };
}
export function usePost(id: string) {
  const dispatch = useAppDispatch();
  const load = useCallback(() => {
    void dispatch(fetchPost({ id }));
  }, [dispatch, id]);
  const retry = useCallback(() => {
    void dispatch(fetchPost({ id, force: true }));
  }, [dispatch, id]);
  useRefresh(load, retry);
  const request = useAppSelector((state) => state.posts.details[id]);
  const data = useAppSelector(
    (state) => state.posts.entities[Number(id)] ?? null,
  );
  return {
    data,
    loading:
      !request || request.status === 'idle' || request.status === 'pending',
    error: request?.error,
    retry,
  };
}
