import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, ClipboardList, Droplets, HeartHandshake, Lock, Search, ShieldCheck, Siren, UserPlus, Users } from 'lucide-react';
import { BLOOD_GROUPS, STATES } from '../../lib/constants';
import { supabase, must } from '../../lib/supabase';
import { useAsync } from '../../hooks/useAsync';
import RequestCard from '../../components/common/RequestCard';
import { Disclaimer, EmptyState, ErrorState, SectionHeader, Spinner, Stat } from '../../components/common/ui';
import type { PublicRequest } from '../../types';

function HeroCard() {
  return (
    <div className="relative animate-scale-in">
      <div className="absolute -right-3 -top-3 z-10 rounded-2xl bg-primary-600 px-4 py-3 text-white shadow-glow">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Find a match</p>
        <p className="font-display text-lg font-extrabold leading-none">8 groups</p>
      </div>
      <div className="rounded-3xl bg-white/95 p-6 text-navy-900 shadow-2xl ring-1 ring-white/20 backdrop-blur">
        <svg viewBox="0 0 240 110" className="mx-auto w-full max-w-[240px]" role="img" aria-label="Blood drop with a heartbeat line">
          <path d="M120 6c0 0-34 38-34 62a34 34 0 0 0 68 0c0-24-34-62-34-62z" fill="#dc2626" />
          <path d="M96 70h14l7-13 9 24 7-11h11" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 98h56l9-16 12 30 11-20 8 6h136" fill="none" stroke="#dc2626" strokeOpacity=".3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="mt-4 text-center font-display text-base font-bold">Who are you looking for?</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {BLOOD_GROUPS.map((g) => (
            <Link key={g} to={`/donors?blood_group=${encodeURIComponent(g)}`} className="grid h-11 place-items-center rounded-xl bg-navy-50 font-display text-sm font-extrabold text-navy-900 transition-colors hover:bg-primary-600 hover:text-white">{g}</Link>
          ))}
        </div>
        <Link to="/donors" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
          Browse all donors <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
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
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-black" />
        <div className="absolute inset-0 bg-grid-faint opacity-40 [background-size:48px_48px]" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-primary-700/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-16 sm:pt-20 lg:grid-cols-12 lg:pb-28">
          <div className="animate-fade-up lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-200 ring-1 ring-white/15 backdrop-blur">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" /></span>
              Blood donation network
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              Every Drop Can
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-primary-300 bg-clip-text text-transparent">Save a Life.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-200">Find nearby blood donors, connect with generous people and help save lives when every second matters.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/donors" className="btn btn-primary btn-lg"><Search className="h-5 w-5" /> Find Blood Donors</Link>
              <Link to="/register" className="btn btn-lg bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15"><UserPlus className="h-5 w-5" /> Become a Donor</Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-navy-300">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success-500" /> Admin-verified donors</span>
              <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-navy-400" /> Privacy first</span>
              <span className="flex items-center gap-2"><Siren className="h-4 w-4 text-primary-400" /> Emergency requests</span>
            </div>
          </div>
          <div className="lg:col-span-5"><HeroCard /></div>
        </div>
        <svg viewBox="0 0 1440 80" className="absolute bottom-0 block w-full" preserveAspectRatio="none" aria-hidden="true"><path d="M0,40 C240,80 480,0 720,24 C960,48 1200,80 1440,40 L1440,80 L0,80 Z" fill="#ffffff" /></svg>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 pb-4">
        <section aria-labelledby="qs" className="relative z-10 -mt-14"><h2 id="qs" className="sr-only">Quick donor search</h2><QuickSearch /></section>

        <section aria-label="Platform statistics">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Registered donors" value={n(s?.total_donors)} icon={<Users size={22} />} />
            <Stat label="Available donors" value={n(s?.available_donors)} icon={<Activity size={22} />} />
            <Stat label="Donor responses (interested)" value={n(s?.connections)} icon={<HeartHandshake size={22} />} />
            <Stat label="Blood requests" value={n(s?.blood_requests)} icon={<Droplets size={22} />} />
          </div>
          {stats.error && <p className="mt-3 text-xs text-muted">Live statistics are unavailable right now.</p>}
        </section>

        <section aria-labelledby="how">
          <SectionHeader eyebrow="How it works" title={<span id="how">Three steps from need to connection</span>} description="A simple, transparent flow built around safety and speed." />
          <ol className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { i: Search, t: 'Search for donors', d: 'Filter registered donors by blood group, city and PIN code.' },
              { i: HeartHandshake, t: 'Connect with available donors', d: 'Contact donors who chose to share their details, or post a request.' },
              { i: UserPlus, t: 'Help save a life', d: 'Coordinate with the hospital, which confirms eligibility and arranges donation.' },
            ].map(({ i: Icon, t, d }, idx) => (
              <li key={t} className="card card-hover p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-600 text-white shadow-glow-sm"><Icon size={22} /></span>
                  <span className="font-display text-4xl font-extrabold text-navy-100" aria-hidden>{idx + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-glow sm:p-12">
          <div className="absolute inset-0 bg-grid-faint opacity-20 [background-size:32px_32px]" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25"><Siren /></span>
              <div>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Need Blood Urgently?</h2>
                <p className="mt-2 max-w-xl text-primary-100">Post a request and available donors with the matching blood group are notified inside LifeDrop.</p>
              </div>
            </div>
            <Link to="/request-blood" className="btn btn-lg bg-white text-primary-700 shadow-lg hover:bg-primary-50">Request Blood</Link>
          </div>
        </section>

        <section aria-labelledby="latest">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <span className="section-eyebrow">Live from the network</span>
              <h2 id="latest" className="mt-3 font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">Latest blood requests</h2>
            </div>
            <Link to="/requests" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-600">View all <ArrowRight size={15} /></Link>
          </div>
          {latest.loading ? <div className="flex justify-center py-8"><Spinner /></div>
            : latest.error ? <ErrorState message={latest.error} onRetry={latest.reload} />
            : !latest.data?.length ? <EmptyState title="No open requests right now" text="New requests appear here as soon as they are posted." action={<Link to="/request-blood" className="btn btn-outline btn-sm"><ClipboardList size={14} /> Post a request</Link>} />
            : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{latest.data.map((r) => <RequestCard key={r.id} r={r} />)}</div>}
          <p className="mt-3 text-xs text-muted">Only non-sensitive details are shown publicly. Patient names and contact numbers are never listed.</p>
        </section>

        <Disclaimer />
      </div>
    </>
  );
}
