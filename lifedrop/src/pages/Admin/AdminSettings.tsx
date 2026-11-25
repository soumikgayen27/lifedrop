import { useAuth } from '../../contexts/AuthContext';
import { PageHead } from '../../components/common/ui';

export default function AdminSettings() {
  const { profile } = useAuth();
  return (
    <div className="max-w-2xl space-y-4">
      <PageHead title="Admin settings" />
      <section className="card p-4 text-sm"><h2 className="mb-1 font-semibold">Signed in as</h2><p>{profile?.full_name} · {profile?.email}</p></section>
      <section className="card space-y-2 p-4 text-sm">
        <h2 className="font-semibold">Adding or removing administrators</h2>
        <p className="text-muted">Admin rights are stored in the <code className="rounded bg-surface px-1">admin_roles</code> table and can only be changed with SQL (service role). This prevents any in-app privilege escalation. Use <code className="rounded bg-surface px-1">supabase/seed_admin.sql</code>.</p>
      </section>
      <section className="card space-y-2 p-4 text-sm">
        <h2 className="font-semibold">Security reminders</h2>
        <ul className="list-disc space-y-1 pl-5 text-muted"><li>Admin API routes re-check admin status in the database on every request.</li><li>Keep the service-role key on the server only.</li><li>Suspended users cannot post requests or respond to them.</li></ul>
      </section>
    </div>
  );
}
