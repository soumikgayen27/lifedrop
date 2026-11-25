import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { isSupabaseConfigured } from './lib/supabase';
import SetupRequired from './components/common/SetupRequired';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home/Home';
import Donors from './pages/Donors/Donors';
import DonorProfile from './pages/Donors/DonorProfile';
import BloodRequests from './pages/BloodRequests/BloodRequests';
import RequestDetail from './pages/BloodRequests/RequestDetail';
import NewRequest from './pages/BloodRequests/NewRequest';
import EditRequest from './pages/BloodRequests/EditRequest';
import About from './pages/About/About';
import HowItWorks from './pages/About/HowItWorks';
import Contact from './pages/Contact/Contact';
import { Privacy, Terms } from './pages/Legal/Legal';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import NotFound from './pages/NotFound';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import Overview from './pages/Dashboard/Overview';
import MyProfile from './pages/Dashboard/MyProfile';
import EditProfile from './pages/Dashboard/EditProfile';
import Availability from './pages/Dashboard/Availability';
import MyRequests from './pages/Dashboard/MyRequests';
import Notifications from './pages/Dashboard/Notifications';
import Settings from './pages/Dashboard/Settings';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminOverview from './pages/Admin/AdminOverview';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminDonors from './pages/Admin/AdminDonors';
import AdminRequests from './pages/Admin/AdminRequests';
import AdminMessages from './pages/Admin/AdminMessages';
import AdminReports from './pages/Admin/AdminReports';
import AdminSettings from './pages/Admin/AdminSettings';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  if (!isSupabaseConfigured) return <SetupRequired />;
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="donors" element={<Donors />} />
          <Route path="donors/:id" element={<DonorProfile />} />
          <Route path="requests" element={<BloodRequests />} />
          <Route path="requests/:id" element={<RequestDetail />} />
          <Route path="request-blood" element={<ProtectedRoute><NewRequest /></ProtectedRoute>} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Overview />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="availability" element={<Availability />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="requests/:id/edit" element={<EditRequest />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="admin" element={<ProtectedRoute admin><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="donors" element={<AdminDonors />} />
          <Route path="verification" element={<AdminDonors verification />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
}
