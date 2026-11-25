import { Link } from 'react-router-dom';
import { Disclaimer, PageHead } from '../../components/common/ui';

const seekers = ['Search for donors by blood group, city and PIN code.', 'Select matching, available donors.', 'Contact donors who share a phone number, or post a request so matching donors are notified.', 'Coordinate with the hospital, which confirms eligibility and arranges the donation.'];
const donors = ['Register with your blood group and location.', 'Complete your profile and choose your privacy settings.', 'Keep your availability up to date.', 'Respond to blood requests – express interest or decline.'];

const Steps = ({ title, items }: { title: string; items: string[] }) => (
  <section className="card p-5">
    <h2 className="mb-3 font-semibold">{title}</h2>
    <ol className="space-y-3">
      {items.map((s, i) => (
        <li key={s} className="flex gap-3 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold text-white">{i + 1}</span><span>{s}</span></li>
      ))}
    </ol>
  </section>
);

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PageHead title="How LifeDrop works" />
      <div className="grid gap-4 md:grid-cols-2"><Steps title="For blood seekers" items={seekers} /><Steps title="For donors" items={donors} /></div>
      <div className="mt-4 flex flex-wrap gap-2"><Link to="/donors" className="btn btn-primary">Find donors</Link><Link to="/register" className="btn btn-outline">Become a donor</Link></div>
      <Disclaimer className="mt-5" />
    </div>
  );
}
