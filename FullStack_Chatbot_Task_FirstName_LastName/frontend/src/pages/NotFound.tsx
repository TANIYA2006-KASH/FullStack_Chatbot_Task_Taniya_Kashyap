import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="container notfound">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-primary">Back to home</Link>
    </main>
  );
}
