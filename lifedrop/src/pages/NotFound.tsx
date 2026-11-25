import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <h1 className="mt-2 text-lg font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-4">Back to home</Link>
    </div>
  );
}
