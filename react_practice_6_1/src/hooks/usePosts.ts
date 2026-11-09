import { useQuery } from '@tanstack/react-query';
import { getAllPosts, getPostById, getPosts } from '../services/blogService';
import type { PostFilters } from '../types/blog';
export function usePosts(filters: PostFilters) {
  const query = useQuery({
    queryKey: ['posts', 'list', filters],
    queryFn: ({ signal }) => getPosts(filters, signal),
  });
  return {
    data: query.data,
    loading: query.isPending,
    error: query.error?.message,
  };
}
export function useAllPosts() {
  const query = useQuery({
    queryKey: ['posts', 'all'],
    queryFn: ({ signal }) => getAllPosts(signal),
  });
  return {
    data: query.data,
    loading: query.isPending,
    error: query.error?.message,
  };
}
export function usePost(id: string) {
  const query = useQuery({
    queryKey: ['posts', 'detail', id],
    queryFn: ({ signal }) => getPostById(id, signal),
  });
  return {
    data: query.data,
    loading: query.isPending,
    error: query.error?.message,
  };
}
