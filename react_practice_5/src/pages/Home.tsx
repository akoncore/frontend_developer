import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getPosts } from '../services/blogService';
import PostCard from '../components/PostCard';
import ImageSlot from '../components/ImageSlot';
import { ErrorState, LoadingState } from '../components/States';
export default function Home() {
  const { data, loading, error } = useAsync(
    (signal) =>
      getPosts(
        {
          search: '',
          category: 'all',
          status: 'published',
          sort: 'newest',
          page: 1,
          limit: 3,
        },
        signal,
      ),
    [],
  );
  return (
    <>
      <section className="hero container">
        <div className="hero__copy">
          <span className="eyebrow">
            <span className="eyebrow-line" /> THE SPACE FOR IDEAS
          </span>
          <h1>
            Good stories.
            <br />
            <em>Fresh perspectives.</em>
          </h1>
          <p>
            A place to explore technology, design, culture, and everything in
            between. Take a moment. Find your next great read.
          </p>
          <Link to="/posts" className="button button-dark">
            Explore stories <span aria-hidden="true">↗</span>
          </Link>
          <div className="hero-small">
            INDEPENDENT THOUGHTS. ENDLESS CURIOSITY.
          </div>
        </div>
        <div className="hero__visual">
          <ImageSlot variant="hero" label="YOUR FEATURED IMAGE" />
          <div className="hero-picture-note">001 — A NEW PERSPECTIVE</div>
        </div>
      </section>
      <section className="feature-band">
        <div className="container feature-band__inner">
          <span>THINK</span>
          <span>CREATE</span>
          <span>DISCOVER</span>
          <span>SHARE</span>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CURATED FOR YOU</span>
            <h2>
              Latest <em>stories</em>
            </h2>
          </div>
          <Link to="/posts" className="text-link">
            View all articles <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="card-grid">
            {data?.results.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </section>
      <section className="newsletter">
        <div className="container newsletter-inner">
          <div>
            <span className="eyebrow">KEEP EXPLORING</span>
            <h2>
              Ideas are meant
              <br />
              to be <em>shared.</em>
            </h2>
          </div>
          <div>
            <p>
              Explore a growing collection of stories from curious people who
              love to learn and create.
            </p>
            <Link to="/posts" className="button button-light">
              Explore the journal ↗
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
