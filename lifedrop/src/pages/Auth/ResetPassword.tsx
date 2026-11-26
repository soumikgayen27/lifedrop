import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { password } from '../../lib/schemas';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Field, PageLoader } from '../../components/common/ui';
import AuthShell from '../../components/layout/AuthShell';

const schema = z.object({ password, confirm: z.string() }).refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type V = z.infer<typeof schema>;

export default function ResetPassword() {
  const { session, loading } = useAuth();
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(schema) });
  const onSubmit = async (v: V) => {
    const { error } = await supabase.auth.updateUser({ password: v.password });
    if (error) return toast.error(error.message);
    toast.success('Password updated');
    nav('/dashboard');
  };
  if (loading) return <PageLoader />;
  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you have not used before.">
      <div className="card space-y-4 p-6">
        {!session ? (
          <p className="text-sm text-muted">Open the reset link from your email on this device to continue. The link may have expired – <Link to="/forgot-password" className="font-semibold text-primary-700">request a new one</Link>.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="New password" error={errors.password?.message}><input type="password" autoComplete="new-password" className="input" {...register('password')} /></Field>
            <Field label="Confirm password" error={errors.confirm?.message}><input type="password" autoComplete="new-password" className="input" {...register('confirm')} /></Field>
            <button className="btn btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Update password'}</button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
