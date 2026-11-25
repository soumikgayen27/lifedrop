import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { contactSchema, ContactValues } from '../../lib/schemas';
import { api } from '../../services/api';
import { Field, PageHead } from '../../components/common/ui';

const faqs = [
  ['Is LifeDrop a blood bank?', 'No. We connect people with donors. Hospitals and blood banks handle screening and donation.'],
  ['Who can see my details?', 'Only what you allow. Email, date of birth and gender are never public, and your phone number is hidden unless you opt in.'],
  ['Does LifeDrop confirm a donor is eligible?', 'No. Eligibility is assessed by qualified medical professionals at the time of donation.'],
  ['Is it free?', 'Yes. Donating or receiving blood through LifeDrop must never involve payment.'],
];

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });
  const onSubmit = async (v: ContactValues) => {
    try { await api('/contact', { method: 'POST', body: v }); toast.success('Message sent. We will get back to you soon.'); reset(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <PageHead title="Contact us" subtitle="Questions, feedback or a listing you want removed? Write to us." />
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-3 p-5" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" error={errors.name?.message}><input className="input" autoComplete="name" {...register('name')} /></Field>
            <Field label="Email" error={errors.email?.message}><input className="input" type="email" autoComplete="email" {...register('email')} /></Field>
          </div>
          <Field label="Subject" error={errors.subject?.message}><input className="input" {...register('subject')} /></Field>
          <Field label="Message" error={errors.message?.message}><textarea rows={5} className="input" {...register('message')} /></Field>
          <button className="btn btn-primary" disabled={isSubmitting}><Send size={15} /> {isSubmitting ? 'Sending…' : 'Send message'}</button>
        </form>
        <aside className="space-y-3">
          <div className="card space-y-2 p-4 text-sm">
            <p className="flex items-center gap-2"><Mail size={15} className="text-brand" /> support@lifedrop.example</p>
            <p className="flex items-center gap-2"><Phone size={15} className="text-brand" /> +91 00000 00000</p>
            <p className="flex items-center gap-2"><MapPin size={15} className="text-brand" /> Kolkata, West Bengal, India</p>
            <p className="text-xs text-muted">Placeholder details – replace with your own. For medical emergencies call your local emergency number or the hospital directly.</p>
          </div>
          <div className="card p-4">
            <h2 className="mb-2 text-sm font-semibold">FAQs</h2>
            <div className="space-y-2">{faqs.map(([q, a]) => (
              <details key={q} className="rounded-md border border-line px-3 py-2 text-sm"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-1 text-muted">{a}</p></details>
            ))}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
