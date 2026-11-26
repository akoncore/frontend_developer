import { afterEach, expect, it, vi } from 'vitest';
import { createAppStore } from './index';
import { fetchPosts, fetchPost } from './postsSlice';
import { fetchCommunity } from './communitySlice';
import {
  selectAllPosts,
  makeSelectFilteredPosts,
  selectSavedCount,
} from './selectors';
import { toggleSaved } from './readingSlice';
import type { Post } from '../types/blog';
const post = {
  id: 1,
  title: 'Redux',
  body: 'State',
  author_info: { first_name: 'Author' },
  category: null,
  tags: [],
  status: 'published',
  created_at: '2026-01-01',
} as unknown as Post;
const response = (data: unknown) => ({
  ok: true,
  headers: new Headers(),
  json: async () => data,
});
afterEach(() => vi.unstubAllGlobals());
it('retries failed reads, deduplicates cached reads and reuses entities for detail', async () => {
  const fetch = vi
    .fn()
    .mockRejectedValueOnce(new Error('Network failure'))
    .mockResolvedValue(response([post]));
  vi.stubGlobal('fetch', fetch);
  const store = createAppStore();
  await store.dispatch(fetchPosts());
  expect(store.getState().posts.list.status).toBe('failed');
  await store.dispatch(fetchPosts(true));
  await store.dispatch(fetchPosts());
  await store.dispatch(fetchPost({ id: '1' }));
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(store.getState().posts.details['1'].status).toBe('succeeded');
  expect(store.getState().posts.entities[1]).toEqual(post);
  await store.dispatch(fetchPost({ id: '999' }));
  expect(store.getState().posts.entities[999]).toBeUndefined();
});
it('does not let a stale community GET overwrite a mutation refresh', async () => {
  const resolve: Array<(value: unknown) => void> = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise((done) => resolve.push(done))),
  );
  const store = createAppStore();
  const old = store.dispatch(fetchCommunity({ uid: 'a' }));
  const fresh = store.dispatch(fetchCommunity({ uid: 'a', force: true }));
  resolve[1](response([{ id: 1, title: 'Fresh', body: 'Body', userId: 1 }]));
  await fresh;
  resolve[0](response([{ id: 1, title: 'Old', body: 'Body', userId: 1 }]));
  await old;
  expect(store.getState().community.feeds['user:a'].data?.[0].title).toBe(
    'Fresh',
  );
});
it('memoizes derived lists, preserves sorting/pagination and isolates saved IDs by reader', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(response([post, { ...post, id: 2, title: 'Alpha' }])),
  );
  const store = createAppStore();
  await store.dispatch(fetchPosts());
  const selector = makeSelectFilteredPosts();
  const filters = {
    search: '',
    category: 'all',
    status: 'published',
    sort: 'title',
    page: 1,
    limit: 1,
  };
  const before = selector(store.getState(), filters);
  const all = selectAllPosts(store.getState());
  expect(before.results[0].title).toBe('Alpha');
  expect(before.next).toBe(2);
  store.dispatch(toggleSaved({ reader: 'user:a', id: 1 }));
  expect(selector(store.getState(), filters)).toBe(before);
  expect(selectAllPosts(store.getState())).toBe(all);
  expect(selectSavedCount(store.getState(), 'a')).toBe(1);
  expect(selectSavedCount(store.getState(), 'b')).toBe(0);
  store.dispatch(toggleSaved({ reader: 'user:a', id: 1 }));
  expect(selectSavedCount(store.getState(), 'a')).toBe(0);
  expect(
    selector(store.getState(), { ...filters, search: 'missing' }).count,
  ).toBe(0);
});
