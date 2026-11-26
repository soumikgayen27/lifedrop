import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PAGE_SIZE } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { useAsync } from '../../hooks/useAsync';
import { likeEscape } from '../../utils/format';
import RequestCard from '../../components/common/RequestCard';
import RequestFilters, { emptyReqFilter, ReqFilter } from '../../components/common/RequestFilters';
import { Disclaimer, EmptyState, ErrorState, PageHero, Pagination, Spinner } from '../../components/common/ui';
import type { PublicRequest } from '../../types';

export default function BloodRequests() {
  const [f, setF] = useState<ReqFilter>(emptyReqFilter);
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(async () => {
    let q = supabase.from('public_blood_requests').select('*', { count: 'exact' });
    if (f.blood_group) q = q.eq('blood_group', f.blood_group);
    if (f.city.trim()) q = q.ilike('city', `%${likeEscape(f.city)}%`);
    if (f.priority) q = q.eq('priority', f.priority);
    if (f.status) q = q.eq('status', f.status);
    const from = (page - 1) * PAGE_SIZE;
    const { data, count, error } = await q.order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    return { items: (data ?? []) as PublicRequest[], total: count ?? 0 };
  }, [f.blood_group, f.city, f.priority, f.status, page]);

  return (
    <>
      <PageHero eyebrow="Live requests" title="Blood requests" subtitle="Recent public requests. Patient names and contact numbers are never shown." action={<Link to="/request-blood" className="btn btn-primary"><Plus size={16} /> Request blood</Link>} />
      <div className="mx-auto max-w-6xl px-4 py-8">
      <RequestFilters value={f} onChange={(v) => { setF(v); setPage(1); }} statuses={['open', 'fulfilled']} />
      {loading ? <div className="flex justify-center py-16"><Spinner size={24} /></div>
        : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.items.length ? <EmptyState title="No requests match" text="Try changing the filters." />
        : (<>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((r) => <RequestCard key={r.id} r={r} />)}</div>
            <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>)}
      <Disclaimer className="mt-8" />
      </div>
    </>
  );
}
