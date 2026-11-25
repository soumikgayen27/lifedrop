import { supabase } from '../config/supabase';

const esc = (s: string) => s.replace(/[%_\\]/g, '\\$&');

interface NewRequest {
  id: string;
  request_code: string;
  requester_id: string;
  blood_group: string;
  state: string;
  city: string;
  pin_code: string;
  hospital_name: string;
  priority: string;
  required_date: string;
}

/**
 * Creates in-app notifications for available donors with the SAME blood group.
 * Preference: same city -> same PIN code -> otherwise same state.
 * Being notified does not mean a donor is eligible; the donor chooses whether to respond.
 * No SMS / e-mail is sent: plug a provider in here when one is configured.
 */
export async function notifyMatchingDonors(r: NewRequest): Promise<number> {
  const { data, error } = await supabase
    .from('donors')
    .select('user_id, city, pin_code, profiles!inner(is_suspended)')
    .eq('blood_group', r.blood_group)
    .eq('availability', 'available')
    .eq('status', 'active')
    .eq('profiles.is_suspended', false)
    .neq('user_id', r.requester_id)
    .ilike('state', esc(r.state))
    .limit(500);
  if (error) throw error;
  const donors = (data ?? []) as unknown as { user_id: string; city: string; pin_code: string }[];

  const sameCity = donors.filter((d) => d.city.trim().toLowerCase() === r.city.trim().toLowerCase());
  const samePin = donors.filter((d) => d.pin_code === r.pin_code);
  const targets = sameCity.length ? sameCity : samePin.length ? samePin : donors;
  if (!targets.length) return 0;

  const rows = targets.map((d) => ({
    user_id: d.user_id,
    request_id: r.id,
    type: 'blood_request',
    title: `${r.priority === 'normal' ? '' : r.priority.toUpperCase() + ': '}${r.blood_group} blood needed in ${r.city}`,
    body: `Request ${r.request_code} at ${r.hospital_name}, needed by ${r.required_date}. Only respond if you believe you are able to donate; the hospital will confirm eligibility.`,
  }));
  const { error: insErr } = await supabase.from('notifications').insert(rows);
  if (insErr) throw insErr;
  return rows.length;
}
