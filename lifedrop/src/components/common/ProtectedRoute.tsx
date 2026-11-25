import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from './ui';

export default function ProtectedRoute({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { session, profile, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (profile?.is_suspended) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Account suspended</h1>
        <p className="mt-2 text-sm text-muted">This account has been suspended by an administrator. Contact us if you think this is a mistake.</p>
        <button className="btn btn-outline mt-4" onClick={signOut}>Log out</button>
      </div>
    );
  }
  if (admin && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
