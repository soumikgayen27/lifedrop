import { ReactNode, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { LogOut, Menu, X } from 'lucide-react';
import { Logo, cx } from '../common/ui';
import { useAuth } from '../../contexts/AuthContext';

export interface SideItem { to: string; label: string; icon: LucideIcon; end?: boolean; badge?: number }

export default function SidebarLayout({ title, items, footer }: { title: string; items: SideItem[]; footer?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const nav = useNavigate();
  const logout = async () => { await signOut(); nav('/'); };

  const content = (
    <nav className="flex h-full flex-col gap-1 p-3" aria-label={title}>
      <p className="mb-2 px-2 font-display text-xs font-bold uppercase tracking-wider text-navy-400">{title}</p>
      {items.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
          className={({ isActive }) => cx('flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm font-semibold transition-colors', isActive ? 'bg-primary-600 text-white shadow-glow-sm' : 'text-navy-700 hover:bg-navy-50')}>
          <Icon size={17} /><span className="flex-1">{label}</span>
          {!!badge && <span className="rounded-full bg-primary-600 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">{badge > 99 ? '99+' : badge}</span>}
        </NavLink>
      ))}
      <button onClick={logout} className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-display text-sm font-semibold text-primary-700 hover:bg-primary-50"><LogOut size={17} /> Logout</button>
      {footer && <div className="mt-auto p-2 text-xs text-muted">{footer}</div>}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-white/90 px-4 shadow-soft backdrop-blur lg:hidden">
        <Logo />
        <button className="grid h-10 w-10 place-items-center rounded-lg hover:bg-navy-50" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {open && <div className="fixed inset-0 top-14 z-20 overflow-y-auto bg-white lg:hidden">{content}</div>}
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-navy-100 bg-white lg:flex">
          <div className="border-b border-navy-100 p-4"><Logo /></div>
          <div className="flex-1 overflow-y-auto">{content}</div>
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-8"><Outlet /></div>
      </div>
    </div>
  );
}
