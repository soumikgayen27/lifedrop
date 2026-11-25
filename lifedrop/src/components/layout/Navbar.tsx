import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Menu, Shield, X } from 'lucide-react';
import { Avatar, Logo, cx } from '../common/ui';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/donors', label: 'Find Donors' },
  { to: '/requests', label: 'Blood Requests' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { session, profile, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); setMenu(false); }, [loc.pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const logout = async () => { await signOut(); nav('/'); };
  const item = ({ isActive }: { isActive: boolean }) =>
    cx('rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors', isActive ? 'text-brand' : 'text-ink/80 hover:text-brand');

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={item}>{l.label}</NavLink>)}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link to="/donors" className="btn btn-primary btn-sm">Find Blood</Link>
          {session ? (
            <div className="relative" ref={ref}>
              <button className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 hover:bg-surface" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
                <Avatar name={profile?.full_name ?? 'U'} src={profile?.avatar_url} size={24} />
                <span className="max-w-[110px] truncate text-sm">{profile?.full_name?.split(' ')[0] ?? 'Account'}</span>
                <ChevronDown size={14} />
              </button>
              {menu && (
                <div role="menu" className="card absolute right-0 mt-1 w-48 p-1 text-sm shadow-md">
                  <Link role="menuitem" to="/dashboard" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-surface"><LayoutDashboard size={15} /> Dashboard</Link>
                  {isAdmin && <Link role="menuitem" to="/admin" className="flex items-center gap-2 rounded px-3 py-2 hover:bg-surface"><Shield size={15} /> Admin panel</Link>}
                  <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-brand hover:bg-brand-soft"><LogOut size={15} /> Log out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-outline btn-sm">Register</Link>
            </>
          )}
        </div>
        <button className="ml-auto rounded-md p-2 hover:bg-surface lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cx('rounded-md px-2 py-2.5 text-sm font-medium', isActive ? 'bg-brand-soft text-brand' : 'text-ink')}>{l.label}</NavLink>)}
          </nav>
          <div className="mt-3 grid gap-2">
            <Link to="/donors" className="btn btn-primary">Find Blood</Link>
            {session ? (
              <>
                <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
                {isAdmin && <Link to="/admin" className="btn btn-outline">Admin panel</Link>}
                <button className="btn btn-danger" onClick={logout}>Log out</button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2"><Link to="/login" className="btn btn-outline">Login</Link><Link to="/register" className="btn btn-outline">Register</Link></div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
