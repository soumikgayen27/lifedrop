import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarClock, MapPin, Phone } from 'lucide-react';
import type { PublicDonor } from '../../types';
import { fmtDate } from '../../utils/format';
import { Avatar, BloodBadge, StatusBadge } from './ui';

export function ContactPanel({ donor }: { donor: PublicDonor }) {
  return donor.phone ? (
    <div className="rounded-md bg-surface p-2.5 text-sm">
      <p className="text-xs text-muted">Shared by the donor:</p>
      <a href={`tel:+91${donor.phone}`} className="flex items-center gap-1.5 font-medium text-brand"><Phone size={14} /> +91 {donor.phone}</a>
      <p className="mt-1 text-xs text-muted">Please be respectful and confirm availability and eligibility before relying on this donor.</p>
    </div>
  ) : (
    <div className="rounded-md bg-surface p-2.5 text-xs text-muted">
      This donor has chosen not to show a phone number. <Link to="/request-blood" className="font-medium text-brand">Post a blood request</Link> and matching available donors will be notified.
    </div>
  );
}

export default function DonorCard({ d }: { d: PublicDonor }) {
  const [show, setShow] = useState(false);
  return (
    <article className="card flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <Avatar name={d.full_name} src={d.avatar_url} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1 truncate font-semibold">{d.full_name}{d.is_verified && <BadgeCheck size={15} className="shrink-0 text-ok" aria-label="Verified by admin" />}</h3>
          <StatusBadge status={d.availability} />
        </div>
        <BloodBadge group={d.blood_group} />
      </div>
      <ul className="space-y-1 text-sm text-ink/80">
        <li className="flex items-center gap-2"><MapPin size={14} className="shrink-0 text-muted" />{d.area ? `${d.area}, ` : ''}{d.city} – {d.pin_code}</li>
        {d.last_donation_date && <li className="flex items-center gap-2"><CalendarClock size={14} className="shrink-0 text-muted" />Last donated {fmtDate(d.last_donation_date)}</li>}
      </ul>
      {show && <ContactPanel donor={d} />}
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button className="btn btn-primary btn-sm" onClick={() => setShow((s) => !s)} aria-expanded={show}>{show ? 'Hide contact' : 'Contact'}</button>
        <Link to={`/donors/${d.id}`} className="btn btn-outline btn-sm">View profile</Link>
      </div>
    </article>
  );
}
