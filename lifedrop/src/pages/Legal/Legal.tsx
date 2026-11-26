import { PageHero } from '../../components/common/ui';

const Sec = ({ t, children }: { t: string; children: string }) => (
  <section className="mb-6 last:mb-0"><h2 className="mb-1.5 font-display text-base font-bold text-navy-900">{t}</h2><p className="text-sm leading-relaxed text-navy-600">{children}</p></section>
);

export function Privacy() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="Template text for a student project – have it reviewed before real-world use." />
      <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card p-6 sm:p-8">
        <Sec t="What we collect">Account details (name, email, mobile number), and for donors: blood group, date of birth, gender, location (state, city, area, PIN code), availability and optional profile photo and introduction. Blood request details are collected from people who post requests.</Sec>
        <Sec t="What is public">Only donors who tick the public-listing consent appear in donor search, and only with name, photo, blood group, location, availability, last donation date and introduction. A mobile number is shown only if the donor separately allows it. Email, date of birth and gender are never public. Public blood requests never show patient names or contact numbers.</Sec>
        <Sec t="Sharing with request owners">When a donor expresses interest in a request, the request owner can see that donor's name, city and mobile number so they can coordinate.</Sec>
        <Sec t="Your control">You can change availability, privacy toggles and profile details at any time from your dashboard, and ask an administrator to remove your listing.</Sec>
        <Sec t="Security">Passwords are handled by Supabase Authentication and are never stored by LifeDrop. Data access is restricted with database Row Level Security.</Sec>
        <Sec t="Medical disclaimer">LifeDrop does not assess donor eligibility or guarantee blood availability. Eligibility is decided by qualified medical professionals.</Sec>
      </div>
      </div>
    </>
  );
}

export function Terms() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms and Conditions" subtitle="Template text for a student project – have it reviewed before real-world use." />
      <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card p-6 sm:p-8">
        <Sec t="Nature of the service">LifeDrop is a donor connection platform. It is not a blood bank, hospital or medical service, and it does not sell or broker blood.</Sec>
        <Sec t="Your responsibilities">Provide accurate information. Do not post false or fraudulent requests, harass donors, or misuse contact details. Donation must never be paid for or coerced.</Sec>
        <Sec t="Medical eligibility">Being listed does not mean a donor is medically fit. Hospitals and licensed medical professionals decide whether a donation can proceed.</Sec>
        <Sec t="Moderation">Administrators may verify, hide or remove listings and requests and may suspend accounts that break these terms.</Sec>
        <Sec t="Liability">LifeDrop does not guarantee that any request will be fulfilled. Use of the platform is at your own discretion.</Sec>
      </div>
      </div>
    </>
  );
}
