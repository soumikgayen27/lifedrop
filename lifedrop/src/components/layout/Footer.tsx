import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '../common/ui';

const col = 'space-y-1.5 text-sm text-muted';
export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-muted">LifeDrop helps people in need of blood find registered donors in their community. We connect people; we are not a blood bank or a medical service.</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Quick links</h3>
          <ul className={col}>
            <li><Link className="hover:text-brand" to="/donors">Find Donors</Link></li>
            <li><Link className="hover:text-brand" to="/requests">Blood Requests</Link></li>
            <li><Link className="hover:text-brand" to="/request-blood">Request Blood</Link></li>
            <li><Link className="hover:text-brand" to="/register">Become a Donor</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Important links</h3>
          <ul className={col}>
            <li><Link className="hover:text-brand" to="/how-it-works">How It Works</Link></li>
            <li><Link className="hover:text-brand" to="/about">About Us</Link></li>
            <li><Link className="hover:text-brand" to="/privacy">Privacy Policy</Link></li>
            <li><Link className="hover:text-brand" to="/terms">Terms and Conditions</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Contact</h3>
          <ul className={col}>
            <li className="flex items-center gap-2"><Mail size={14} /> support@lifedrop.example</li>
            <li className="flex items-center gap-2"><Phone size={14} /> +91 00000 00000</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> Kolkata, West Bengal, India</li>
          </ul>
          <p className="mt-2 text-xs text-muted">Contact details above are placeholders – edit them in <code>Footer.tsx</code> and <code>Contact.tsx</code>.</p>
        </div>
      </div>
      <div className="border-t border-line py-3 text-center text-xs text-muted">© {new Date().getFullYear()} LifeDrop – Blood Donation Network. In an emergency, contact your nearest hospital or blood bank.</div>
    </footer>
  );
}
