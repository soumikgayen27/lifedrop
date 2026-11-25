import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email: z.string().trim().email('Enter a valid email').max(120),
  subject: z.string().trim().min(3, 'Enter a subject').max(120),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
});

export async function submitContact(req: Request, res: Response) {
  const input = contactSchema.parse(req.body);
  const { error } = await supabase.from('contact_messages').insert(input);
  if (error) throw error;
  res.status(201).json({ ok: true });
}
