import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { fmtDate } from '../../utils/format';
import { EmptyState, ErrorState, PageHead, PageLoader, Pagination, StatusBadge } from '../../components/common/ui';
import { useAdminList } from './helpers';

interface M { id: string; name: string; email: string; subject: string; message: string; status: 'new' | 'resolved'; created_at: string }

export default function AdminMessages() {
  const [status, setStatus] = useState(''); const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAdminList<M>('/admin/messages', { status }, page);
  const set = async (m: M, next: 'new' | 'resolved') => {
    try { await api(`/admin/messages/${m.id}`, { method: 'PATCH', body: { status: next } }); toast.success(next === 'resolved' ? 'Marked resolved' : 'Reopened'); reload(); } catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="max-w-4xl">
      <PageHead title="Contact messages" action={<select className="input !w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter"><option value="">All</option><option value="new">New</option><option value="resolved">Resolved</option></select>} />
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState title="No messages" /> : (<>
        <ul className="space-y-2">{data.items.map((m) => (
          <li key={m.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="text-sm font-semibold">{m.subject}</p><p className="text-xs text-muted">{m.name} · <a className="text-brand" href={`mailto:${m.email}`}>{m.email}</a> · {fmtDate(m.created_at)}</p></div>
              <StatusBadge status={m.status} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
            <div className="mt-3">{m.status === 'new' ? <button className="btn btn-primary btn-sm" onClick={() => set(m, 'resolved')}>Mark resolved</button> : <button className="btn btn-outline btn-sm" onClick={() => set(m, 'new')}>Reopen</button>}</div>
          </li>
        ))}</ul>
        <Pagination page={page} total={data.total} pageSize={data.pageSize} onChange={setPage} />
      </>)}
    </div>
  );
}
