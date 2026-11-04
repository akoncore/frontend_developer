import { Link, useParams } from 'react-router-dom';
import ImageSlot from '../components/ImageSlot';
import { ErrorState, LoadingState } from '../components/States';
import { useAsync } from '../hooks/useAsync';
import { getPostById } from '../services/blogService';
export default function PostDetails() {
  const { id = '' } = useParams();
  const {
    data: post,
    loading,
    error,
  } = useAsync((signal) => getPostById(id, signal), [id]);
  if (loading)
    return (
      <div className="container">
        <LoadingState text="Opening story…" />
      </div>
    );
  if (error)
    return (
      <div className="container">
        <ErrorState message={error} />
      </div>
    );
  if (!post)
    return (
      <div className="container not-found">
        <span className="eyebrow">STORY NOT FOUND</span>
        <h1>That story doesn't exist.</h1>
        <p>The ID may be invalid or the story may have been removed.</p>
        <Link to="/posts" className="button button-dark">
          All stories ↗
        </Link>
      </div>
    );
  return (
    <article className="detail-page container">
      <div className="detail-back">
        <button
          onClick={() =>
            window.history.length > 1
              ? window.history.back()
              : window.location.assign('/posts')
          }
          className="clear-button"
        >
          ← Back
        </button>
        <Link to="/posts" className="text-link">
          All stories ↗
        </Link>
      </div>
      <div className="detail-header">
        <span className="eyebrow">
          {post.category?.name ?? 'Uncategorized'} / {post.status.toUpperCase()}
        </span>
        <h1>{post.title}</h1>
        <p>{post.body.slice(0, 180)}…</p>
        <div className="detail-author">
          <div className="avatar-placeholder">
            {post.author_info.first_name[0]}
          </div>
          <div>
            <strong>{post.author_info.first_name}</strong>
            <span>{post.created_at}</span>
          </div>
        </div>
      </div>
      <ImageSlot
        variant="detail"
        cover={post.cover}
        label="YOUR ARTICLE IMAGE"
      />
      <div className="detail-grid">
        <div className="article-body">
          {post.body.split(/\n\n/).map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
          <div className="tags-row">
            {post.tags.map((tag) => (
              <span key={tag.id}>#{tag.name}</span>
            ))}
          </div>
        </div>
        <aside className="detail-aside">
          <h3>Story details</h3>
          <dl>
            <dt>Post ID</dt>
            <dd>{post.id}</dd>
            <dt>Slug</dt>
            <dd>{post.slug}</dd>
            <dt>Category</dt>
            <dd>{post.category?.name ?? 'Uncategorized'}</dd>
            <dt>Status</dt>
            <dd className="capitalize">{post.status}</dd>
            <dt>Published</dt>
            <dd>{post.is_published ? 'Yes' : 'No'}</dd>
            <dt>Author</dt>
            <dd>{post.author_info.first_name}</dd>
            <dt>Author email</dt>
            <dd>{post.author_info.email}</dd>
            <dt>Created at</dt>
            <dd>{post.created_at}</dd>
            <dt>Tags</dt>
            <dd>{post.tags.map((t) => t.name).join(', ') || 'None'}</dd>
          </dl>
        </aside>
      </div>
    </article>
  );
}
