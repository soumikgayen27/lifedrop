import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Field, Logo } from '../../components/common/ui';

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
    <div className="mx-auto max-w-sm px-4 py-10">
      <Logo className="mb-5 justify-center" />
      <div className="card space-y-3 p-5">
        <h1 className="text-lg font-semibold">Forgot password</h1>
        {sent ? <p className="text-sm text-muted">If an account exists for <b>{email}</b>, a reset link is on its way. Check your inbox and spam folder.</p> : (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <p className="text-sm text-muted">Enter your email and we will send you a link to reset your password.</p>
            <Field label="Email"><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></Field>
            <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
          </form>
        )}
        <Link to="/login" className="block text-center text-sm text-brand">Back to login</Link>
      </div>
    </div>
  );
}
