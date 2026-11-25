import RequestForm from '../../components/forms/RequestForm';
import { PageHead } from '../../components/common/ui';

export default function NewRequest() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <PageHead title="Request blood" subtitle="Matching available donors are notified inside LifeDrop. For emergencies, also contact the hospital blood bank directly." />
      <RequestForm />
    </div>
  );
}
