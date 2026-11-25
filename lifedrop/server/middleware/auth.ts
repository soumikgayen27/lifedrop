import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../config/supabase';

export interface AuthedRequest extends Request {
  user?: { id: string; email?: string };
}

/** Verifies the Supabase JWT and makes sure the account is not suspended. */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Please log in to continue.' });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Your session has expired. Please log in again.' });

    const { data: profile } = await supabase.from('profiles').select('is_suspended').eq('id', data.user.id).maybeSingle();
    if (!profile) return res.status(403).json({ error: 'Account profile not found.' });
    if (profile.is_suspended) return res.status(403).json({ error: 'This account has been suspended.' });

    req.user = { id: data.user.id, email: data.user.email };
    next();
  } catch (err) {
    next(err);
  }
}

/** Must run after requireAuth. Admin status is checked in the database on every request. */
export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { data } = await supabase.from('admin_roles').select('user_id').eq('user_id', req.user!.id).maybeSingle();
    if (!data) return res.status(403).json({ error: 'Administrator access required.' });
    next();
  } catch (err) {
    next(err);
  }
}
