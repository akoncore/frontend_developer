import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { usePosts } from '../hooks/usePosts';
import type { PostFilters } from '../types/blog';
const categories = [
  'all',
  'technology',
  'design',
  'development',
  'culture',
  'productivity',
  'business',
];
export default function Posts() {
  const [params, setParams] = useSearchParams();
  const rawPage = Number(params.get('page'));
  const filters: PostFilters = {
    search: params.get('search') ?? '',
    category: params.get('category') ?? 'all',
    status: params.get('status') ?? 'all',
    sort: params.get('sort') ?? 'newest',
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    limit: 9,
  };
  const { data, loading, error } = usePosts(filters);
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (!value || value === 'all' || (name === 'sort' && value === 'newest'))
        next.delete(name);
      else next.set(name, value);
      if (name !== 'page') next.delete('page');
      return next;
    });
  }
  const totalPages = Math.ceil((data?.count ?? 0) / filters.limit);
  return (
    <div className="container listing-page">
      <div className="page-intro">
        <span className="eyebrow">THE JOURNAL</span>
        <h1>
          Explore the <em>stories.</em>
        </h1>
        <p>Find ideas, insights, and inspiration across every topic.</p>
      </div>
      <div className="filter-panel">
        <label className="search-field">
          <span className="sr-only">Search stories</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search stories, authors, topics…"
          />
        </label>
        <label>
          Category
          <select
            value={filters.category}
            onChange={(e) => update('category', e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all'
                  ? 'All categories'
                  : c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </label>
        <label>
          Sort by
          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>
      <div className="results-bar">
        <span>
          {loading ? 'Finding stories…' : `${data?.count ?? 0} stories found`}
        </span>
        <button onClick={() => setParams({})} className="clear-button">
          Clear filters
        </button>
      </div>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : !data?.results.length ? (
        <EmptyState message="Try a different search, status, or category." />
      ) : (
        <div className="card-grid">
          {data.results.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              index={(filters.page - 1) * filters.limit + i}
            />
          ))}
        </div>
      )}
      {!loading && !error && totalPages > 1 && (
        <nav className="pagination" aria-label="Post pages">
          <button
            disabled={filters.page === 1}
            onClick={() => update('page', String(filters.page - 1))}
          >
            ← Previous
          </button>
          <span>
            Page {filters.page} of {totalPages}
          </span>
          <button
            disabled={filters.page >= totalPages}
            onClick={() => update('page', String(filters.page + 1))}
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}
