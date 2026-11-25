import { Link } from 'react-router-dom';
import { Bell, ClipboardList, Droplets, HeartPulse, Mail } from 'lucide-react';
import { supabase, must } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useMyDonor } from '../../hooks/useMyDonor';
import { fmtDate, timeAgo } from '../../utils/format';
import { BloodBadge, Disclaimer, PageHead, Spinner, Stat, StatusBadge } from '../../components/common/ui';
import type { AppNotification, BloodRequest } from '../../types';

export default function Overview() {
  const { profile, session } = useAuth();
  const donor = useMyDonor();
  const uid = session!.user.id;
  const notes = useAsync(async () => must(await supabase.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(4)) as AppNotification[], [uid]);
  const reqs = useAsync(async () => must(await supabase.from('blood_requests').select('*').eq('requester_id', uid).order('created_at', { ascending: false }).limit(4)) as BloodRequest[], [uid]);

  const d = donor.data;
  const fields = [profile?.full_name, profile?.phone, profile?.avatar_url, d?.blood_group, d?.city, d?.area, d?.pin_code, d?.date_of_birth, d?.bio];
  const needed = d ? fields : fields.slice(0, 3);
  const pct = Math.round((needed.filter(Boolean).length / needed.length) * 100);

  return (
    <div className="max-w-4xl">
      <PageHead title={`Welcome, ${profile?.full_name?.split(' ')[0] ?? 'friend'}`} subtitle="Here is a summary of your LifeDrop account." />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Blood group" value={donor.loading ? <Spinner size={14} /> : d ? <BloodBadge group={d.blood_group} /> : 'Not a donor'} icon={<Droplets size={18} />} />
        <Stat label="Availability" value={donor.loading ? <Spinner size={14} /> : d ? <StatusBadge status={d.availability} /> : '—'} icon={<HeartPulse size={18} />} />
        <div className="card p-4"><p className="text-xs text-muted">Profile completion</p><p className="text-xl font-semibold">{pct}%</p><div className="mt-1.5 h-1.5 overflow-hidden rounded bg-surface"><div className="h-full bg-brand" style={{ width: `${pct}%` }} /></div>{pct < 100 && <Link to="/dashboard/profile/edit" className="mt-1.5 block text-xs text-brand">Complete profile</Link>}</div>
      </div>

      {!donor.loading && !d && (
        <div className="card mt-3 flex flex-wrap items-center justify-between gap-2 border-brand/30 bg-brand-soft p-4 text-sm">
          <span>You have a basic account. Add your blood group and location to become a donor.</span>
          <Link to="/dashboard/profile/edit" className="btn btn-primary btn-sm">Become a donor</Link>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><Bell size={15} /> Recent notifications</h2><Link to="/dashboard/notifications" className="text-xs text-brand">View all</Link></div>
          {notes.loading ? <Spinner /> : !notes.data?.length ? <p className="text-sm text-muted">No notifications yet.</p> : (
            <ul className="divide-y divide-line">{notes.data.map((n) => <li key={n.id} className="py-2 text-sm"><p className={n.is_read ? '' : 'font-medium'}>{n.title}</p><p className="text-xs text-muted">{timeAgo(n.created_at)}</p></li>)}</ul>
          )}
        </section>
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><ClipboardList size={15} /> Recent blood requests</h2><Link to="/dashboard/requests" className="text-xs text-brand">View all</Link></div>
          {reqs.loading ? <Spinner /> : !reqs.data?.length ? <p className="text-sm text-muted">You have not posted a request. <Link to="/request-blood" className="text-brand">Request blood</Link></p> : (
            <ul className="divide-y divide-line">{reqs.data.map((r) => <li key={r.id} className="flex items-center justify-between gap-2 py-2 text-sm"><span><b>{r.blood_group}</b> · {r.hospital_name}<span className="block text-xs text-muted">{r.request_code} · {fmtDate(r.required_date)}</span></span><StatusBadge status={r.status} /></li>)}</ul>
          )}
        </section>
      </div>

      <section className="card mt-4 p-4 text-sm">
        <h2 className="mb-2 flex items-center gap-2 font-semibold"><Mail size={15} /> Account information</h2>
        <dl className="grid gap-2 sm:grid-cols-3">
          <div><dt className="text-xs text-muted">Email</dt><dd className="break-all">{profile?.email}</dd></div>
          <div><dt className="text-xs text-muted">Mobile</dt><dd>{profile?.phone ?? '—'}</dd></div>
          <div><dt className="text-xs text-muted">Member since</dt><dd>{fmtDate(profile?.created_at)}</dd></div>
        </dl>
      </section>
      <Disclaimer className="mt-4" />
    </div>
  );
}
