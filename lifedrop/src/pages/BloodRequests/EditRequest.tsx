import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAsync } from '../../hooks/useAsync';
import RequestForm from '../../components/forms/RequestForm';
import { EmptyState, ErrorState, PageHead, PageLoader } from '../../components/common/ui';
import type { BloodRequest } from '../../types';

export default function EditRequest() {
  const { id } = useParams();
  const { data, loading, error, reload } = useAsync(async () => {
    const { data, error } = await supabase.from('blood_requests').select('*').eq('id', id!).maybeSingle();
    if (error) throw new Error(error.message);
    return data as BloodRequest | null;
  }, [id]);
  return (
    <div className="max-w-3xl">
      <PageHead title="Edit blood request" subtitle="Changes do not re-notify donors." />
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data ? <EmptyState title="Request not found" action={<Link className="btn btn-outline btn-sm" to="/dashboard/requests">Back to my requests</Link>} />
        : <RequestForm initial={data} />}
    </div>
  );
}
