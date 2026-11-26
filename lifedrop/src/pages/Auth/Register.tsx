import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { BLOOD_GROUPS, STATES } from '../../lib/constants';
import { donorRegisterSchema, DonorRegisterValues, userRegisterSchema } from '../../lib/schemas';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { cx, Disclaimer, Field } from '../../components/common/ui';
import AuthShell from '../../components/layout/AuthShell';

export default function Register() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'donor' | 'user'>(params.get('type') === 'user' ? 'user' : 'donor');
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState('');
  const nav = useNavigate();
  const { session } = useAuth();
  const donor = mode === 'donor';

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<DonorRegisterValues>({
    resolver: zodResolver(donor ? donorRegisterSchema : userRegisterSchema) as unknown as Resolver<DonorRegisterValues>,
    defaultValues: { availability: 'available', show_in_public: true, show_phone: false, agree_terms: false, agree_privacy: false } as Partial<DonorRegisterValues> as DonorRegisterValues,
  });

  if (session) return <Navigate to="/dashboard" replace />;

  const pickFile = (f: File | null) => {
    setFileErr('');
    if (f && (!f.type.startsWith('image/') || f.size > 2 * 1024 * 1024)) { setFileErr('Choose an image under 2 MB.'); setFile(null); return; }
    setFile(f);
  };

  const onSubmit = async (v: DonorRegisterValues) => {
    const data: Record<string, unknown> = { full_name: v.full_name, phone: v.phone, role: mode };
    if (donor) Object.assign(data, {
      blood_group: v.blood_group, date_of_birth: v.date_of_birth, gender: v.gender, last_donation_date: v.last_donation_date || '',
      availability: v.availability, state: v.state, city: v.city, area: v.area, pin_code: v.pin_code, bio: v.bio || '',
      show_in_public: v.show_in_public, show_phone: v.show_phone,
    });
    const { data: res, error } = await supabase.auth.signUp({
      email: v.email.trim(), password: v.password,
      options: { data, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      const dup = /already/i.test(error.message);
      if (dup) setError('email', { message: 'An account with this email already exists.' });
      return void toast.error(dup ? 'This email is already registered. Try logging in.' : error.message);
    }
    // With e-mail confirmation on, an existing address returns a user with no identities.
    if (res.user && res.user.identities?.length === 0) {
      setError('email', { message: 'An account with this email already exists.' });
      return void toast.error('This email is already registered. Try logging in.');
    }
    if (res.session && res.user) {
      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `${res.user.id}/avatar.${ext}`;
        const up = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
        if (!up.error) {
          const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
          await supabase.from('profiles').update({ avatar_url: `${url}?v=${Date.now()}` }).eq('id', res.user.id);
        } else toast.warning('Account created, but the photo upload failed. You can add it later from Edit Profile.');
      }
      toast.success('Welcome to LifeDrop!');
      nav('/dashboard');
    } else {
      toast.success('Account created. Check your email to confirm it, then log in.', { duration: 8000 });
      nav('/login');
    }
  };

  return (
    <AuthShell wide title={donor ? 'Register as a donor' : 'Create an account'} subtitle="Join the network – it takes a couple of minutes.">
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 text-sm font-semibold shadow-card ring-1 ring-navy-100" role="tablist">
        {([['donor', 'I want to donate'], ['user', 'I need blood (basic account)']] as const).map(([m, l]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cx('rounded-xl px-3 py-2.5 font-display transition-colors', mode === m ? 'bg-primary-600 text-white shadow-glow-sm' : 'text-navy-600 hover:bg-navy-50')}>{l}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6 p-5 sm:p-6" noValidate>

        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-3 font-display text-sm font-bold text-navy-900">Personal information</legend>
          <Field label="Full name" error={errors.full_name?.message}><input className="input" autoComplete="name" {...register('full_name')} /></Field>
          <Field label="Email address" error={errors.email?.message}><input type="email" className="input" autoComplete="email" {...register('email')} /></Field>
          <Field label="Mobile number" error={errors.phone?.message} hint="10 digits, starting with 6–9"><input className="input" inputMode="tel" maxLength={10} autoComplete="tel-national" {...register('phone')} /></Field>
          {donor && <>
            <Field label="Date of birth" error={errors.date_of_birth?.message}><input type="date" className="input" {...register('date_of_birth')} /></Field>
            <Field label="Gender" error={errors.gender?.message}><select className="input" {...register('gender')}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></Field>
          </>}
          <Field label="Password" error={errors.password?.message} hint="8+ characters with upper, lower case and a number"><input type="password" className="input" autoComplete="new-password" {...register('password')} /></Field>
          <Field label="Confirm password" error={errors.confirm_password?.message}><input type="password" className="input" autoComplete="new-password" {...register('confirm_password')} /></Field>
        </fieldset>

        {donor && <>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-3 font-display text-sm font-bold text-navy-900">Blood information</legend>
            <Field label="Blood group" error={errors.blood_group?.message}><select className="input" {...register('blood_group')}><option value="">Select</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Last blood donation date (optional)" error={errors.last_donation_date?.message}><input type="date" className="input" {...register('last_donation_date')} /></Field>
            <Field label="Donation availability" error={errors.availability?.message}><select className="input" {...register('availability')}><option value="available">Available</option><option value="unavailable">Temporarily unavailable</option></select></Field>
          </fieldset>

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-3 font-display text-sm font-bold text-navy-900">Location</legend>
            <Field label="State" error={errors.state?.message}><select className="input" {...register('state')}><option value="">Select</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="City" error={errors.city?.message}><input className="input" {...register('city')} /></Field>
            <Field label="Area" error={errors.area?.message}><input className="input" {...register('area')} /></Field>
            <Field label="PIN code" error={errors.pin_code?.message}><input className="input" inputMode="numeric" maxLength={6} {...register('pin_code')} /></Field>
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="mb-3 font-display text-sm font-bold text-navy-900">Additional information</legend>
            <Field label="Profile image (optional, max 2 MB)" error={fileErr}><input type="file" accept="image/*" className="input" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} /></Field>
            <Field label="Short introduction (optional)" error={errors.bio?.message}><textarea rows={2} className="input" {...register('bio')} /></Field>
          </fieldset>
        </>}

        <fieldset className="space-y-2 text-sm">
          <legend className="mb-3 font-display text-sm font-bold text-navy-900">Consent</legend>
          {donor && <>
            <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" {...register('show_in_public')} /><span>Show my donor profile in public donor search. <span className="text-muted">(Leave unticked to stay private – you can still receive requests.)</span></span></label>
            <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" {...register('show_phone')} /><span>Also show my mobile number on my public profile.</span></label>
          </>}
          <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" {...register('agree_terms')} /><span>I agree to the <Link to="/terms" target="_blank" className="font-semibold text-primary-700 underline">Terms and Conditions</Link>.</span></label>
          {errors.agree_terms && <p role="alert" className="text-xs font-medium text-primary-700">{errors.agree_terms.message}</p>}
          <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" {...register('agree_privacy')} /><span>I agree to the <Link to="/privacy" target="_blank" className="font-semibold text-primary-700 underline">Privacy Policy</Link>.</span></label>
          {errors.agree_privacy && <p role="alert" className="text-xs font-medium text-primary-700">{errors.agree_privacy.message}</p>}
        </fieldset>

        <Disclaimer />
        <button className="btn btn-primary w-full" disabled={isSubmitting}><UserPlus size={15} /> {isSubmitting ? 'Creating account…' : 'Create account'}</button>
        <p className="text-center text-sm text-muted">Already registered? <Link to="/login" className="font-semibold text-primary-700">Log in</Link></p>
      </form>
    </AuthShell>
  );
}
