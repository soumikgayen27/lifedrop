import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { fmtDate } from '../../utils/format';
import { EmptyState, ErrorState, PageHead, PageLoader, Pagination, StatusBadge } from '../../components/common/ui';
import { Table, useAdminList } from './helpers';

interface U { id: string; full_name: string; email: string; phone: string | null; role: string; is_suspended: boolean; created_at: string }

export default function AdminUsers() {
  const [search, setSearch] = useState(''); const [q, setQ] = useState('');
  const [role, setRole] = useState(''); const [susp, setSusp] = useState(''); const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAdminList<U>('/admin/users', { search: q, role, suspended: susp }, page);

  const toggle = async (u: U) => {
    const next = !u.is_suspended;
    if (!window.confirm(`${next ? 'Suspend' : 'Reinstate'} ${u.full_name}?`)) return;
    try { await api(`/admin/users/${u.id}/suspend`, { method: 'PATCH', body: { suspended: next } }); toast.success(next ? 'Account suspended' : 'Account reinstated'); reload(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="max-w-6xl">
      <PageHead title="Manage users" />
      <form className="card mb-3 grid gap-2 p-3 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1); }}>
        <input className="input sm:col-span-2" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
        <select className="input" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="Role"><option value="">All roles</option><option value="donor">Donors</option><option value="user">Basic users</option></select>
        <select className="input" value={susp} onChange={(e) => { setSusp(e.target.value); setPage(1); }} aria-label="Status"><option value="">All accounts</option><option value="true">Suspended only</option></select>
      </form>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState title="No users found" /> : (<>
        <Table head={['Name', 'Email', 'Mobile', 'Type', 'Joined', 'Status', '']}>
          {data.items.map((u) => (
            <tr key={u.id}>
              <td className="td font-medium">{u.full_name}</td><td className="td">{u.email}</td><td className="td">{u.phone ?? '—'}</td>
              <td className="td capitalize">{u.role}</td><td className="td">{fmtDate(u.created_at)}</td>
              <td className="td"><StatusBadge status={u.is_suspended ? 'suspended' : 'active'} /></td>
              <td className="td text-right"><button className={`btn btn-sm ${u.is_suspended ? 'btn-outline' : 'btn-danger'}`} onClick={() => toggle(u)}>{u.is_suspended ? 'Reinstate' : 'Suspend'}</button></td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} total={data.total} pageSize={data.pageSize} onChange={setPage} />
      </>)}
    </div>
  );
}
