import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { BLOOD_GROUPS, PAGE_SIZE, STATES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { useAsync } from '../../hooks/useAsync';
import { likeEscape } from '../../utils/format';
import DonorCard from '../../components/common/DonorCard';
import { Disclaimer, EmptyState, ErrorState, PageHero, Pagination, Spinner } from '../../components/common/ui';
import type { PublicDonor } from '../../types';

const KEYS = ['blood_group', 'state', 'city', 'area', 'pin_code', 'availability'] as const;
type Filters = Record<(typeof KEYS)[number], string>;

export default function Donors() {
  const [params, setParams] = useSearchParams();
  const current = Object.fromEntries(KEYS.map((k) => [k, params.get(k) ?? ''])) as Filters;
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [form, setForm] = useState<Filters>(current);
  useEffect(() => { setForm(current); /* eslint-disable-next-line */ }, [params.toString()]);

  const { data, loading, error, reload } = useAsync(async () => {
    let q = supabase.from('public_donors').select('*', { count: 'exact' });
    if (current.blood_group) q = q.eq('blood_group', current.blood_group);
    if (current.state) q = q.ilike('state', likeEscape(current.state));
    if (current.city) q = q.ilike('city', `%${likeEscape(current.city)}%`);
    if (current.area) q = q.ilike('area', `%${likeEscape(current.area)}%`);
    if (current.pin_code) q = q.like('pin_code', `${likeEscape(current.pin_code)}%`);
    if (current.availability) q = q.eq('availability', current.availability);
    const from = (page - 1) * PAGE_SIZE;
    const { data, count, error } = await q.order('availability', { ascending: true }).order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    return { items: (data ?? []) as PublicDonor[], total: count ?? 0 };
  }, [params.toString()]);

  const apply = (e?: FormEvent) => {
    e?.preventDefault();
    const p = new URLSearchParams();
    KEYS.forEach((k) => form[k].trim() && p.set(k, form[k].trim()));
    setParams(p);
  };
  const setPage = (n: number) => { const p = new URLSearchParams(params); p.set('page', String(n)); setParams(p); window.scrollTo({ top: 0 }); };
  const set = (k: keyof Filters) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const hasFilters = KEYS.some((k) => current[k]);

  return (
    <>
      <PageHero eyebrow="Donor search" title="Find blood donors" subtitle="Only donors who agreed to appear in public search are listed." />
      <div className="mx-auto max-w-6xl px-4 py-8">
      <form onSubmit={apply} className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4" role="search">
        <select className="input" aria-label="Blood group" value={form.blood_group} onChange={set('blood_group')}><option value="">Any blood group</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
        <select className="input" aria-label="State" value={form.state} onChange={set('state')}><option value="">Any state</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select>
        <input className="input" aria-label="City" placeholder="City" value={form.city} onChange={set('city')} />
        <input className="input" aria-label="Area" placeholder="Area / locality" value={form.area} onChange={set('area')} />
        <input className="input" aria-label="PIN code" placeholder="PIN code" inputMode="numeric" maxLength={6} value={form.pin_code} onChange={set('pin_code')} />
        <select className="input" aria-label="Availability" value={form.availability} onChange={set('availability')}>
          <option value="">Any availability</option><option value="available">Available</option><option value="unavailable">Temporarily unavailable</option>
        </select>
        <button className="btn btn-primary"><Search size={16} /> Search</button>
        <button type="button" className="btn btn-outline" disabled={!hasFilters && !KEYS.some((k) => form[k])} onClick={() => { setForm(Object.fromEntries(KEYS.map((k) => [k, ''])) as Filters); setParams({}); }}><X size={14} /> Clear filters</button>
      </form>

      {loading ? <div className="flex justify-center py-16"><Spinner size={24} /></div>
        : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.items.length ? <EmptyState title="No donors found" text={hasFilters ? 'Try removing a filter, searching a nearby city or checking the spelling. You can also post a blood request.' : 'No donors have joined yet. Be the first to register.'} />
        : (<>
            <p className="mb-3 text-sm font-medium text-muted">{data.total} donor{data.total !== 1 ? 's' : ''} found</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((d) => <DonorCard key={d.id} d={d} />)}</div>
            <Pagination page={page} total={data.total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>)}
      <Disclaimer className="mt-8" />
      </div>
    </>
  );
}
