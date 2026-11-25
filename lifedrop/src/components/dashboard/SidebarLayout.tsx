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
    <nav className="flex h-full flex-col gap-0.5 p-3" aria-label={title}>
      <p className="mb-2 px-2 text-xs font-semibold text-muted">{title}</p>
      {items.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
          className={({ isActive }) => cx('flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium', isActive ? 'bg-brand-soft text-brand' : 'text-ink/80 hover:bg-surface')}>
          <Icon size={16} /><span className="flex-1">{label}</span>
          {!!badge && <span className="rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">{badge > 99 ? '99+' : badge}</span>}
        </NavLink>
      ))}
      <button onClick={logout} className="mt-1 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium text-brand hover:bg-brand-soft"><LogOut size={16} /> Logout</button>
      {footer && <div className="mt-auto p-2 text-xs text-muted">{footer}</div>}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Logo />
        <button className="rounded p-1.5 hover:bg-surface" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {open && <div className="fixed inset-0 top-12 z-20 overflow-y-auto bg-white lg:hidden">{content}</div>}
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-line bg-white lg:flex">
          <div className="border-b border-line p-3"><Logo /></div>
          <div className="flex-1 overflow-y-auto">{content}</div>
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-6"><Outlet /></div>
      </div>
    </div>
  );
}
