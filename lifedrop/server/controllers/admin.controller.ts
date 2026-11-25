import type { Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import type { AuthedRequest } from '../middleware/auth';
import { HttpError } from '../middleware/errors';

const PAGE = 20;
const esc = (s: string) => s.replace(/[%_,()\\]/g, '');
const page = (q: Request['query']) => Math.max(1, Number(q.page) || 1);
const range = (p: number) => [(p - 1) * PAGE, p * PAGE - 1] as const;
const count = async (table: string, filter?: (q: any) => any) => {
  let q: any = supabase.from(table).select('*', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return (c ?? 0) as number;
};

export async function stats(_req: Request, res: Response) {
  const [users, donors, available, requests, pending, completed, unread] = await Promise.all([
    count('profiles'),
    count('donors', (q) => q.eq('status', 'active')),
    count('donors', (q) => q.eq('status', 'active').eq('availability', 'available')),
    count('blood_requests', (q) => q.neq('status', 'removed')),
    count('blood_requests', (q) => q.eq('status', 'open')),
    count('blood_requests', (q) => q.eq('status', 'fulfilled')),
    count('contact_messages', (q) => q.eq('status', 'new')),
  ]);
  const { data: rows } = await supabase.from('blood_requests').select('blood_group').neq('status', 'removed').limit(10000);
  const byGroup: Record<string, number> = {};
  (rows ?? []).forEach((r: any) => { byGroup[r.blood_group] = (byGroup[r.blood_group] ?? 0) + 1; });
  res.json({
    users, donors, availableDonors: available, requests, pendingRequests: pending,
    completedRequests: completed, newMessages: unread,
    requestsByGroup: Object.entries(byGroup).map(([group, total]) => ({ group, total })),
  });
}

export async function listUsers(req: Request, res: Response) {
  const p = page(req.query);
  const [from, to] = range(p);
  let q = supabase.from('profiles').select('id, full_name, email, phone, role, is_suspended, created_at', { count: 'exact' });
  const s = esc(String(req.query.search ?? '').trim());
  if (s) q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%`);
  if (req.query.role === 'donor' || req.query.role === 'user') q = q.eq('role', String(req.query.role));
  if (req.query.suspended === 'true') q = q.eq('is_suspended', true);
  const { data, count: total, error } = await q.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  res.json({ items: data, total: total ?? 0, pageSize: PAGE });
}

export async function setSuspended(req: AuthedRequest, res: Response) {
  const { suspended } = z.object({ suspended: z.boolean() }).parse(req.body);
  const id = z.string().uuid().parse(req.params.id);
  if (id === req.user!.id) throw new HttpError(400, 'You cannot suspend your own account.');
  const { data: isAdm } = await supabase.from('admin_roles').select('user_id').eq('user_id', id).maybeSingle();
  if (isAdm) throw new HttpError(400, 'Administrator accounts cannot be suspended here.');
  const { error } = await supabase.from('profiles').update({ is_suspended: suspended }).eq('id', id);
  if (error) throw error;
  res.json({ ok: true });
}

export async function listDonors(req: Request, res: Response) {
  const p = page(req.query);
  const [from, to] = range(p);
  let q = supabase
    .from('donors')
    .select('id, blood_group, state, city, area, pin_code, availability, show_in_public, is_verified, status, created_at, profiles!inner(full_name, email, phone)', { count: 'exact' });
  const s = esc(String(req.query.search ?? '').trim());
  if (s) q = q.or(`city.ilike.%${s}%,pin_code.ilike.%${s}%`);
  if (req.query.blood_group) q = q.eq('blood_group', String(req.query.blood_group));
  if (req.query.verified === 'true') q = q.eq('is_verified', true);
  if (req.query.verified === 'false') q = q.eq('is_verified', false);
  if (req.query.status === 'active' || req.query.status === 'removed') q = q.eq('status', String(req.query.status));
  const { data, count: total, error } = await q.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  res.json({ items: data, total: total ?? 0, pageSize: PAGE });
}

export async function updateDonor(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const patch = z.object({
    is_verified: z.boolean().optional(),
    status: z.enum(['active', 'removed']).optional(),
    availability: z.enum(['available', 'unavailable']).optional(),
  }).refine((v) => Object.keys(v).length > 0, 'Nothing to update').parse(req.body);
  const { error } = await supabase.from('donors').update(patch).eq('id', id);
  if (error) throw error;
  res.json({ ok: true });
}

export async function listRequests(req: Request, res: Response) {
  const p = page(req.query);
  const [from, to] = range(p);
  let q = supabase.from('blood_requests').select('id, request_code, patient_name, blood_group, hospital_name, city, state, units, priority, status, required_date, contact_person, contact_number, created_at', { count: 'exact' });
  for (const k of ['status', 'priority', 'blood_group'] as const) if (req.query[k]) q = q.eq(k, String(req.query[k]));
  const s = esc(String(req.query.search ?? '').trim());
  if (s) q = q.or(`city.ilike.%${s}%,hospital_name.ilike.%${s}%,request_code.ilike.%${s}%`);
  const { data, count: total, error } = await q.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  res.json({ items: data, total: total ?? 0, pageSize: PAGE });
}

export async function updateRequestStatus(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const { status } = z.object({ status: z.enum(['open', 'fulfilled', 'cancelled', 'removed']) }).parse(req.body);
  const { error } = await supabase.from('blood_requests').update({ status }).eq('id', id);
  if (error) throw error;
  res.json({ ok: true });
}

export async function listMessages(req: Request, res: Response) {
  const p = page(req.query);
  const [from, to] = range(p);
  let q = supabase.from('contact_messages').select('*', { count: 'exact' });
  if (req.query.status === 'new' || req.query.status === 'resolved') q = q.eq('status', String(req.query.status));
  const { data, count: total, error } = await q.order('created_at', { ascending: false }).range(from, to);
  if (error) throw error;
  res.json({ items: data, total: total ?? 0, pageSize: PAGE });
}

export async function updateMessage(req: Request, res: Response) {
  const id = z.string().uuid().parse(req.params.id);
  const { status } = z.object({ status: z.enum(['new', 'resolved']) }).parse(req.body);
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  if (error) throw error;
  res.json({ ok: true });
}

export async function reports(_req: Request, res: Response) {
  const since = new Date(); since.setDate(1); since.setMonth(since.getMonth() - 5);
  const [{ data: reqs }, { data: donors }] = await Promise.all([
    supabase.from('blood_requests').select('city, status, priority, created_at').neq('status', 'removed').limit(10000),
    supabase.from('donors').select('blood_group, city, availability').eq('status', 'active').limit(10000),
  ]);
  const tally = (rows: any[], key: string) =>
    Object.entries(rows.reduce((a: Record<string, number>, r) => { const k = String(r[key]).trim(); a[k] = (a[k] ?? 0) + 1; return a; }, {}))
      .map(([name, total]) => ({ name, total: total as number })).sort((a, b) => b.total - a.total);

  const months: { name: string; total: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1);
    months.push({ name: d.toLocaleString('en', { month: 'short', year: '2-digit' }), total: 0 });
  }
  (reqs ?? []).forEach((r: any) => {
    const d = new Date(r.created_at);
    const idx = (d.getFullYear() - since.getFullYear()) * 12 + d.getMonth() - since.getMonth();
    if (idx >= 0 && idx < 6) months[idx].total++;
  });
  res.json({
    requestsPerMonth: months,
    donorsByGroup: tally(donors ?? [], 'blood_group'),
    requestsByStatus: tally(reqs ?? [], 'status'),
    requestsByPriority: tally(reqs ?? [], 'priority'),
    topRequestCities: tally(reqs ?? [], 'city').slice(0, 8),
    topDonorCities: tally(donors ?? [], 'city').slice(0, 8),
  });
}
