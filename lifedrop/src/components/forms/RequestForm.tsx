import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { BLOOD_GROUPS, PRIORITIES, STATES } from '../../lib/constants';
import { requestSchema, RequestValues } from '../../lib/schemas';
import { supabase } from '../../lib/supabase';
import { api } from '../../services/api';
import { cap, todayISO } from '../../utils/format';
import { Disclaimer, Field } from '../common/ui';
import type { BloodRequest } from '../../types';

export default function RequestForm({ initial }: { initial?: BloodRequest }) {
  const nav = useNavigate();
  const editing = Boolean(initial);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema) as any,
    defaultValues: initial
      ? { ...initial, message: initial.message ?? '' } as unknown as RequestValues
      : { priority: 'normal', units: 1 } as Partial<RequestValues> as RequestValues,
  });

  const onSubmit = async (v: RequestValues) => {
    try {
      if (initial) {
        const { error } = await supabase.from('blood_requests').update({ ...v, message: v.message || null }).eq('id', initial.id);
        if (error) throw new Error(error.message);
        toast.success('Request updated');
      } else {
        const res = await api<{ request: { request_code: string }; notified: number }>('/requests', { method: 'POST', body: v });
        toast.success(`Request ${res.request.request_code} submitted`, {
          description: res.notified ? `${res.notified} matching available donor${res.notified > 1 ? 's were' : ' was'} notified.` : 'No available donors matched yet. Your request is visible on the requests page.',
        });
      }
      nav('/dashboard/requests');
    } catch (e: any) {
      toast.error(e.message ?? 'Could not save the request');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5 p-5" noValidate>
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Patient and blood requirement</legend>
        <Field label="Patient name" error={errors.patient_name?.message}><input className="input" {...register('patient_name')} /></Field>
        <Field label="Required blood group" error={errors.blood_group?.message}>
          <select className="input" {...register('blood_group')}><option value="">Select</option>{BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}</select>
        </Field>
        <Field label="Required units" error={errors.units?.message}><input type="number" min={1} max={20} className="input" {...register('units')} /></Field>
        <Field label="Required date" error={errors.required_date?.message}><input type="date" min={todayISO()} className="input" {...register('required_date')} /></Field>
        <Field label="Emergency priority" error={errors.priority?.message}>
          <select className="input" {...register('priority')}>{PRIORITIES.map((p) => <option key={p} value={p}>{cap(p)}</option>)}</select>
        </Field>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Hospital</legend>
        <Field label="Hospital name" error={errors.hospital_name?.message}><input className="input" {...register('hospital_name')} /></Field>
        <Field label="Hospital address" error={errors.hospital_address?.message}><input className="input" {...register('hospital_address')} /></Field>
        <Field label="State" error={errors.state?.message}><select className="input" {...register('state')}><option value="">Select</option>{STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="City" error={errors.city?.message}><input className="input" {...register('city')} /></Field>
        <Field label="PIN code" error={errors.pin_code?.message}><input className="input" inputMode="numeric" maxLength={6} {...register('pin_code')} /></Field>
      </fieldset>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Contact</legend>
        <Field label="Contact person" error={errors.contact_person?.message}><input className="input" {...register('contact_person')} /></Field>
        <Field label="Contact number" error={errors.contact_number?.message} hint="Shown only to donors you are matched with, never publicly."><input className="input" inputMode="tel" maxLength={10} {...register('contact_number')} /></Field>
        <Field label="Additional message (optional)" error={errors.message?.message} className="sm:col-span-2"><textarea rows={3} className="input" {...register('message')} /></Field>
      </fieldset>

      <Disclaimer />
      <div className="flex gap-2">
        <button className="btn btn-primary" disabled={isSubmitting}><Send size={15} /> {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Submit request'}</button>
        <button type="button" className="btn btn-outline" onClick={() => nav(-1)}>Cancel</button>
      </div>
    </form>
  );
}
