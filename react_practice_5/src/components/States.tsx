import { Link } from 'react-router-dom';
export function LoadingState({ text = 'Loading stories…' }: { text?: string }) { return <div className="state-message" role="status"><div className="loading-bar" />{text}</div> }
export function ErrorState({ message }: { message: string }) { return <div className="state-message state-error" role="alert"><h3>Something went wrong</h3><p>{message}</p><button onClick={() => window.location.reload()} className="button button-dark">Try again</button></div> }
export function EmptyState({ message = 'No stories found.' }: { message?: string }) { return <div className="state-message"><h3>Nothing here yet</h3><p>{message}</p><Link to="/posts" className="text-link">Browse all stories →</Link></div> }
