import type { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { BLOOD_GROUPS, PRIORITIES, phoneRx, pinRx } from '../config/constants';
import type { AuthedRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errors';
import { notifyMatchingDonors } from '../services/notifications';

const text = (min: number, max: number, label: string) =>
  z.string().trim().min(min, `${label} is required`).max(max, `${label} is too long`);

export const requestSchema = z.object({
  patient_name: text(2, 100, 'Patient name'),
  blood_group: z.enum(BLOOD_GROUPS),
  hospital_name: text(2, 150, 'Hospital name'),
  hospital_address: text(5, 250, 'Hospital address'),
  state: text(2, 60, 'State'),
  city: text(2, 60, 'City'),
  pin_code: z.string().trim().regex(pinRx, 'Enter a valid 6-digit PIN code'),
  units: z.coerce.number().int().min(1, 'At least 1 unit').max(20, 'Maximum 20 units'),
  required_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date'),
  contact_person: text(2, 80, 'Contact person'),
  contact_number: z.string().trim().regex(phoneRx, 'Enter a valid 10-digit mobile number'),
  priority: z.enum(PRIORITIES),
  message: z.string().trim().max(500).optional().or(z.literal('')),
});

export async function createRequest(req: AuthedRequest, res: Response) {
  const input = requestSchema.parse(req.body);
  const today = new Date().toISOString().slice(0, 10);
  if (input.required_date < today) throw new HttpError(400, 'Required date cannot be in the past.');

  const { data, error } = await supabase
    .from('blood_requests')
    .insert({ ...input, message: input.message || null, requester_id: req.user!.id })
    .select()
    .single();
  if (error) throw error;

  let notified = 0;
  try {
    notified = await notifyMatchingDonors(data);
  } catch (e) {
    // The request itself is saved; a notification failure must not lose it.
    console.error('[notify] failed', e);
  }
  res.status(201).json({ request: data, notified });
}
