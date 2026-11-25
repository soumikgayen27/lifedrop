import { Bell, ClipboardList, HeartPulse, LayoutDashboard, Settings, UserCog, UserRound } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import SidebarLayout, { SideItem } from '../../components/dashboard/SidebarLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';

export default function DashboardLayout() {
  const { session } = useAuth();
  const loc = useLocation();
  const unread = useAsync(async () => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', session!.user.id).eq('is_read', false);
    return count ?? 0;
  }, [session?.user.id, loc.pathname]);

  const items: SideItem[] = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/profile', label: 'My Profile', icon: UserRound, end: true },
    { to: '/dashboard/profile/edit', label: 'Edit Profile', icon: UserCog },
    { to: '/dashboard/availability', label: 'Availability', icon: HeartPulse },
    { to: '/dashboard/requests', label: 'My Blood Requests', icon: ClipboardList },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: unread.data ?? 0 },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];
  return <SidebarLayout title="My account" items={items} />;
}
