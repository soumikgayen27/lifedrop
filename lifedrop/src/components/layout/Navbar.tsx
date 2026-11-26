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
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setOpen(false); setMenu(false); }, [loc.pathname]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = async () => { await signOut(); nav('/'); };
  const item = ({ isActive }: { isActive: boolean }) =>
    cx('relative rounded-lg px-3 py-2 font-display text-sm font-semibold transition-colors', isActive ? 'text-primary-700' : 'text-navy-700 hover:bg-primary-50/60 hover:text-primary-600');

  return (
    <header className={cx('sticky top-0 z-40 transition-all duration-300', scrolled || open ? 'bg-white/90 shadow-soft ring-1 ring-navy-100 backdrop-blur-md' : 'bg-white')}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={item}>
              {({ isActive }) => (<>{l.label}{isActive && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary-600" />}</>)}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Link to="/donors" className="btn btn-primary btn-sm">Find Blood</Link>
          {session ? (
            <div className="relative" ref={ref}>
              <button className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 ring-1 ring-navy-200 transition-colors hover:bg-navy-50" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu">
                <Avatar name={profile?.full_name ?? 'U'} src={profile?.avatar_url} size={28} />
                <span className="max-w-[110px] truncate font-display text-sm font-semibold">{profile?.full_name?.split(' ')[0] ?? 'Account'}</span>
                <ChevronDown size={14} className={cx('transition-transform', menu && 'rotate-180')} />
              </button>
              {menu && (
                <div role="menu" className="card absolute right-0 mt-2 w-52 animate-scale-in p-1.5 text-sm">
                  <Link role="menuitem" to="/dashboard" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium hover:bg-navy-50"><LayoutDashboard size={15} /> Dashboard</Link>
                  {isAdmin && <Link role="menuitem" to="/admin" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium hover:bg-navy-50"><Shield size={15} /> Admin panel</Link>}
                  <button role="menuitem" onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left font-medium text-primary-700 hover:bg-primary-50"><LogOut size={15} /> Log out</button>
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
        <button className="ml-auto grid h-10 w-10 place-items-center rounded-lg hover:bg-navy-50 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="px-4 pb-4 lg:hidden">
          <div className="card animate-fade-up p-2">
            <nav className="flex flex-col" aria-label="Mobile">
              {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cx('rounded-xl px-3 py-3 font-display text-sm font-semibold', isActive ? 'bg-primary-50 text-primary-700' : 'text-navy-700 hover:bg-navy-50')}>{l.label}</NavLink>)}
            </nav>
            <div className="mt-2 grid gap-2 border-t border-navy-100 p-2 pt-3">
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
        </div>
      )}
    </header>
  );
}
