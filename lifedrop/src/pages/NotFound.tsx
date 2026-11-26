import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow"><Droplet size={30} fill="currentColor" /></span>
      <p className="mt-6 font-display text-6xl font-extrabold text-navy-900">404</p>
      <h1 className="mt-2 font-display text-xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-primary mt-6">Back to home</Link>
    </div>
  );
}
