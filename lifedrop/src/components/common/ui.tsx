import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, Droplet, Info, Loader2, SearchX } from 'lucide-react';
import { DISCLAIMER } from '../../lib/constants';
import { cap } from '../../utils/format';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cx('flex items-center gap-2 font-semibold text-ink', className)} aria-label="LifeDrop home">
      <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-white"><Droplet size={18} fill="currentColor" /></span>
      <span className="text-lg">Life<span className="text-brand">Drop</span></span>
    </Link>
  );
}

export function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1 block text-xs font-medium text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs text-brand">{error}</span>}
    </label>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-brand" aria-label="Loading" />;
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted" role="status"><Spinner /> {label}</div>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-4 py-10 text-center">
      <SearchX className="mb-2 text-muted" size={28} />
      <p className="font-medium">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="card flex items-start gap-3 border-brand/30 bg-brand-soft p-4 text-sm">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-brand" />
      <div className="flex-1"><p className="font-medium text-brand-dark">Something went wrong</p><p className="text-ink/80">{message}</p></div>
      {onRetry && <button className="btn btn-outline btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <div className={cx('flex gap-2 rounded-md border border-line bg-white p-3 text-xs text-muted', className)}>
      <Info size={16} className="mt-0.5 shrink-0 text-brand" /><p>{DISCLAIMER}</p>
    </div>
  );
}

export function PageHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>{subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}</div>
      {action}
    </div>
  );
}

export function BloodBadge({ group }: { group: string }) {
  return <span className="inline-flex h-7 min-w-[2.25rem] items-center justify-center rounded-md bg-brand px-1.5 text-sm font-semibold text-white">{group}</span>;
}

const priorityStyle: Record<string, string> = {
  normal: 'bg-surface text-muted border border-line',
  urgent: 'bg-amber-50 text-amber-700 border border-amber-200',
  critical: 'bg-brand-soft text-brand-dark border border-brand/30',
};
export const PriorityBadge = ({ priority }: { priority: string }) => <span className={cx('badge', priorityStyle[priority])}>{cap(priority)}</span>;

const statusStyle: Record<string, string> = {
  open: 'bg-blue-50 text-blue-700', fulfilled: 'bg-green-50 text-ok', cancelled: 'bg-surface text-muted',
  removed: 'bg-brand-soft text-brand-dark', available: 'bg-green-50 text-ok', unavailable: 'bg-surface text-muted',
  resolved: 'bg-green-50 text-ok', new: 'bg-amber-50 text-amber-700', interested: 'bg-green-50 text-ok', declined: 'bg-surface text-muted',
  active: 'bg-green-50 text-ok', suspended: 'bg-brand-soft text-brand-dark',
};
export const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
  <span className={cx('badge', statusStyle[status] ?? 'bg-surface text-muted')}>{label ?? (status === 'unavailable' ? 'Temporarily unavailable' : cap(status))}</span>
);

export function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
  return src
    ? <img src={src} alt={name} width={size} height={size} style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover" />
    : <span style={{ width: size, height: size, fontSize: size * 0.38 }} className="grid shrink-0 place-items-center rounded-full bg-brand-soft font-semibold text-brand-dark" aria-hidden>{initials}</span>;
}

export function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
      <span className="text-muted">Page {page} of {pages} · {total} results</span>
      <div className="flex gap-2">
        <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={14} /> Prev</button>
        <button className="btn btn-outline btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next <ChevronRight size={14} /></button>
      </div>
    </nav>
  );
}

export function Stat({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      {icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand-soft text-brand">{icon}</span>}
      <div><p className="text-xl font-semibold leading-tight">{value}</p><p className="text-xs text-muted">{label}</p></div>
    </div>
  );
}
