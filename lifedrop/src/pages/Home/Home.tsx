import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, HeartHandshake, Search, UserPlus, Users, Droplets, ClipboardList, Siren } from 'lucide-react';
import { BLOOD_GROUPS, STATES } from '../../lib/constants';
import { supabase, must } from '../../lib/supabase';
import { useAsync } from '../../hooks/useAsync';
import RequestCard from '../../components/common/RequestCard';
import { Disclaimer, EmptyState, ErrorState, Spinner, Stat } from '../../components/common/ui';
import type { PublicRequest } from '../../types';

function HeroVisual() {
  return (
    <svg viewBox="0 0 240 200" className="mx-auto w-full max-w-[260px]" role="img" aria-label="Blood drop with a heartbeat line">
      <rect x="1" y="1" width="238" height="198" rx="10" fill="#fff" stroke="#E5E7EB" />
      <path d="M120 28c0 0-42 46-42 76a42 42 0 0 0 84 0c0-30-42-76-42-76z" fill="#D92332" />
      <path d="M92 108h20l8-16 10 28 8-12h14" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 170h50l10-18 14 34 12-24 10 8h112" fill="none" stroke="#D92332" strokeOpacity=".35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuickSearch() {
  const nav = useNavigate();
  const [f, setF] = useState({ blood_group: '', state: '', city: '', pin_code: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => v.trim() && p.set(k, v.trim()));
    nav(`/donors?${p.toString()}`);
  };
  return (
    <form onSubmit={submit} className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Quick donor search">
      <select className="input" aria-label="Blood group" value={f.blood_group} onChange={set('blood_group')}>
        <option value="">Blood group</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
      </select>
      <select className="input" aria-label="State" value={f.state} onChange={set('state')}>
        <option value="">State</option>{STATES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <input className="input" aria-label="City" placeholder="City" value={f.city} onChange={set('city')} />
      <input className="input" aria-label="PIN code" placeholder="PIN code" inputMode="numeric" maxLength={6} value={f.pin_code} onChange={set('pin_code')} />
      <button className="btn btn-primary"><Search size={16} /> Search</button>
    </form>
  );
}

export default function Home() {
  const stats = useAsync(async () => must(await supabase.rpc('public_stats')) as { total_donors: number; available_donors: number; connections: number; blood_requests: number }, []);
  const latest = useAsync(async () => must(await supabase.from('public_blood_requests').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(6)) as PublicRequest[], []);
  const s = stats.data;
  const n = (v?: number) => (stats.loading ? <Spinner size={16} /> : s ? v ?? 0 : '—');

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-8 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Every Drop Can Save a Life.</h1>
            <p className="mt-3 max-w-xl text-muted">Find nearby blood donors, connect with generous people and help save lives when every second matters.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/donors" className="btn btn-primary">Find Blood Donors</Link>
              <Link to="/register" className="btn btn-outline">Become a Donor</Link>
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <section aria-labelledby="qs"><h2 id="qs" className="sr-only">Quick donor search</h2><QuickSearch /></section>

        <section aria-label="Platform statistics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Registered donors" value={n(s?.total_donors)} icon={<Users size={18} />} />
          <Stat label="Available donors" value={n(s?.available_donors)} icon={<Activity size={18} />} />
          <Stat label="Donor responses (interested)" value={n(s?.connections)} icon={<HeartHandshake size={18} />} />
          <Stat label="Blood requests" value={n(s?.blood_requests)} icon={<Droplets size={18} />} />
        </section>
        {stats.error && <p className="-mt-5 text-xs text-muted">Live statistics are unavailable right now.</p>}

        <section aria-labelledby="how">
          <h2 id="how" className="mb-3 text-lg font-semibold">How it works</h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            {[
              { i: Search, t: 'Search for donors', d: 'Filter registered donors by blood group, city and PIN code.' },
              { i: HeartHandshake, t: 'Connect with available donors', d: 'Contact donors who chose to share their details, or post a request.' },
              { i: UserPlus, t: 'Help save a life', d: 'Coordinate with the hospital, which confirms eligibility and arranges donation.' },
            ].map(({ i: Icon, t, d }, idx) => (
              <li key={t} className="card flex gap-3 p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand"><Icon size={18} /></span>
                <div><h3 className="text-sm font-semibold">{idx + 1}. {t}</h3><p className="mt-0.5 text-sm text-muted">{d}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="card flex flex-wrap items-center justify-between gap-4 border-brand/30 bg-brand-soft p-5">
          <div className="flex items-start gap-3">
            <Siren className="mt-0.5 text-brand" />
            <div><h2 className="text-lg font-semibold text-brand-dark">Need Blood Urgently?</h2><p className="text-sm text-ink/70">Post a request and available donors with the matching blood group are notified inside LifeDrop.</p></div>
          </div>
          <Link to="/request-blood" className="btn btn-primary">Request Blood</Link>
        </section>

        <section aria-labelledby="latest">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="latest" className="text-lg font-semibold">Latest blood requests</h2>
            <Link to="/requests" className="text-sm font-medium text-brand hover:underline">View all</Link>
          </div>
          {latest.loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : latest.error ? <ErrorState message={latest.error} onRetry={latest.reload} />
            : !latest.data?.length ? <EmptyState title="No open requests right now" text="New requests appear here as soon as they are posted." action={<Link to="/request-blood" className="btn btn-outline btn-sm"><ClipboardList size={14} /> Post a request</Link>} />
            : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{latest.data.map((r) => <RequestCard key={r.id} r={r} />)}</div>}
          <p className="mt-2 text-xs text-muted">Only non-sensitive details are shown publicly. Patient names and contact numbers are never listed.</p>
        </section>

        <Disclaimer />
      </div>
    </>
  );
}
