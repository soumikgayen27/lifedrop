import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useMyDonor } from '../../hooks/useMyDonor';
import { fmtDate } from '../../utils/format';
import { cx, Disclaimer, EmptyState, ErrorState, PageHead, PageLoader } from '../../components/common/ui';

export default function Availability() {
  const { data: d, loading, error, reload } = useMyDonor();
  const [busy, setBusy] = useState(false);
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!d) return <EmptyState title="You are not registered as a donor" text="Add your blood group and location to manage availability." action={<Link to="/dashboard/profile/edit" className="btn btn-primary btn-sm">Become a donor</Link>} />;

  const set = async (availability: 'available' | 'unavailable') => {
    if (availability === d.availability) return;
    setBusy(true);
    const { error } = await supabase.from('donors').update({ availability }).eq('id', d.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(availability === 'available' ? 'You are now marked Available' : 'You are now marked Temporarily Unavailable');
    reload();
  };

  const opts = [
    { v: 'available' as const, t: 'Available', s: 'Matching blood requests can be sent to you.', i: CheckCircle2 },
    { v: 'unavailable' as const, t: 'Temporarily unavailable', s: 'You will not receive new request notifications.', i: PauseCircle },
  ];
  return (
    <div className="max-w-2xl">
      <PageHead title="Donation availability" subtitle="Update this whenever your situation changes." />
      <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Availability">
        {opts.map(({ v, t, s, i: Icon }) => (
          <button key={v} role="radio" aria-checked={d.availability === v} disabled={busy} onClick={() => set(v)}
            className={cx('card p-4 text-left transition', d.availability === v ? 'border-brand ring-2 ring-brand/20' : 'hover:bg-surface')}>
            <Icon className={d.availability === v ? 'text-brand' : 'text-muted'} size={22} /><p className="mt-2 font-semibold">{t}</p><p className="text-sm text-muted">{s}</p>
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted">Last donation recorded: {fmtDate(d.last_donation_date)}. <Link to="/dashboard/profile/edit" className="text-brand">Update</Link></p>
      <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        <b>Reminder:</b> LifeDrop does not decide whether you are medically eligible. Only mark yourself available if you believe you can donate; the hospital's medical staff will assess your eligibility.
      </div>
      <Disclaimer className="mt-3" />
    </div>
  );
}
