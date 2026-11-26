import { Link } from 'react-router-dom';
import { Heart, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/ui';

const link = 'transition-colors hover:text-primary-400';
export default function Footer() {
  return (
    <footer className="mt-16 bg-navy-950 text-navy-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-300">LifeDrop helps people in need of blood find registered donors in their community. We connect people; we are not a blood bank or a medical service.</p>
          <p className="mt-5 flex items-center gap-2 text-xs font-medium text-navy-300"><Heart className="h-4 w-4 text-primary-500" fill="currentColor" /> Every drop counts. Every connection matters.</p>
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Quick links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className={link} to="/donors">Find Donors</Link></li>
            <li><Link className={link} to="/requests">Blood Requests</Link></li>
            <li><Link className={link} to="/request-blood">Request Blood</Link></li>
            <li><Link className={link} to="/register">Become a Donor</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Important links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className={link} to="/how-it-works">How It Works</Link></li>
            <li><Link className={link} to="/about">About Us</Link></li>
            <li><Link className={link} to="/privacy">Privacy Policy</Link></li>
            <li><Link className={link} to="/terms">Terms and Conditions</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0 text-primary-400" /> support@lifedrop.example</li>
            <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0 text-primary-400" /> +91 00000 00000</li>
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 shrink-0 text-primary-400" /> Kolkata, West Bengal, India</li>
          </ul>
          <p className="mt-3 text-xs text-navy-400">Contact details above are placeholders – edit them in <code>Footer.tsx</code> and <code>Contact.tsx</code>.</p>
        </div>
      </div>
      <div className="border-t border-navy-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-navy-400 sm:flex-row">
          <p>© {new Date().getFullYear()} LifeDrop – Blood Donation Network. In an emergency, contact your nearest hospital or blood bank.</p>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success-500" /> Privacy-first donor network</span>
        </div>
      </div>
    </footer>
  );
}
