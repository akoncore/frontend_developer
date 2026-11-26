import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createAppStore } from '../store';
import type { ReactNode } from 'react';
import { usePosts } from './usePosts';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('uses the latest search with one shared list request', async () => {
  const pending: { finish: () => void; signal: AbortSignal }[] = [];
  const data = ['Old', 'New'].map((title, index) => ({
    id: index + 1,
    title,
    body: 'Body',
    author_info: { first_name: 'Author' },
    category: null,
    tags: [],
    status: 'published',
    created_at: '2026-01-01',
  }));
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url: string, options: RequestInit) =>
        new Promise((resolve) => {
          pending.push({
            signal: options.signal as AbortSignal,
            finish: () =>
              resolve({
                ok: true,
                headers: new Headers(),
                json: async () => data,
              }),
          });
        }),
    ),
  );
  const store = createAppStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result, rerender } = renderHook(
    ({ search }) =>
      usePosts({
        search,
        category: 'all',
        status: 'all',
        sort: 'newest',
        page: 1,
        limit: 9,
      }),
    { wrapper, initialProps: { search: 'Old' } },
  );
  await waitFor(() => expect(pending).toHaveLength(1));
  rerender({ search: 'New' });
  expect(pending).toHaveLength(1);
  await act(async () => pending[0].finish());
  await waitFor(() =>
    expect(result.current.data?.results[0].title).toBe('New'),
  );
  await act(async () => pending[0].finish());
  expect(result.current.data?.results[0].title).toBe('New');
});
