import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMyDonor } from '../../hooks/useMyDonor';
import { cap, fmtDate } from '../../utils/format';
import { Avatar, BloodBadge, ErrorState, PageHead, PageLoader, StatusBadge } from '../../components/common/ui';

const Row = ({ k, v }: { k: string; v?: string | null }) => <div><dt className="text-xs text-muted">{k}</dt><dd className="text-sm font-medium">{v || '—'}</dd></div>;

export default function MyProfile() {
  const { profile } = useAuth();
  const { data: d, loading, error, reload } = useMyDonor();
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  return (
    <div className="max-w-3xl">
      <PageHead title="My profile" action={<Link to="/dashboard/profile/edit" className="btn btn-outline btn-sm"><Pencil size={14} /> Edit</Link>} />
      <div className="card space-y-4 p-5">
        <div className="flex items-center gap-3">
          <Avatar name={profile?.full_name ?? ''} src={profile?.avatar_url} size={56} />
          <div className="flex-1"><h2 className="font-semibold">{profile?.full_name}</h2><p className="text-sm text-muted">{profile?.email}</p></div>
          {d && <BloodBadge group={d.blood_group} />}
        </div>
        <dl className="grid gap-3 sm:grid-cols-3"><Row k="Mobile" v={profile?.phone} /><Row k="Account type" v={d ? 'Donor' : 'Basic user'} /></dl>
        {d && <>
          <hr className="border-line" />
          <dl className="grid gap-3 sm:grid-cols-3">
            <Row k="Date of birth" v={fmtDate(d.date_of_birth)} /><Row k="Gender" v={d.gender ? cap(d.gender) : null} /><Row k="Last donation" v={fmtDate(d.last_donation_date)} />
            <Row k="State" v={d.state} /><Row k="City" v={d.city} /><Row k="Area / PIN" v={`${d.area} – ${d.pin_code}`} />
          </dl>
          <div className="flex flex-wrap gap-2 text-sm"><StatusBadge status={d.availability} /><span className="badge bg-surface text-muted">{d.show_in_public ? 'Listed in public search' : 'Not publicly listed'}</span><span className="badge bg-surface text-muted">{d.show_phone ? 'Phone visible' : 'Phone hidden'}</span><span className="badge bg-surface text-muted">{d.is_verified ? 'Verified by admin' : 'Not yet verified'}</span></div>
          {d.bio && <p className="rounded-md bg-surface p-3 text-sm">{d.bio}</p>}
        </>}
      </div>
    </div>
  );
}
