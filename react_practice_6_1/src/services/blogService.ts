import type { PaginatedPosts, Post, PostFilters } from '../types/blog';

/** A real HTTP fetch to a local JSON fixture; deliberately no Django connection yet. */
const DATA_URL = `${import.meta.env.BASE_URL}data/posts.json`;

export async function getAllPosts(signal?: AbortSignal): Promise<Post[]> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const response = await fetch(DATA_URL, { signal });
  if (!response.ok) throw new Error(`Cannot load posts (${response.status})`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid posts response');
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return data as Post[];
}

export async function getPosts(
  filters: PostFilters,
  signal?: AbortSignal,
): Promise<PaginatedPosts> {
  const all = await getAllPosts(signal);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const query = filters.search.toLocaleLowerCase().trim();
  const matched = all.filter((post) => {
    const searchable = [
      post.title,
      post.body,
      post.author_info.first_name,
      post.category?.name ?? '',
      ...post.tags.map((t) => t.name),
    ]
      .join(' ')
      .toLowerCase();
    return (
      (!query || searchable.includes(query)) &&
      (filters.category === 'all' ||
        post.category?.slug === filters.category) &&
      (filters.status === 'all' || post.status === filters.status)
    );
  });
  matched.sort((a, b) => {
    if (filters.sort === 'oldest')
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    if (filters.sort === 'title') return a.title.localeCompare(b.title);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const start = (filters.page - 1) * filters.limit;
  return {
    results: matched.slice(start, start + filters.limit),
    count: matched.length,
    previous: filters.page > 1 ? filters.page - 1 : null,
    next: start + filters.limit < matched.length ? filters.page + 1 : null,
  };
}

export async function getPostById(
  id: string,
  signal?: AbortSignal,
): Promise<Post | null> {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const posts = await getAllPosts(signal);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return posts.find((post) => post.id === Number(id)) ?? null;
}
