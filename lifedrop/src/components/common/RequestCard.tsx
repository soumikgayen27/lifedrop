import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Clock, Droplets, MapPin } from 'lucide-react';
import type { PublicRequest } from '../../types';
import { fmtDate, timeAgo } from '../../utils/format';
import { BloodBadge, PriorityBadge, StatusBadge } from './ui';

export default function RequestCard({ r }: { r: PublicRequest }) {
  return (
    <article className="card card-hover flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2"><BloodBadge group={r.blood_group} /><PriorityBadge priority={r.priority} /></div>
        <StatusBadge status={r.status} />
      </div>
      <ul className="space-y-1.5 text-sm text-navy-700">
        <li className="flex items-center gap-2 font-display font-bold text-navy-900"><Building2 size={14} className="shrink-0 text-primary-500" /><span className="truncate">{r.hospital_name}</span></li>
        <li className="flex items-center gap-2"><MapPin size={14} className="shrink-0 text-primary-500" />{r.city}, {r.state}</li>
        <li className="flex items-center gap-2"><Droplets size={14} className="shrink-0 text-primary-500" />{r.units} unit{r.units > 1 ? 's' : ''} · needed by {fmtDate(r.required_date)}</li>
        <li className="flex items-center gap-2 text-xs text-muted"><Clock size={13} className="shrink-0" />{timeAgo(r.created_at)} · {r.request_code}</li>
      </ul>
      <Link to={`/requests/${r.id}`} className="btn btn-outline btn-sm mt-auto">View details <ArrowRight size={14} /></Link>
    </article>
  );
}
