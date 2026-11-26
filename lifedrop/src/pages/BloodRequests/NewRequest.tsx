import RequestForm from '../../components/forms/RequestForm';
import { PageHero } from '../../components/common/ui';

export default function NewRequest() {
  return (
    <>
      <PageHero eyebrow="Emergency request" title="Request blood" subtitle="Matching available donors are notified inside LifeDrop. For emergencies, also contact the hospital blood bank directly." />
      <div className="mx-auto max-w-3xl px-4 py-8"><RequestForm /></div>
    </>
  );
}
