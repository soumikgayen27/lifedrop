import { Link } from 'react-router-dom';
import { HeartPulse, Eye, Target, Users, HandHeart } from 'lucide-react';
import { Disclaimer, PageHead } from '../../components/common/ui';

const blocks = [
  { i: Target, t: 'Our mission', d: 'Make it faster and less stressful to reach willing blood donors when a patient needs blood, by keeping donor information current and in one place.' },
  { i: Eye, t: 'Our vision', d: 'A community where no family has to search through scattered phone lists or social media posts to find a donor in an emergency.' },
  { i: HeartPulse, t: 'Why blood donation matters', d: 'Blood cannot be manufactured; it only comes from donors. Surgeries, accidents, childbirth complications, cancer care and conditions such as thalassaemia all depend on a steady supply.' },
  { i: Users, t: 'How LifeDrop helps', d: 'Donors register once, choose what is public and update availability. People seeking blood search by group and location or post a request that notifies matching donors.' },
  { i: HandHeart, t: 'Our commitment', d: 'Privacy-first design, donor-controlled visibility, admin moderation against fraudulent requests, and honest limits: we connect people, we do not replace blood banks or medical judgement.' },
];

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <PageHead title="About LifeDrop" subtitle="A community platform that connects people who need blood with registered donors." />
      <div className="grid gap-3 sm:grid-cols-2">
        {blocks.map(({ i: Icon, t, d }) => (
          <section key={t} className="card p-4">
            <div className="mb-2 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-md bg-brand-soft text-brand"><Icon size={16} /></span><h2 className="font-semibold">{t}</h2></div>
            <p className="text-sm text-ink/80">{d}</p>
          </section>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><Link to="/register" className="btn btn-primary">Become a donor</Link><Link to="/donors" className="btn btn-outline">Find donors</Link></div>
      <Disclaimer className="mt-5" />
    </div>
  );
}
