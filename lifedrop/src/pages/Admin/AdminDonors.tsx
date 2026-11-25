import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { BLOOD_GROUPS } from '../../lib/constants';
import { BloodBadge, EmptyState, ErrorState, PageHead, PageLoader, Pagination, StatusBadge } from '../../components/common/ui';
import { Table, useAdminList } from './helpers';

interface D { id: string; blood_group: string; city: string; state: string; area: string; pin_code: string; availability: string; show_in_public: boolean; is_verified: boolean; status: string; profiles: { full_name: string; email: string; phone: string | null } }

/** Used for both "Manage Donors" and "Donor Verification" (verification = pending-only view). */
export default function AdminDonors({ verification = false }: { verification?: boolean }) {
  const [search, setSearch] = useState(''); const [q, setQ] = useState('');
  const [bg, setBg] = useState(''); const [status, setStatus] = useState(verification ? 'active' : ''); const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAdminList<D>('/admin/donors', { search: q, blood_group: bg, status, ...(verification ? { verified: 'false' } : {}) }, page);

  const patch = async (id: string, body: object, msg: string, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return;
    try { await api(`/admin/donors/${id}`, { method: 'PATCH', body }); toast.success(msg); reload(); } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="max-w-6xl">
      <PageHead title={verification ? 'Donor verification' : 'Manage donors'} subtitle={verification ? 'Review unverified donors. Verification confirms the profile looks genuine – not medical eligibility.' : undefined} />
      <form className="card mb-3 grid gap-2 p-3 sm:grid-cols-4" onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1); }}>
        <input className="input" placeholder="City or PIN code" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search donors" />
        <select className="input" value={bg} onChange={(e) => { setBg(e.target.value); setPage(1); }} aria-label="Blood group"><option value="">All groups</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
        <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Listing status"><option value="">All listings</option><option value="active">Active</option><option value="removed">Removed</option></select>
        <button className="btn btn-outline">Search</button>
      </form>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} /> : !data?.items.length ? <EmptyState title={verification ? 'No donors awaiting verification' : 'No donors found'} /> : (<>
        <Table head={['Donor', 'Blood', 'Location', 'Availability', 'Public', 'Verified', 'Actions']}>
          {data.items.map((d) => (
            <tr key={d.id}>
              <td className="td"><span className="font-medium">{d.profiles.full_name}</span><span className="block text-xs text-muted">{d.profiles.email}</span></td>
              <td className="td"><BloodBadge group={d.blood_group} /></td>
              <td className="td">{d.area}, {d.city}<span className="block text-xs text-muted">{d.state} – {d.pin_code}</span></td>
              <td className="td"><StatusBadge status={d.availability} /></td>
              <td className="td">{d.show_in_public ? 'Yes' : 'No'}</td>
              <td className="td">{d.is_verified ? <BadgeCheck size={16} className="text-ok" aria-label="Verified" /> : '—'}</td>
              <td className="td"><div className="flex flex-wrap gap-1.5">
                <button className="btn btn-outline btn-sm" onClick={() => patch(d.id, { is_verified: !d.is_verified }, d.is_verified ? 'Verification removed' : 'Donor verified')}>{d.is_verified ? 'Unverify' : 'Verify'}</button>
                <button className="btn btn-outline btn-sm" onClick={() => patch(d.id, { availability: d.availability === 'available' ? 'unavailable' : 'available' }, 'Availability updated')}>{d.availability === 'available' ? 'Set unavailable' : 'Set available'}</button>
                {d.status === 'active'
                  ? <button className="btn btn-danger btn-sm" onClick={() => patch(d.id, { status: 'removed' }, 'Listing removed', 'Remove this donor listing from the platform?')}>Remove</button>
                  : <button className="btn btn-outline btn-sm" onClick={() => patch(d.id, { status: 'active' }, 'Listing restored')}>Restore</button>}
              </div></td>
            </tr>
          ))}
        </Table>
        <Pagination page={page} total={data.total} pageSize={data.pageSize} onChange={setPage} />
      </>)}
    </div>
  );
}
