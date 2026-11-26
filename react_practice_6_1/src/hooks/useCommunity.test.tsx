import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createAppStore } from '../store';
import type { ReactNode } from 'react';
import { useCommunity } from './useCommunity';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('refetches after create/update/delete and isolates each account', async () => {
  const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => ({
    ok: true,
    headers: new Headers(),
    json: async () =>
      options?.method
        ? {}
        : [{ id: 1, userId: 1, title: 'Original', body: 'Body' }],
  }));
  vi.stubGlobal('fetch', fetchMock);
  const store = createAppStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result, rerender } = renderHook(({ uid }) => useCommunity(uid), {
    wrapper,
    initialProps: { uid: 'account-a' },
  });
  await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
  await act(async () => {
    await result.current.save.mutateAsync({
      input: { title: 'Created', body: 'New body' },
    });
  });
  await waitFor(() => expect(result.current.query.data).toHaveLength(2));
  const id = result.current.query.data![0].id;
  await act(async () => {
    await result.current.save.mutateAsync({
      id,
      input: { title: 'Updated', body: 'Edited body' },
    });
  });
  await waitFor(() =>
    expect(result.current.query.data![0].title).toBe('Updated'),
  );
  await act(async () => {
    await result.current.remove.mutateAsync(id);
  });
  await waitFor(() => expect(result.current.query.data).toHaveLength(1));
  await act(async () => {
    await result.current.save.mutateAsync({
      id: 1,
      input: { title: 'Private edit', body: 'Body' },
    });
  });
  rerender({ uid: 'account-b' });
  await waitFor(() =>
    expect(result.current.query.data?.[0].title).toBe('Original'),
  );
  expect(
    fetchMock.mock.calls.filter(([, options]) => !options?.method).length,
  ).toBeGreaterThanOrEqual(6);
});
it('does not cache a failed write or replace existing data', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, options?: RequestInit) => ({
      ok: !options?.method,
      headers: new Headers(),
      status: 500,
      json: async () => [
        { id: 1, userId: 1, title: 'Unchanged', body: 'Body' },
      ],
    })),
  );
  const store = createAppStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(() => useCommunity('failure-account'), {
    wrapper,
  });
  await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
  await act(async () => {
    await expect(
      result.current.save.mutateAsync({
        id: 1,
        input: { title: 'Bad update', body: 'Body' },
      }),
    ).rejects.toThrow('500');
  });
  expect(result.current.query.data![0].title).toBe('Unchanged');
});
