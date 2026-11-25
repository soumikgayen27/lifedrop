import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { password } from '../../lib/schemas';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Field, PageHead } from '../../components/common/ui';

const schema = z.object({ password, confirm: z.string() }).refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type V = z.infer<typeof schema>;

export default function Settings() {
  const { profile, signOut } = useAuth();
  const nav = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });
  const onSubmit = async (v: V) => {
    const { error } = await supabase.auth.updateUser({ password: v.password });
    if (error) return toast.error(error.message);
    toast.success('Password updated'); reset();
  };
  return (
    <div className="max-w-xl space-y-4">
      <PageHead title="Settings" />
      <section className="card p-4 text-sm">
        <h2 className="mb-1 font-semibold">Account</h2>
        <p className="text-muted">Signed in as <b className="text-ink">{profile?.email}</b></p>
        <p className="mt-2 text-muted">Profile details and public-visibility choices live in <Link to="/dashboard/profile/edit" className="text-brand">Edit Profile</Link>. To delete your account or listing, <Link to="/contact" className="text-brand">contact us</Link>.</p>
      </section>
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-3 p-4" noValidate>
        <h2 className="font-semibold">Change password</h2>
        <Field label="New password" error={errors.password?.message}><input type="password" autoComplete="new-password" className="input" {...register('password')} /></Field>
        <Field label="Confirm new password" error={errors.confirm?.message}><input type="password" autoComplete="new-password" className="input" {...register('confirm')} /></Field>
        <button className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Update password'}</button>
      </form>
      <button className="btn btn-danger" onClick={async () => { await signOut(); nav('/'); }}>Log out</button>
    </div>
  );
}
