import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, CalendarClock, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAsync } from '../../hooks/useAsync';
import { fmtDate } from '../../utils/format';
import { ContactPanel } from '../../components/common/DonorCard';
import { Avatar, BloodBadge, Disclaimer, EmptyState, ErrorState, PageLoader, StatusBadge } from '../../components/common/ui';
import type { PublicDonor } from '../../types';

export default function DonorProfile() {
  const { id } = useParams();
  const { data, loading, error, reload } = useAsync(async () => {
    const { data, error } = await supabase.from('public_donors').select('*').eq('id', id!).maybeSingle();
    if (error) throw new Error(error.message);
    return data as PublicDonor | null;
  }, [id]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/donors" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:text-primary-700"><ArrowLeft size={14} /> Back to donors</Link>
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} /> : !data ? (
        <EmptyState title="Donor not found" text="This profile may be private or no longer listed." action={<Link to="/donors" className="btn btn-outline btn-sm">Search donors</Link>} />
      ) : (
        <div className="card space-y-5 p-6">
          <div className="flex items-center gap-4">
            <Avatar name={data.full_name} src={data.avatar_url} size={64} />
            <div className="flex-1">
              <h1 className="flex items-center gap-1.5 font-display text-xl font-extrabold">{data.full_name}{data.is_verified && <BadgeCheck size={18} className="text-success-600" aria-label="Verified by admin" />}</h1>
              <StatusBadge status={data.availability} />
            </div>
            <BloodBadge group={data.blood_group} size="lg" />
          </div>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2"><MapPin size={15} className="text-primary-500" />{data.area ? `${data.area}, ` : ''}{data.city}, {data.state} – {data.pin_code}</li>
            {data.last_donation_date && <li className="flex items-center gap-2"><CalendarClock size={15} className="text-primary-500" />Last donated {fmtDate(data.last_donation_date)}</li>}
          </ul>
          {data.bio && <p className="rounded-xl bg-navy-50 p-4 text-sm text-navy-700">{data.bio}</p>}
          <ContactPanel donor={data} />
          <Disclaimer />
        </div>
      )}
    </div>
  );
}
