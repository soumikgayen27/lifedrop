import { ReactNode } from 'react';
import { HeartHandshake, Lock, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/ui';

/** Split-screen wrapper for the login / register / password pages. Purely presentational. */
export default function AuthShell({ title, subtitle, children, wide = false }: { title: string; subtitle?: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="relative hidden overflow-hidden bg-navy-950 text-white lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-black" />
        <div className="absolute inset-0 bg-grid-faint opacity-40 [background-size:48px_48px]" />
        <div className="absolute -left-24 top-0 h-96 w-96 rounded-full bg-primary-600/25 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-primary-700/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Logo light />
          <div>
            <h2 className="font-display text-3xl font-extrabold leading-tight xl:text-4xl">
              Someone needs blood.<br />
              <span className="bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">You could be their hope.</span>
            </h2>
            <ul className="mt-8 space-y-4 text-sm text-navy-200">
              <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15"><HeartHandshake size={18} className="text-primary-400" /></span> Connect with donors and people in need</li>
              <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15"><Lock size={18} className="text-primary-400" /></span> You control what is public</li>
              <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15"><ShieldCheck size={18} className="text-success-500" /></span> Admin-moderated requests and listings</li>
            </ul>
          </div>
          <p className="text-xs text-navy-400">Every drop counts. Every connection matters.</p>
        </div>
      </aside>
      <div className="flex items-start justify-center bg-surface px-4 py-10 sm:py-14">
        <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
          <div className="mb-6 lg:hidden"><Logo /></div>
          <h1 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
