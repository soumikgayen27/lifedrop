import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarClock, MapPin, Phone } from 'lucide-react';
import type { PublicDonor } from '../../types';
import { fmtDate } from '../../utils/format';
import { Avatar, BloodBadge, StatusBadge } from './ui';

export function ContactPanel({ donor }: { donor: PublicDonor }) {
  return donor.phone ? (
    <div className="rounded-xl bg-navy-50 p-3 text-sm ring-1 ring-navy-100">
      <p className="text-xs text-muted">Shared by the donor:</p>
      <a href={`tel:+91${donor.phone}`} className="flex items-center gap-1.5 font-display font-bold text-primary-700"><Phone size={14} /> +91 {donor.phone}</a>
      <p className="mt-1.5 text-xs text-muted">Please be respectful and confirm availability and eligibility before relying on this donor.</p>
    </div>
  ) : (
    <div className="rounded-xl bg-navy-50 p-3 text-xs text-muted ring-1 ring-navy-100">
      This donor has chosen not to show a phone number. <Link to="/request-blood" className="font-semibold text-primary-700">Post a blood request</Link> and matching available donors will be notified.
    </div>
  );
}

export default function DonorCard({ d }: { d: PublicDonor }) {
  const [show, setShow] = useState(false);
  return (
    <article className="card card-hover flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <Avatar name={d.full_name} src={d.avatar_url} size={48} />
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1 truncate font-display text-base font-bold text-navy-900">{d.full_name}{d.is_verified && <BadgeCheck size={16} className="shrink-0 text-success-600" aria-label="Verified by admin" />}</h3>
          <div className="mt-1"><StatusBadge status={d.availability} /></div>
        </div>
        <BloodBadge group={d.blood_group} />
      </div>
      <ul className="space-y-1.5 text-sm text-navy-700">
        <li className="flex items-center gap-2"><MapPin size={14} className="shrink-0 text-primary-500" />{d.area ? `${d.area}, ` : ''}{d.city} – {d.pin_code}</li>
        {d.last_donation_date && <li className="flex items-center gap-2"><CalendarClock size={14} className="shrink-0 text-primary-500" />Last donated {fmtDate(d.last_donation_date)}</li>}
      </ul>
      {show && <ContactPanel donor={d} />}
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button className="btn btn-primary btn-sm" onClick={() => setShow((s) => !s)} aria-expanded={show}>{show ? 'Hide contact' : 'Contact'}</button>
        <Link to={`/donors/${d.id}`} className="btn btn-outline btn-sm">View profile</Link>
      </div>
    </article>
  );
}
