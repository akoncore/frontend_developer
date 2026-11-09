import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteCommunityPost,
  getCommunityPosts,
  saveCommunityPost,
  type PostInput,
} from '../services/communityService';
export function useCommunity(uid: string | null) {
  const client = useQueryClient();
  const queryKey = ['community', uid] as const;
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => getCommunityPosts(uid, signal),
  });
  async function invalidate() {
    await client.cancelQueries({ queryKey });
    await client.invalidateQueries({ queryKey });
  }
  const save = useMutation({
    mutationFn: ({ input, id }: { input: PostInput; id?: number }) =>
      saveCommunityPost(uid ?? '', input, id),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteCommunityPost(uid ?? '', id),
    onSuccess: invalidate,
  });
  return { query, save, remove };
}
