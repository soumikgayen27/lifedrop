import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, Droplet, Info, Loader2, SearchX } from 'lucide-react';
import { DISCLAIMER } from '../../lib/constants';
import { cap } from '../../utils/format';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" className={cx('flex items-center gap-2.5', className)} aria-label="LifeDrop home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow-sm">
        <Droplet size={19} fill="currentColor" strokeWidth={1.5} />
      </span>
      <span className="leading-none">
        <span className={cx('block font-display text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-navy-900')}>
          Life<span className={light ? 'text-primary-400' : 'text-primary-600'}>Drop</span>
        </span>
        <span className={cx('mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em]', light ? 'text-navy-300' : 'text-navy-400')}>Donor Network</span>
      </span>
    </Link>
  );
}

export function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx('block', className)}>
      <span className="mb-1.5 block text-sm font-semibold text-navy-800">{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-navy-500">{hint}</span>}
      {error && <span role="alert" className="mt-1.5 block text-xs font-medium text-primary-700">{error}</span>}
    </label>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-primary-600" aria-label="Loading" />;
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted" role="status"><Spinner /> {label}</div>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-4 py-12 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-navy-50 text-navy-400"><SearchX size={24} /></span>
      <p className="font-display text-base font-bold text-navy-900">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl bg-primary-50 p-4 text-sm ring-1 ring-primary-200">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-primary-600" />
      <div className="flex-1"><p className="font-display font-bold text-primary-800">Something went wrong</p><p className="text-navy-700">{message}</p></div>
      {onRetry && <button className="btn btn-outline btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <div className={cx('flex gap-2.5 rounded-xl bg-navy-50 p-3.5 text-xs leading-relaxed text-navy-600 ring-1 ring-navy-100', className)}>
      <Info size={16} className="mt-0.5 shrink-0 text-primary-600" /><p>{DISCLAIMER}</p>
    </div>
  );
}

/** Inline page heading – used on public pages and inside dashboards. */
export function PageHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-muted sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Dark hero band for the top of public pages. */
export function PageHero({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-black" />
      <div className="absolute inset-0 bg-grid-faint opacity-40 [background-size:48px_48px]" />
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary-600/25 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-10 sm:py-14">
        <div>
          {eyebrow && <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-200 ring-1 ring-white/15">{eyebrow}</span>}
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-200 sm:text-base">{subtitle}</p>}
        </div>
        {action}
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, align = 'center' }: { eyebrow?: string; title: ReactNode; description?: ReactNode; align?: 'center' | 'left' }) {
  return (
    <div className={cx('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left')}>
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-navy-600 sm:text-lg">{description}</p>}
    </div>
  );
}

export function BloodBadge({ group, size = 'md' }: { group: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 min-w-[2rem] text-xs', md: 'h-9 min-w-[2.5rem] text-sm', lg: 'h-14 min-w-[3.5rem] text-lg' };
  return (
    <span title={`Blood group ${group}`} className={cx('inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 px-2 font-display font-extrabold text-white shadow-glow-sm ring-1 ring-primary-300/50', sizes[size])}>
      {group}
    </span>
  );
}

const priorityStyle: Record<string, string> = {
  normal: 'bg-navy-50 text-navy-600 ring-1 ring-navy-100',
  urgent: 'bg-warning-100 text-warning-700 ring-1 ring-warning-500/20',
  critical: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200',
};
export const PriorityBadge = ({ priority }: { priority: string }) => <span className={cx('badge', priorityStyle[priority])}>{cap(priority)}</span>;

const statusStyle: Record<string, string> = {
  open: 'bg-navy-100 text-navy-700', fulfilled: 'bg-success-100 text-success-700', cancelled: 'bg-navy-50 text-navy-500',
  removed: 'bg-primary-50 text-primary-700', available: 'bg-success-100 text-success-700', unavailable: 'bg-navy-50 text-navy-500',
  resolved: 'bg-success-100 text-success-700', new: 'bg-warning-100 text-warning-700', interested: 'bg-success-100 text-success-700', declined: 'bg-navy-50 text-navy-500',
  active: 'bg-success-100 text-success-700', suspended: 'bg-primary-50 text-primary-700',
};
export const StatusBadge = ({ status, label }: { status: string; label?: string }) => (
  <span className={cx('badge', statusStyle[status] ?? 'bg-navy-50 text-navy-500')}>{label ?? (status === 'unavailable' ? 'Temporarily unavailable' : cap(status))}</span>
);

export function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';
  return src
    ? <img src={src} alt={name} width={size} height={size} style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover ring-2 ring-white" />
    : <span style={{ width: size, height: size, fontSize: size * 0.38 }} className="grid shrink-0 place-items-center rounded-full bg-navy-900 font-display font-bold text-white" aria-hidden>{initials}</span>;
}

export function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="mt-6 flex items-center justify-between text-sm" aria-label="Pagination">
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
    <div className="card flex items-center gap-4 p-5">
      {icon && <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">{icon}</span>}
      <div><p className="font-display text-2xl font-extrabold leading-tight text-navy-900">{value}</p><p className="text-xs font-medium text-navy-500">{label}</p></div>
    </div>
  );
}
