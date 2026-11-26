import { X } from 'lucide-react';
import { BLOOD_GROUPS, PRIORITIES } from '../../lib/constants';
import { cap } from '../../utils/format';

export interface ReqFilter { blood_group: string; city: string; priority: string; status: string }
export const emptyReqFilter: ReqFilter = { blood_group: '', city: '', priority: '', status: '' };

export default function RequestFilters({ value, onChange, statuses }: { value: ReqFilter; onChange: (v: ReqFilter) => void; statuses: string[] }) {
  const set = (k: keyof ReqFilter) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  const active = Object.values(value).some(Boolean);
  return (
    <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5" role="search">
      <select className="input" aria-label="Blood group" value={value.blood_group} onChange={set('blood_group')}>
        <option value="">All blood groups</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
      </select>
      <input className="input" aria-label="City" placeholder="City" value={value.city} onChange={set('city')} />
      <select className="input" aria-label="Priority" value={value.priority} onChange={set('priority')}>
        <option value="">Any priority</option>{PRIORITIES.map((p) => <option key={p} value={p}>{cap(p)}</option>)}
      </select>
      <select className="input" aria-label="Status" value={value.status} onChange={set('status')}>
        <option value="">Any status</option>{statuses.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
      </select>
      <button className="btn btn-outline" disabled={!active} onClick={() => onChange(emptyReqFilter)}><X size={14} /> Clear filters</button>
    </div>
  );
}
