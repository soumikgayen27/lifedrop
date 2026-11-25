import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, ClipboardCheck, ClipboardList, Clock, Droplets, Users } from 'lucide-react';
import { api } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { ErrorState, PageHead, PageLoader, Stat } from '../../components/common/ui';

interface S { users: number; donors: number; availableDonors: number; requests: number; pendingRequests: number; completedRequests: number; newMessages: number; requestsByGroup: { group: string; total: number }[] }

export default function AdminOverview() {
  const { data, loading, error, reload } = useAsync(() => api<S>('/admin/stats'), []);
  if (loading) return <PageLoader />;
  if (error || !data) return <ErrorState message={error ?? 'No data'} onRetry={reload} />;
  return (
    <div className="max-w-5xl">
      <PageHead title="Admin overview" subtitle="Live figures from the database." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Total users" value={data.users} icon={<Users size={18} />} />
        <Stat label="Total donors" value={data.donors} icon={<Droplets size={18} />} />
        <Stat label="Available donors" value={data.availableDonors} icon={<Activity size={18} />} />
        <Stat label="Total blood requests" value={data.requests} icon={<ClipboardList size={18} />} />
        <Stat label="Pending (open) requests" value={data.pendingRequests} icon={<Clock size={18} />} />
        <Stat label="Completed requests" value={data.completedRequests} icon={<ClipboardCheck size={18} />} />
      </div>
      <section className="card mt-4 p-4">
        <h2 className="mb-2 text-sm font-semibold">Requests by blood group</h2>
        {data.requestsByGroup.length === 0 ? <p className="py-8 text-center text-sm text-muted">No requests yet.</p> : (
          <div className="h-56"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...data.requestsByGroup].sort((a, b) => a.group.localeCompare(b.group))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} /><XAxis dataKey="group" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
              <Bar dataKey="total" fill="#D92332" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        )}
      </section>
      {data.newMessages > 0 && <p className="mt-3 text-sm text-muted">{data.newMessages} unresolved contact message{data.newMessages > 1 ? 's' : ''}.</p>}
    </div>
  );
}
