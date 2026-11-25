import { Logo } from './ui';

export default function SetupRequired() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Logo className="mb-6" />
      <div className="card space-y-3 p-6 text-sm">
        <h1 className="text-lg font-semibold">Connect LifeDrop to Supabase</h1>
        <p className="text-muted">LifeDrop stores real data and has no fake demo content, so it needs a Supabase project before it can run.</p>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Create a project at <b>supabase.com</b>.</li>
          <li>Run <code className="rounded bg-surface px-1">supabase/migrations/001_lifedrop_schema.sql</code> in the SQL editor.</li>
          <li>Copy <code className="rounded bg-surface px-1">.env.example</code> to <code className="rounded bg-surface px-1">.env</code> and fill in the URL, anon key and service-role key.</li>
          <li>Restart <code className="rounded bg-surface px-1">npm run dev</code>.</li>
        </ol>
        <p className="text-muted">Full instructions are in README.md.</p>
      </div>
    </main>
  );
}
