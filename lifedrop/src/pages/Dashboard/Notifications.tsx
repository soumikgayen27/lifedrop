import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, must } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { fmtDate, timeAgo } from '../../utils/format';
import { BloodBadge, EmptyState, ErrorState, PageHead, PageLoader, PriorityBadge, StatusBadge } from '../../components/common/ui';
import type { AppNotification } from '../../types';

interface Data { items: AppNotification[]; responses: Record<string, string> }

export default function Notifications() {
  const { session } = useAuth();
  const uid = session!.user.id;
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync<Data>(async () => {
    const items = must(await supabase.from('notifications')
      .select('*, request:blood_requests(request_code, blood_group, city, hospital_name, required_date, priority, status)')
      .eq('user_id', uid).order('created_at', { ascending: false }).limit(100)) as unknown as AppNotification[];
    const resp = must(await supabase.from('donor_responses').select('request_id, response').eq('donor_user_id', uid)) as { request_id: string; response: string }[];
    return { items, responses: Object.fromEntries(resp.map((r) => [r.request_id, r.response])) };
  }, [uid]);

  const markRead = async (id: string) => { await supabase.from('notifications').update({ is_read: true }).eq('id', id); };
  const toggle = async (n: AppNotification) => {
    setOpenId(openId === n.id ? null : n.id);
    if (!n.is_read) { await markRead(n.id); reload(); }
  };
  const markAll = async () => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', uid).eq('is_read', false);
    if (error) return toast.error(error.message);
    reload();
  };
  const respond = async (n: AppNotification, response: 'interested' | 'declined') => {
    const { error } = await supabase.from('donor_responses').upsert({ request_id: n.request_id, donor_user_id: uid, response }, { onConflict: 'request_id,donor_user_id' });
    if (error) return toast.error(error.message);
    toast.success(response === 'interested' ? 'Interest sent. The requester can now see your details.' : 'Request declined.');
    reload();
  };

  const unread = data?.items.filter((n) => !n.is_read).length ?? 0;
  return (
    <div className="max-w-3xl">
      <PageHead title="Notifications" subtitle={unread ? `${unread} unread` : 'You are all caught up'} action={unread ? <button className="btn btn-outline btn-sm" onClick={markAll}><CheckCheck size={14} /> Mark all read</button> : undefined} />
      {loading ? <PageLoader /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data?.items.length ? <EmptyState title="No notifications" text="When a matching blood request is posted, or a donor responds to yours, it shows up here." />
        : (
          <ul className="space-y-2">
            {data.items.map((n) => {
              const r = n.request; const mine = data.responses[n.request_id ?? ''];
              return (
                <li key={n.id} className={`card p-4 ${n.is_read ? '' : 'border-brand/40'}`}>
                  <button className="flex w-full items-start gap-3 text-left" onClick={() => toggle(n)} aria-expanded={openId === n.id}>
                    <Bell size={16} className={`mt-0.5 shrink-0 ${n.is_read ? 'text-muted' : 'text-brand'}`} />
                    <span className="flex-1"><span className={`block text-sm ${n.is_read ? '' : 'font-semibold'}`}>{n.title}</span><span className="text-xs text-muted">{timeAgo(n.created_at)}</span></span>
                    <ChevronDown size={14} className="mt-1 text-muted" />
                  </button>
                  {openId === n.id && (
                    <div className="mt-3 space-y-3 border-t border-line pt-3 text-sm">
                      <p className="text-muted">{n.body}</p>
                      {r && (
                        <dl className="grid gap-2 sm:grid-cols-3">
                          <div><dt className="text-xs text-muted">Request ID</dt><dd className="font-medium">{r.request_code}</dd></div>
                          <div><dt className="text-xs text-muted">Blood group</dt><dd><BloodBadge group={r.blood_group} /></dd></div>
                          <div><dt className="text-xs text-muted">Priority</dt><dd><PriorityBadge priority={r.priority} /></dd></div>
                          <div><dt className="text-xs text-muted">Hospital</dt><dd>{r.hospital_name}</dd></div>
                          <div><dt className="text-xs text-muted">City</dt><dd>{r.city}</dd></div>
                          <div><dt className="text-xs text-muted">Required date</dt><dd>{fmtDate(r.required_date)}</dd></div>
                        </dl>
                      )}
                      {n.type === 'blood_request' && r && (
                        r.status !== 'open' ? <p className="text-muted">This request is {r.status}, so responses are closed.</p> : (
                          <div className="flex flex-wrap items-center gap-2">
                            {mine && <StatusBadge status={mine} label={`You responded: ${mine}`} />}
                            <button className="btn btn-primary btn-sm" onClick={() => respond(n, 'interested')} disabled={mine === 'interested'}><Check size={14} /> Express interest</button>
                            <button className="btn btn-outline btn-sm" onClick={() => respond(n, 'declined')} disabled={mine === 'declined'}><X size={14} /> Decline</button>
                            <Link to={`/requests/${n.request_id}`} className="text-xs text-brand">Public page</Link>
                          </div>
                        )
                      )}
                      {n.type === 'donor_response' && <Link to="/dashboard/requests" className="btn btn-outline btn-sm">Open my requests</Link>}
                      {n.type === 'blood_request' && <p className="text-xs text-muted">Only express interest if you believe you can donate. The hospital will confirm medical eligibility.</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
    </div>
  );
}
