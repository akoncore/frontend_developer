import { useCommunityDetail } from '../hooks/useCommunity';
import { Link, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/States';
export default function CommunityDetails() {
  const { id = '' } = useParams();
  const query = useCommunityDetail(id);
  return (
    <article className="container detail-page">
      <Link className="text-link" to="/community">
        Back to Community
      </Link>
      {query.loading ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState message={query.error} onRetry={query.retry} />
      ) : query.data ? (
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
      ) : null}
    </article>
  );
}
