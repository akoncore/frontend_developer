import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCommunity } from '../hooks/useCommunity';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import type { CommunityPost } from '../services/communityService';
export default function Community() {
  const { user } = useAuth();
  // Reset form/mutation state when the account changes.
  return (
    <CommunityContent key={user?.uid ?? 'guest'} uid={user?.uid ?? null} />
  );
}
function CommunityContent({ uid }: { uid: string | null }) {
  const { query, save, remove } = useCommunity(uid);
  const [editing, setEditing] = useState<number | undefined>();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<number | null>(null);
  const pending = save.isPending || remove.isPending;
  const posts = query.data ?? [];
  const pages = Math.max(1, Math.ceil(posts.length / 6));
  const currentPage = Math.min(page, pages);
  function reset() {
    setEditing(undefined);
    setTitle('');
    setBody('');
  }
  function edit(post: CommunityPost) {
    setEditing(post.id);
    setTitle(post.title);
    setBody(post.body);
    save.reset();
    remove.reset();
    document.getElementById('story-title')?.focus();
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    save.mutate(
      { id: editing, input: { title, body } },
      {
        onSuccess: () => {
          reset();
          setPage(1);
        },
      },
    );
  }
  return (
    <section className="container listing-page">
      <div className="page-intro">
        <span className="eyebrow">COMMUNITY SANDBOX</span>
        <h1>
          Try a <em>new story.</em>
        </h1>
        <p>
          Practice publishing with sample stories. Changes are private to your
          current account in this browser session and reset on refresh.
        </p>
      </div>
      {uid ? (
        <form className="story-form" onSubmit={submit} aria-busy={pending}>
          <h2>{editing ? 'Edit story' : 'Write a story'}</h2>
          <label htmlFor="story-title">Title</label>
          <input
            id="story-title"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={pending}
          />
          <label htmlFor="story-body">Story</label>
          <textarea
            id="story-body"
            required
            maxLength={10000}
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={pending}
          />
          <div className="story-actions">
            <button className="button button-dark" disabled={pending}>
              {save.isPending
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Publish story'}
            </button>
            {editing && (
              <button
                className="button button-outline"
                type="button"
                disabled={pending}
                onClick={reset}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      ) : (
        <p>
          <Link
            className="text-link"
            to="/login"
            state={{ from: '/community' }}
          >
            Sign in
          </Link>{' '}
          to create, edit, and delete sample stories.
        </p>
      )}
      {(save.error || remove.error) && (
        <p className="form-error" role="alert">
          {(save.error || remove.error)?.message}
        </p>
      )}
      <div className="results-bar">
        <span role="status">
          {query.isFetching ? 'Updating stories…' : posts.length + ' stories'}
        </span>
        <button
          className="clear-button"
          disabled={query.isFetching || pending}
          onClick={() => void query.refetch()}
        >
          Refresh stories
        </button>
      </div>
      {query.isPending ? (
        <LoadingState />
      ) : query.error ? (
        <ErrorState message={query.error.message} />
      ) : !posts.length ? (
        <EmptyState message="Publish the first story." />
      ) : (
        <div className="community-grid">
          {posts.slice((currentPage - 1) * 6, currentPage * 6).map((post) => (
            <article className="community-card" key={post.id}>
              <span className="eyebrow">STORY {post.id}</span>
              <h2>{post.title}</h2>
              <p>{post.body}</p>
              {uid && (
                <div className="story-actions">
                  <button
                    type="button"
                    className="clear-button"
                    disabled={pending}
                    onClick={() => edit(post)}
                  >
                    Edit
                  </button>
                  {deleting === post.id ? (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        className="delete-button"
                        onClick={() =>
                          remove.mutate(post.id, {
                            onSuccess: () => {
                              setDeleting(null);
                              if (editing === post.id) reset();
                            },
                          })
                        }
                      >
                        Confirm delete
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className="clear-button"
                        onClick={() => setDeleting(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="delete-button"
                      disabled={pending}
                      onClick={() => setDeleting(post.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {pages > 1 && (
        <nav className="pagination" aria-label="Community pages">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pages}
          </span>
          <button
            disabled={currentPage === pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
