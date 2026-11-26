export interface RequestState {
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  requestId?: string;
  updatedAt: number;
}
export const idleRequest = (): RequestState => ({
  status: 'idle',
  error: null,
  updatedAt: 0,
});
export const isFresh = (request: RequestState) =>
  request.status === 'pending' ||
  (request.status === 'succeeded' && Date.now() - request.updatedAt < 60_000);
