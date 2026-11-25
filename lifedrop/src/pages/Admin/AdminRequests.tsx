import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { BLOOD_GROUPS, PRIORITIES, REQUEST_STATUSES } from '../../lib/constants';
import { cap, fmtDate } from '../../utils/format';
import { BloodBadge, EmptyState, ErrorState, PageHead, PageLoader, Pagination, PriorityBadge, StatusBadge } from '../../components/common/ui';
import { Table, useAdminList } from './helpers';

interface R { id: string; request_code: string; patient_name: string; blood_group: string; hospital_name: string; city: string; units: number; priority: string; status: string; required_date: string; contact_person: string; contact_number: string }

export default function AdminRequests() {
  const [f, setF] = useState({ search: '', blood_group: '', priority: '', status: '' }); const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAdminList<R>('/admin/requests', { ...f, search: q }, page);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => { setF({ ...f, [k]: e.target.value }); setPage(1); };

  const update = async (id: string, status: string, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return;
    try { await api(`/admin/requests/${id}`, { method: 'PATCH', body: { status } }); toast.success('Request updated'); reload(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="max-w-6xl">
      <PageHead title="Blood requests" />
      <form className="card mb-3 grid gap-2 p-3 sm:grid-cols-5" onSubmit={(e) => { e.preventDefault(); setQ(f.search); setPage(1); }}>
        <input className="input" placeholder="ID, hospital or city" value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} aria-label="Search requests" />
        <select className="input" value={f.blood_group} onChange={set('blood_group')} aria-label="Blood group"><option value="">All groups</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
        <select className="input" value={f.priority} onChange={set('priority')} aria-label="Priority"><option value="">Any priority</option>{PRIORITIES.map((p) => <option key={p} value={p}>{cap(p)}</option>)}</select>
        <select className="input" value={f.status} onChange={set('status')} aria-label="Status"><option value="">Any status</option>{REQUEST_STATUSES.map((s) => <option key={s} value={s}>{cap(s)}</option>)}</select>
        <button className="btn btn-outline">Search</button>
      </form>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState title="No requests found" /> : (<>
        <Table head={['Request', 'Blood', 'Hospital', 'Needed', 'Priority', 'Status', 'Actions']}>
          {data.items.map((r) => (
            <tr key={r.id}>
              <td className="td"><span className="font-medium">{r.request_code}</span><span className="block text-xs text-muted">{r.patient_name} · {r.contact_person} {r.contact_number}</span></td>
              <td className="td"><BloodBadge group={r.blood_group} /></td>
              <td className="td">{r.hospital_name}<span className="block text-xs text-muted">{r.city} · {r.units} unit{r.units > 1 ? 's' : ''}</span></td>
              <td className="td">{fmtDate(r.required_date)}</td>
              <td className="td"><PriorityBadge priority={r.priority} /></td>
              <td className="td"><StatusBadge status={r.status} /></td>
              <td className="td">
                <select className="input !w-auto !py-1 text-xs" value={r.status} aria-label={`Status of ${r.request_code}`}
                  onChange={(e) => update(r.id, e.target.value, e.target.value === 'removed' ? `Remove ${r.request_code} as fraudulent/inappropriate?` : undefined)}>
                  {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s === 'removed' ? 'Removed (fraud)' : cap(s)}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} total={data.total} pageSize={data.pageSize} onChange={setPage} />
      </>)}
    </div>
  );
}
