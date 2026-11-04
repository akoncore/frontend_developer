import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="container not-found">
      <span className="eyebrow">PAGE NOT FOUND</span>
      <div className="error-number">404</div>
      <h1>Looks like you've wandered off.</h1>
      <p>This page doesn't exist. Let's get you back to the good stories.</p>
      <Link to="/" className="button button-dark">
        Return home ↗
      </Link>
    </div>
  );
}
