import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, ChevronDown, Pencil, Plus, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, must } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { fmtDate } from '../../utils/format';
import RequestFilters, { emptyReqFilter, ReqFilter } from '../../components/common/RequestFilters';
import { BloodBadge, EmptyState, ErrorState, PageHead, PageLoader, PriorityBadge, Spinner, StatusBadge } from '../../components/common/ui';
import type { BloodRequest, DonorResponse } from '../../types';

function Responses({ id }: { id: string }) {
  const { data, loading, error } = useAsync(async () => must(await supabase.rpc('get_request_responses', { p_request_id: id })) as DonorResponse[], [id]);
  if (loading) return <div className="py-2"><Spinner /></div>;
  if (error) return <p className="py-2 text-sm text-brand">{error}</p>;
  if (!data?.length) return <p className="py-2 text-sm text-muted">No donor has responded yet.</p>;
  return (
    <ul className="divide-y divide-line">
      {data.map((r) => (
        <li key={r.donor_user_id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
          <span><b>{r.full_name}</b> · {r.blood_group} · {r.city}<span className="block text-xs text-muted">{fmtDate(r.responded_at)}</span></span>
          <span className="flex items-center gap-2"><StatusBadge status={r.response} />{r.phone && <a className="font-medium text-brand" href={`tel:+91${r.phone}`}>+91 {r.phone}</a>}</span>
        </li>
      ))}
      <li className="pt-2 text-xs text-muted">Interest is not confirmation of eligibility. The hospital must confirm that the donor can donate.</li>
    </ul>
  );
}

export default function MyRequests() {
  const { session } = useAuth();
  const [f, setF] = useState<ReqFilter>(emptyReqFilter);
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(async () =>
    must(await supabase.from('blood_requests').select('*').eq('requester_id', session!.user.id).order('created_at', { ascending: false })) as BloodRequest[], [session?.user.id]);

  const setStatus = async (r: BloodRequest, status: 'fulfilled' | 'cancelled') => {
    if (status === 'cancelled' && !window.confirm(`Cancel request ${r.request_code}? Donors will no longer see it as open.`)) return;
    const { error } = await supabase.from('blood_requests').update({ status }).eq('id', r.id);
    if (error) return toast.error(error.message);
    toast.success(status === 'fulfilled' ? 'Marked as fulfilled' : 'Request cancelled');
    reload();
  };

  const rows = (data ?? []).filter((r) =>
    (!f.blood_group || r.blood_group === f.blood_group) && (!f.priority || r.priority === f.priority) &&
    (!f.status || r.status === f.status) && (!f.city.trim() || r.city.toLowerCase().includes(f.city.trim().toLowerCase())));

  return (
    <div className="max-w-4xl">
      <PageHead title="My blood requests" action={<Link to="/request-blood" className="btn btn-primary btn-sm"><Plus size={14} /> New request</Link>} />
      <RequestFilters value={f} onChange={setF} statuses={['open', 'fulfilled', 'cancelled']} />
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} />
        : !rows.length ? <EmptyState title={data?.length ? 'No requests match the filters' : 'No requests yet'} text={data?.length ? undefined : 'Requests you post appear here with donor responses.'} />
        : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2"><BloodBadge group={r.blood_group} /><div><p className="text-sm font-semibold">{r.hospital_name}</p><p className="text-xs text-muted">{r.request_code} · {r.city} · {r.units} unit{r.units > 1 ? 's' : ''} · {fmtDate(r.required_date)}</p></div></div>
                  <div className="flex items-center gap-1.5"><PriorityBadge priority={r.priority} /><StatusBadge status={r.status} /></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn btn-outline btn-sm" onClick={() => setOpenId(openId === r.id ? null : r.id)} aria-expanded={openId === r.id}>Donor responses <ChevronDown size={14} /></button>
                  {r.status === 'open' && <>
                    <Link to={`/dashboard/requests/${r.id}/edit`} className="btn btn-outline btn-sm"><Pencil size={13} /> Edit</Link>
                    <button className="btn btn-outline btn-sm" onClick={() => setStatus(r, 'fulfilled')}><CheckCheck size={13} /> Mark fulfilled</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setStatus(r, 'cancelled')}><XCircle size={13} /> Cancel</button>
                  </>}
                </div>
                {openId === r.id && <div className="mt-3 border-t border-line pt-2"><Responses id={r.id} /></div>}
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
