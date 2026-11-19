import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchPublicJSON } from '../services/publicData';
import type { CommunityPost } from '../services/communityService';
import { ErrorState, LoadingState } from '../components/States';
export default function CommunityDetails() {
  const { id = '' } = useParams();
  const query = useQuery({
    queryKey: ['community-detail', id],
    queryFn: async ({ signal }) => {
      if (!/^[1-9]\d*$/.test(id)) throw new Error('Invalid story ID.');
      const data = (await fetchPublicJSON(
        `https://jsonplaceholder.typicode.com/posts/${id}`,
        signal,
      )) as CommunityPost;
      if (
        typeof data.id !== 'number' ||
        typeof data.title !== 'string' ||
        typeof data.body !== 'string'
      )
        throw new Error('Invalid story response.');
      return data;
    },
  });
  return (
    <article className="container detail-page">
      <Link className="text-link" to="/community">
        Back to Community
      </Link>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState message={query.error.message} />
      ) : (
        <div className="detail-header">
          <span className="eyebrow">
            PUBLIC COMMUNITY STORY {query.data.id}
          </span>
          <h1>{query.data.title}</h1>
          <p>{query.data.body}</p>
          <p>
            This is the public API version. Session edits appear in the
            Community list.
          </p>
        </div>
      )}
    </article>
  );
}
