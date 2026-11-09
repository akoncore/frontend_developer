export interface CommunityPost {
  id: number;
  title: string;
  body: string;
  userId: number;
}
export type PostInput = Pick<CommunityPost, 'title' | 'body'>;
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
// JSONPlaceholder acknowledges writes without saving them. Session overlays make
// the result visible after invalidation. They are isolated by Firebase UID.
const overlays = new Map<string, Map<number, CommunityPost | null>>();
let nextId = 1000;
function edits(uid: string) {
  let value = overlays.get(uid);
  if (!value) {
    value = new Map();
    overlays.set(uid, value);
  }
  return value;
}
async function request(path: string, options?: RequestInit) {
  const response = await fetch(API_URL + path, options);
  if (!response.ok)
    throw new Error(
      'Community request failed (' + response.status + '). Please try again.',
    );
  return response.json();
}
export async function getCommunityPosts(
  uid: string | null,
  signal?: AbortSignal,
): Promise<CommunityPost[]> {
  const data: unknown = await request('', { signal });
  if (
    !Array.isArray(data) ||
    !data.every(
      (p) =>
        typeof p.id === 'number' &&
        typeof p.title === 'string' &&
        typeof p.body === 'string',
    )
  )
    throw new Error('Invalid community response.');
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const result = new Map((data as CommunityPost[]).map((p) => [p.id, p]));
  if (uid)
    edits(uid).forEach((post, id) => {
      if (post) result.set(id, post);
      else result.delete(id);
    });
  return [...result.values()].sort((a, b) => b.id - a.id);
}
export async function saveCommunityPost(
  uid: string,
  input: PostInput,
  id?: number,
): Promise<void> {
  if (!uid) throw new Error('Please sign in to edit stories.');
  const title = input.title.trim(),
    body = input.body.trim();
  if (!title || !body) throw new Error('Title and story are required.');
  // Locally created IDs do not exist on JSONPlaceholder; use POST for those.
  await request(id && id < 1000 ? '/' + id : '', {
    method: id && id < 1000 ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, userId: 1 }),
  });
  const postId = id ?? nextId++;
  edits(uid).set(postId, {
    id: postId,
    title,
    body,
    userId: 1,
  });
}
export async function deleteCommunityPost(
  uid: string,
  id: number,
): Promise<void> {
  if (!uid) throw new Error('Please sign in to delete stories.');
  await request('/' + id, { method: 'DELETE' });
  edits(uid).set(id, null);
}
