import { useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { BLOOD_GROUPS, STATES } from '../../lib/constants';
import { profileSchema, ProfileValues } from '../../lib/schemas';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useMyDonor } from '../../hooks/useMyDonor';
import { Avatar, ErrorState, Field, PageHead, PageLoader } from '../../components/common/ui';

export default function EditProfile() {
  const { profile, session, refreshProfile } = useAuth();
  const { data: donor, loading, error, reload } = useMyDonor();
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema) as unknown as Resolver<ProfileValues> });

  useEffect(() => {
    if (loading || !profile) return;
    reset({
      full_name: profile.full_name, phone: profile.phone ?? '', is_donor: Boolean(donor),
      date_of_birth: donor?.date_of_birth ?? '', gender: donor?.gender ?? '', blood_group: donor?.blood_group ?? '',
      last_donation_date: donor?.last_donation_date ?? '', state: donor?.state ?? '', city: donor?.city ?? '',
      area: donor?.area ?? '', pin_code: donor?.pin_code ?? '', bio: donor?.bio ?? '',
      show_in_public: donor?.show_in_public ?? true, show_phone: donor?.show_phone ?? false,
    });
  }, [loading, donor, profile, reset]);

  const isDonor = watch('is_donor');
  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const onSubmit = async (v: ProfileValues) => {
    const uid = session!.user.id;
    try {
      let avatar_url = profile?.avatar_url ?? null;
      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const path = `${uid}/avatar.${ext}`;
        const up = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
        if (up.error) throw new Error(up.error.message);
        avatar_url = `${supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
      }
      const p = await supabase.from('profiles').update({ full_name: v.full_name, phone: v.phone, avatar_url, role: v.is_donor ? 'donor' : 'user' }).eq('id', uid);
      if (p.error) throw new Error(p.error.message);

      if (v.is_donor) {
        const row = {
          user_id: uid, blood_group: v.blood_group, date_of_birth: v.date_of_birth || null, gender: v.gender || null,
          last_donation_date: v.last_donation_date || null, state: v.state, city: v.city, area: v.area, pin_code: v.pin_code,
          bio: v.bio || null, show_in_public: v.show_in_public, show_phone: v.show_phone,
        };
        const d = donor
          ? await supabase.from('donors').update(row).eq('user_id', uid)
          : await supabase.from('donors').insert({ ...row, availability: 'available' });
        if (d.error) throw new Error(d.error.message);
      }
      await refreshProfile();
      reload();
      setFile(null);
      toast.success('Profile saved');
    } catch (e: any) { toast.error(e.message ?? 'Could not save your profile'); }
  };

  return (
    <div className="max-w-3xl">
      <PageHead title="Edit profile" />
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-5" noValidate>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold">Personal</legend>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Avatar name={profile?.full_name ?? ''} src={file ? URL.createObjectURL(file) : profile?.avatar_url} size={56} />
            <Field label="Profile image (max 2 MB)" error={fileErr} className="flex-1">
              <input type="file" accept="image/*" className="input" onChange={(e) => {
                const f = e.target.files?.[0] ?? null; setFileErr('');
                if (f && (!f.type.startsWith('image/') || f.size > 2 * 1024 * 1024)) { setFileErr('Choose an image under 2 MB.'); setFile(null); } else setFile(f);
              }} />
            </Field>
          </div>
          <Field label="Full name" error={errors.full_name?.message}><input className="input" {...register('full_name')} /></Field>
          <Field label="Mobile number" error={errors.phone?.message}><input className="input" inputMode="tel" maxLength={10} {...register('phone')} /></Field>
          <p className="text-xs text-muted sm:col-span-2">Email ({profile?.email}) is your login and can't be changed here.</p>
        </fieldset>

        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...register('is_donor')} /> I am a blood donor</label>

        {isDonor && (<>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold">Blood information</legend>
            <Field label="Blood group" error={errors.blood_group?.message} hint="Changing this removes your verified badge."><select className="input" {...register('blood_group')}><option value="">Select</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select></Field>
            <Field label="Last donation date" error={errors.last_donation_date?.message}><input type="date" className="input" {...register('last_donation_date')} /></Field>
            <Field label="Date of birth" error={errors.date_of_birth?.message}><input type="date" className="input" {...register('date_of_birth')} /></Field>
            <Field label="Gender"><select className="input" {...register('gender')}><option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></Field>
          </fieldset>
          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="mb-2 text-sm font-semibold">Location</legend>
            <Field label="State" error={errors.state?.message}><select className="input" {...register('state')}><option value="">Select</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="City" error={errors.city?.message}><input className="input" {...register('city')} /></Field>
            <Field label="Area" error={errors.area?.message}><input className="input" {...register('area')} /></Field>
            <Field label="PIN code" error={errors.pin_code?.message}><input className="input" inputMode="numeric" maxLength={6} {...register('pin_code')} /></Field>
            <Field label="Short introduction" error={errors.bio?.message} className="sm:col-span-2"><textarea rows={2} className="input" {...register('bio')} /></Field>
          </fieldset>
          <fieldset className="space-y-2 text-sm">
            <legend className="mb-2 text-sm font-semibold">Privacy</legend>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('show_in_public')} /> Show my profile in public donor search</label>
            <label className="flex items-center gap-2"><input type="checkbox" {...register('show_phone')} /> Show my mobile number on my public profile</label>
          </fieldset>
        </>)}
        <button className="btn btn-primary" disabled={isSubmitting}><Save size={15} /> {isSubmitting ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  );
}
