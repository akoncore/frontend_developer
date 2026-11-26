import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearWriteError,
  fetchCommunity,
  fetchCommunityDetail,
  readerKey,
  writeCommunity,
} from '../store/communitySlice';
import type { PostInput } from '../services/communityService';
import { useRefresh } from './useRefresh';
export function useCommunity(uid: string | null) {
  const dispatch = useAppDispatch();
  const load = useCallback(() => {
    void dispatch(fetchCommunity({ uid }));
  }, [dispatch, uid]);
  const refetch = useCallback(() => {
    void dispatch(fetchCommunity({ uid, force: true }));
  }, [dispatch, uid]);
  useRefresh(load, refetch);
  const feed = useAppSelector((state) => state.community.feeds[readerKey(uid)]);
  const write = useAppSelector(
    (state) => state.community.writes[readerKey(uid)],
  );
  const mutation = {
    isPending: write?.status === 'pending',
    error: write?.error ? { message: write.error } : null,
    reset: () => dispatch(clearWriteError(uid)),
  };
  const saveAsync = (args: { input: PostInput; id?: number }) =>
    dispatch(
      writeCommunity({ ...args, uid: uid ?? '', operation: 'save' }),
    ).unwrap();
  const removeAsync = (id: number) =>
    dispatch(
      writeCommunity({ id, uid: uid ?? '', operation: 'delete' }),
    ).unwrap();
  return {
    query: {
      data: feed?.data,
      isPending:
        !feed ||
        feed.status === 'idle' ||
        (feed.status === 'pending' && !feed.data),
      isFetching: feed?.status === 'pending',
      isSuccess: feed?.status === 'succeeded',
      error: feed?.error ? { message: feed.error } : null,
      refetch,
    },
    save: {
      ...mutation,
      mutateAsync: saveAsync,
      mutate: (
        args: { input: PostInput; id?: number },
        callbacks?: { onSuccess?: () => void },
      ) => {
        void saveAsync(args)
          .then(() => callbacks?.onSuccess?.())
          .catch(() => {});
      },
    },
    remove: {
      ...mutation,
      mutateAsync: removeAsync,
      mutate: (id: number, callbacks?: { onSuccess?: () => void }) => {
        void removeAsync(id)
          .then(() => callbacks?.onSuccess?.())
          .catch(() => {});
      },
    },
  };
}
export function useCommunityDetail(id: string) {
  const dispatch = useAppDispatch();
  const load = useCallback(() => {
    void dispatch(fetchCommunityDetail({ id }));
  }, [dispatch, id]);
  const retry = useCallback(() => {
    void dispatch(fetchCommunityDetail({ id, force: true }));
  }, [dispatch, id]);
  useRefresh(load, retry);
  const request = useAppSelector((state) => state.community.details[id]);
  return {
    data: request?.data,
    loading:
      !request || request.status === 'idle' || request.status === 'pending',
    error: request?.error,
    retry,
  };
}
