import { z } from 'zod';
import { BLOOD_GROUPS, PRIORITIES } from './constants';

export const phoneRx = /^[6-9]\d{9}$/;
export const pinRx = /^[1-9]\d{5}$/;

const phone = z.string().trim().regex(phoneRx, 'Enter a valid 10-digit mobile number');
const pin = z.string().trim().regex(pinRx, 'Enter a valid 6-digit PIN code');
const req = (label: string, max = 100) => z.string().trim().min(1, `${label} is required`).max(max);
const optDate = z.string().optional().or(z.literal(''));
const today = () => new Date().toISOString().slice(0, 10);

export const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/\d/, 'Add a number');

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

const account = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  phone,
  password,
  confirm_password: z.string().min(1, 'Confirm your password'),
  agree_terms: z.boolean().refine((v) => v, 'You must accept the Terms and Conditions'),
  agree_privacy: z.boolean().refine((v) => v, 'You must accept the Privacy Policy'),
});

const donorFields = z.object({
  date_of_birth: z.string().min(1, 'Date of birth is required').refine((d) => {
    const dob = new Date(d); const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
    return age >= 18 && age <= 65;
  }, 'Donors must be between 18 and 65 years old'),
  gender: z.enum(['male', 'female', 'other'], { errorMap: () => ({ message: 'Select your gender' }) }),
  blood_group: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: 'Select your blood group' }) }),
  last_donation_date: optDate.refine((d) => !d || d <= today(), 'Date cannot be in the future'),
  availability: z.enum(['available', 'unavailable']),
  state: req('State'),
  city: req('City', 60),
  area: req('Area', 80),
  pin_code: pin,
  bio: z.string().trim().max(300, 'Keep it under 300 characters').optional().or(z.literal('')),
  show_in_public: z.boolean(),
  show_phone: z.boolean(),
});

const match = (v: { password: string; confirm_password: string }, ctx: z.RefinementCtx) => {
  if (v.password !== v.confirm_password) ctx.addIssue({ code: 'custom', path: ['confirm_password'], message: 'Passwords do not match' });
};

export const donorRegisterSchema = account.merge(donorFields).superRefine(match);
export const userRegisterSchema = account.superRefine(match);
export type DonorRegisterValues = z.infer<typeof donorRegisterSchema>;

export const requestSchema = z.object({
  patient_name: req('Patient name'),
  blood_group: z.enum(BLOOD_GROUPS, { errorMap: () => ({ message: 'Select the required blood group' }) }),
  hospital_name: req('Hospital name', 150),
  hospital_address: req('Hospital address', 250),
  state: req('State'),
  city: req('City', 60),
  pin_code: pin,
  units: z.coerce.number({ invalid_type_error: 'Enter number of units' }).int().min(1, 'At least 1 unit').max(20, 'Maximum 20 units'),
  required_date: z.string().min(1, 'Required date is needed'),
  contact_person: req('Contact person', 80),
  contact_number: phone,
  priority: z.enum(PRIORITIES),
  message: z.string().trim().max(500, 'Keep it under 500 characters').optional().or(z.literal('')),
});
export type RequestValues = z.infer<typeof requestSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().email('Enter a valid email'),
  subject: z.string().trim().min(3, 'Enter a subject').max(120),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Enter your full name').max(80),
  phone,
  is_donor: z.boolean(),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  blood_group: z.string().optional().or(z.literal('')),
  last_donation_date: optDate.refine((d) => !d || d <= today(), 'Date cannot be in the future'),
  state: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  area: z.string().optional().or(z.literal('')),
  pin_code: z.string().optional().or(z.literal('')),
  bio: z.string().trim().max(300, 'Keep it under 300 characters').optional().or(z.literal('')),
  show_in_public: z.boolean(),
  show_phone: z.boolean(),
}).superRefine((v, ctx) => {
  if (!v.is_donor) return;
  const need = (k: keyof typeof v, msg: string) => { if (!v[k]) ctx.addIssue({ code: 'custom', path: [k], message: msg }); };
  need('blood_group', 'Select your blood group');
  need('state', 'State is required');
  need('city', 'City is required');
  need('area', 'Area is required');
  if (!pinRx.test(v.pin_code ?? '')) ctx.addIssue({ code: 'custom', path: ['pin_code'], message: 'Enter a valid 6-digit PIN code' });
  if (v.date_of_birth) {
    const age = (Date.now() - new Date(v.date_of_birth).getTime()) / 31557600000;
    if (age < 18 || age > 65) ctx.addIssue({ code: 'custom', path: ['date_of_birth'], message: 'Donors must be between 18 and 65 years old' });
  }
});
export type ProfileValues = z.infer<typeof profileSchema>;
