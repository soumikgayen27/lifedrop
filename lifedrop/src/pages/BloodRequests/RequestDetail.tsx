import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../contexts/AuthContext';
import { fmtDate, timeAgo } from '../../utils/format';
import { BloodBadge, Disclaimer, EmptyState, ErrorState, PageLoader, PriorityBadge, StatusBadge } from '../../components/common/ui';
import type { PublicRequest } from '../../types';

export default function RequestDetail() {
  const { id } = useParams();
  const { session } = useAuth();
  const { data, loading, error, reload } = useAsync(async () => {
    const { data, error } = await supabase.from('public_blood_requests').select('*').eq('id', id!).maybeSingle();
    if (error) throw new Error(error.message);
    return data as PublicRequest | null;
  }, [id]);

  const rows: [string, string][] = data ? [
    ['Request ID', data.request_code], ['Hospital', data.hospital_name], ['Location', `${data.city}, ${data.state}`],
    ['Units required', String(data.units)], ['Required by', fmtDate(data.required_date)], ['Posted', timeAgo(data.created_at)],
  ] : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link to="/requests" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-brand"><ArrowLeft size={14} /> All requests</Link>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data ? <EmptyState title="Request not found" text="It may have been cancelled or removed." />
        : (
          <div className="card space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2"><BloodBadge group={data.blood_group} /><PriorityBadge priority={data.priority} /><StatusBadge status={data.status} /></div>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {rows.map(([k, v]) => <div key={k}><dt className="text-xs text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
            {data.message && <p className="rounded-md bg-surface p-3 text-sm">{data.message}</p>}
            <div className="rounded-md border border-line p-3 text-sm">
              <p className="font-medium">Can you help?</p>
              <p className="mt-1 text-muted">Matching available donors receive this request in their LifeDrop notifications, where they can express interest. Contact details are shared only through that process.</p>
              {!session && <p className="mt-2"><Link to="/register" className="font-medium text-brand">Register as a donor</Link> or <Link to="/login" className="font-medium text-brand">log in</Link> to receive requests.</p>}
            </div>
            <Disclaimer />
          </div>
        )}
    </div>
  );
}
