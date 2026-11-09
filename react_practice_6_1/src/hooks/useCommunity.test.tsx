import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCommunity } from './useCommunity';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('refetches after create/update/delete and isolates each account', async () => {
  const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => ({
    ok: true,
    json: async () =>
      options?.method
        ? {}
        : [{ id: 1, userId: 1, title: 'Original', body: 'Body' }],
  }));
  vi.stubGlobal('fetch', fetchMock);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
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
  client.clear();
});
it('does not cache a failed write or replace existing data', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, options?: RequestInit) => ({
      ok: !options?.method,
      status: 500,
      json: async () => [
        { id: 1, userId: 1, title: 'Unchanged', body: 'Body' },
      ],
    })),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
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
  client.clear();
});
