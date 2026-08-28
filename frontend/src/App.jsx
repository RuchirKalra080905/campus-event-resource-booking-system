import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import EventList from './pages/events/EventList';
import EventDetail from './pages/events/EventDetail';
import CreateEvent from './pages/events/CreateEvent';
import MyRegistrations from './pages/events/MyRegistrations';
import ResourceList from './pages/resources/ResourceList';
import BookResource from './pages/resources/BookResource';
import MyBookings from './pages/resources/MyBookings';
import ManageUsers from './pages/admin/ManageUsers';
import ManageVenues from './pages/admin/ManageVenues';
import ManageCategories from './pages/admin/ManageCategories';
import ManageBookings from './pages/admin/ManageBookings';
import Reports from './pages/admin/Reports';
import AuditLogs from './pages/admin/AuditLogs';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'faculty': return <FacultyDashboard />;
    default: return <StudentDashboard />;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardRedirect />} />
        <Route path="events" element={<EventList />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="events/create" element={<ProtectedRoute roles={['admin','faculty']}><CreateEvent /></ProtectedRoute>} />
        <Route path="events/:id/edit" element={<ProtectedRoute roles={['admin','faculty']}><CreateEvent /></ProtectedRoute>} />
        <Route path="my-registrations" element={<MyRegistrations />} />
        <Route path="resources" element={<ResourceList />} />
        <Route path="resources/book" element={<BookResource />} />
        <Route path="my-bookings" element={<MyBookings />} />
        <Route path="manage-users" element={<ProtectedRoute roles={['admin']}><ManageUsers /></ProtectedRoute>} />
        <Route path="manage-venues" element={<ProtectedRoute roles={['admin']}><ManageVenues /></ProtectedRoute>} />
        <Route path="manage-categories" element={<ProtectedRoute roles={['admin']}><ManageCategories /></ProtectedRoute>} />
        <Route path="manage-bookings" element={<ProtectedRoute roles={['admin']}><ManageBookings /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
