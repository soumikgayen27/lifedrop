import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { ErrorState, PageHead, PageLoader } from '../../components/common/ui';

type Row = { name: string; total: number };
interface R { requestsPerMonth: Row[]; donorsByGroup: Row[]; requestsByStatus: Row[]; requestsByPriority: Row[]; topRequestCities: Row[]; topDonorCities: Row[] }

const Chart = ({ title, rows }: { title: string; rows: Row[] }) => (
  <section className="card p-4">
    <h2 className="mb-2 text-sm font-semibold">{title}</h2>
    {!rows.length || rows.every((r) => !r.total) ? <p className="py-8 text-center text-sm text-muted">No data yet.</p> : (
      <div className="h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={rows}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} /><XAxis dataKey="name" fontSize={11} /><YAxis allowDecimals={false} fontSize={11} /><Tooltip /><Bar dataKey="total" fill="#D92332" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>
    )}
  </section>
);
const List = ({ title, rows }: { title: string; rows: Row[] }) => (
  <section className="card p-4"><h2 className="mb-2 text-sm font-semibold">{title}</h2>
    {!rows.length ? <p className="text-sm text-muted">No data yet.</p> : <ol className="space-y-1 text-sm">{rows.map((r) => <li key={r.name} className="flex justify-between"><span>{r.name}</span><b>{r.total}</b></li>)}</ol>}
  </section>
);

export default function AdminReports() {
  const { data, loading, error, reload } = useAsync(() => api<R>('/admin/reports'), []);
  if (loading) return <PageLoader />;
  if (error || !data) return <ErrorState message={error ?? 'No data'} onRetry={reload} />;
  return (
    <div className="max-w-5xl">
      <PageHead title="Reports" subtitle="Computed from live data (last 6 months for the monthly chart)." />
      <div className="grid gap-4 md:grid-cols-2">
        <Chart title="Blood requests per month" rows={data.requestsPerMonth} />
        <Chart title="Active donors by blood group" rows={[...data.donorsByGroup].sort((a, b) => a.name.localeCompare(b.name))} />
        <Chart title="Requests by status" rows={data.requestsByStatus} />
        <Chart title="Requests by priority" rows={data.requestsByPriority} />
        <List title="Top cities by requests" rows={data.topRequestCities} />
        <List title="Top cities by donors" rows={data.topDonorCities} />
      </div>
    </div>
  );
}
