import { Link } from 'react-router-dom';
import type { Post } from '../types/blog';
import ImageSlot from './ImageSlot';
export default function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return <article className="post-card"><Link to={`/posts/${post.id}`} aria-label={`Read ${post.title}`}><ImageSlot cover={post.cover} label={`IMAGE ${String(index + 1).padStart(2, '0')}`} /></Link>
    <div className="post-card__content"><div className="meta-line"><span>{post.category?.name ?? 'Uncategorized'}</span><span className="meta-dot">·</span><span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
    <h3><Link to={`/posts/${post.id}`}>{post.title}</Link></h3><p>{post.body.slice(0, 130)}…</p><div className="post-card__bottom"><span>By {post.author_info.first_name}</span><Link to={`/posts/${post.id}`}>Read story <span aria-hidden="true">→</span></Link></div></div>
  </article>;
}
