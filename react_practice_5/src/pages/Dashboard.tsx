import { Link } from 'react-router-dom';
import { useState } from 'react';
import { ErrorState, LoadingState } from '../components/States';
import { useAsync } from '../hooks/useAsync';
import { getAllPosts } from '../services/blogService';
import type { Post, PostStatus } from '../types/blog';
function breakdown(posts: Post[], getKey: (p: Post) => string) {
  const result = new Map<string, number>();
  posts.forEach((post) => {
    const key = getKey(post);
    result.set(key, (result.get(key) ?? 0) + 1);
  });
  return [...result].sort((a, b) => b[1] - a[1]);
}
export default function Dashboard() {
  const [status, setStatus] = useState('all');
  const { data, loading, error } = useAsync(
    (signal) => getAllPosts(signal),
    [],
  );
  const posts = (data ?? []).filter(
    (p) => status === 'all' || p.status === status,
  );
  const categories = breakdown(
    posts,
    (p) => p.category?.name ?? 'Uncategorized',
  );
  const statuses = breakdown(posts, (p) => p.status);
  const authors = new Set(posts.map((p) => p.author_info.id)).size;
  const published = posts.filter((p) => p.status === 'published').length;
  const tags = new Set(posts.flatMap((p) => p.tags.map((t) => t.id))).size;
  const max = Math.max(1, ...categories.map((c) => c[1]));
  return (
    <div className="container dashboard-page">
      <div className="page-intro">
        <span className="eyebrow">EDITORIAL OVERVIEW</span>
        <h1>
          Content <em>dashboard.</em>
        </h1>
        <p>A simple overview of the stories in our journal.</p>
      </div>
      <div className="dashboard-filter">
        <label htmlFor="dashboard-status">Filter statistics by status</label>
        <select
          id="dashboard-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          <div className="stat-grid">
            <div>
              <span>Total stories</span>
              <strong>{posts.length}</strong>
              <small>In selected view</small>
            </div>
            <div>
              <span>Published</span>
              <strong>{published}</strong>
              <small>Available to readers</small>
            </div>
            <div>
              <span>Active authors</span>
              <strong>{authors}</strong>
              <small>Unique contributors</small>
            </div>
            <div>
              <span>Topics tagged</span>
              <strong>{tags}</strong>
              <small>Distinct tags</small>
            </div>
          </div>
          <div className="breakdown-grid">
            <section className="breakdown-card">
              <h2>By category</h2>
              <p>How stories are distributed across topics.</p>
              {categories.length ? (
                categories.map(([name, count]) => (
                  <div className="breakdown-row" key={name}>
                    <div className="breakdown-label">
                      <span>{name}</span>
                      <span>{count}</span>
                    </div>
                    <div className="bar-track">
                      <div style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p>No data matches this filter.</p>
              )}
            </section>
            <section className="breakdown-card">
              <h2>By status</h2>
              <p>Publishing lifecycle across the journal.</p>
              {statuses.length ? (
                statuses.map(([name, count]) => (
                  <div className="status-row" key={name}>
                    <span
                      className={`status-bullet status-${name as PostStatus}`}
                    />
                    <span className="capitalize">{name}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              ) : (
                <p>No matching stories.</p>
              )}
              <div className="dashboard-link">
                <Link
                  to={`/posts${status === 'all' ? '' : `?status=${status}`}`}
                >
                  Explore related stories →
                </Link>
              </div>
            </section>
          </div>
          <section className="dashboard-recent">
            <div className="section-heading">
              <div>
                <span className="eyebrow">RECENT ACTIVITY</span>
                <h2>Latest content</h2>
              </div>
              <Link to="/posts" className="text-link">
                All posts ↗
              </Link>
            </div>
            {[...posts]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .slice(0, 5)
              .map((p) => (
                <Link className="recent-row" key={p.id} to={`/posts/${p.id}`}>
                  <strong>{p.title}</strong>
                  <span>{p.category?.name ?? 'Uncategorized'}</span>
                  <span className="capitalize">{p.status}</span>
                  <span>→</span>
                </Link>
              ))}
          </section>
        </>
      )}
    </div>
  );
}
