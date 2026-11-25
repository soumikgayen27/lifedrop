import { BarChart3, ClipboardList, HeartHandshake, LayoutDashboard, MessageSquare, Settings, ShieldCheck, Users } from 'lucide-react';
import SidebarLayout, { SideItem } from '../../components/dashboard/SidebarLayout';

const items: SideItem[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
  { to: '/admin/donors', label: 'Manage Donors', icon: HeartHandshake },
  { to: '/admin/requests', label: 'Blood Requests', icon: ClipboardList },
  { to: '/admin/verification', label: 'Donor Verification', icon: ShieldCheck },
  { to: '/admin/messages', label: 'Contact Messages', icon: MessageSquare },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];
export default function AdminLayout() {
  return <SidebarLayout title="Administration" items={items} />;
}
