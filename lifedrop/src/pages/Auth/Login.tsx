import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import { loginSchema } from '../../lib/schemas';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Field } from '../../components/common/ui';
import AuthShell from '../../components/layout/AuthShell';
import { z } from 'zod';

type V = z.infer<typeof loginSchema>;

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { session } = useAuth();
  const from = (loc.state as { from?: string } | null)?.from ?? '/dashboard';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<V>({ resolver: zodResolver(loginSchema) });

  if (session) return <Navigate to={from} replace />;

  const onSubmit = async (v: V) => {
    const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
      return;
    }
    toast.success('Welcome back!');
    nav(from, { replace: true });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your profile, availability and blood requests.">
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-6" noValidate>
        <Field label="Email" error={errors.email?.message}><input type="email" autoComplete="email" className="input" {...register('email')} /></Field>
        <Field label="Password" error={errors.password?.message}><input type="password" autoComplete="current-password" className="input" {...register('password')} /></Field>
        <div className="text-right text-xs"><Link to="/forgot-password" className="font-semibold text-primary-700 hover:underline">Forgot password?</Link></div>
        <button className="btn btn-primary w-full" disabled={isSubmitting}><LogIn size={16} /> {isSubmitting ? 'Logging in…' : 'Log in'}</button>
        <p className="text-center text-sm text-muted">New here? <Link to="/register" className="font-semibold text-primary-700">Create an account</Link></p>
      </form>
    </AuthShell>
  );
}
