import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <Link to="/" className="wordmark">
            folio<span>.</span>
          </Link>
          <p>Stories for the curious mind.</p>
        </div>
        <p>Built with React · Inspired by the blog-api project</p>
        <p>© {new Date().getFullYear()} Folio</p>
      </div>
    </footer>
  );
}
