import { Link } from 'react-router-dom';
import { Disclaimer, PageHero } from '../../components/common/ui';

const seekers = ['Search for donors by blood group, city and PIN code.', 'Select matching, available donors.', 'Contact donors who share a phone number, or post a request so matching donors are notified.', 'Coordinate with the hospital, which confirms eligibility and arranges the donation.'];
const donors = ['Register with your blood group and location.', 'Complete your profile and choose your privacy settings.', 'Keep your availability up to date.', 'Respond to blood requests – express interest or decline.'];

const Steps = ({ title, items }: { title: string; items: string[] }) => (
  <section className="card p-6">
    <h2 className="mb-4 font-display text-lg font-bold text-navy-900">{title}</h2>
    <ol className="space-y-3">
      {items.map((s, i) => (
        <li key={s} className="flex gap-3 text-sm text-navy-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-600 font-display text-xs font-bold text-white shadow-glow-sm">{i + 1}</span><span className="pt-0.5">{s}</span></li>
      ))}
    </ol>
  </section>
);

export default function HowItWorks() {
  return (
    <>
      <PageHero eyebrow="Step by step" title="How LifeDrop works" subtitle="Simple for people who need blood, and for the donors who help them." />
      <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-5 md:grid-cols-2"><Steps title="For blood seekers" items={seekers} /><Steps title="For donors" items={donors} /></div>
      <div className="mt-8 flex flex-wrap gap-3"><Link to="/donors" className="btn btn-primary">Find donors</Link><Link to="/register" className="btn btn-outline">Become a donor</Link></div>
      <Disclaimer className="mt-6" />
      </div>
    </>
  );
}
