import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Field } from '../../components/common/ui';
import AuthShell from '../../components/layout/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error('Enter a valid email address.');
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    setBusy(false);
    if (error) return toast.error(error.message);
    setSent(true); // Same message whether or not the account exists.
  };

  return (
    <AuthShell title="Forgot password" subtitle="We will email you a link to reset it.">
      <div className="card space-y-4 p-6">
        {sent ? <p className="text-sm text-muted">If an account exists for <b className="text-ink">{email}</b>, a reset link is on its way. Check your inbox and spam folder.</p> : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            <p className="text-sm text-muted">Enter your email and we will send you a link to reset your password.</p>
            <Field label="Email"><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
            <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
          </form>
        )}
        <Link to="/login" className="block text-center text-sm font-semibold text-primary-700">Back to login</Link>
      </div>
    </AuthShell>
  );
}
