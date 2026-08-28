import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Users, Calendar, Package, ClipboardList, BookOpen, MapPin, BarChart3, ArrowRight, Tag, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

  const s = data?.stats || {};
  const charts = data?.charts || {};

  const statCards = [
    { label: 'Total Users', value: s.total_users || 0, icon: Users, gradient: 'gradient-primary' },
    { label: 'Total Events', value: s.total_events || 0, icon: Calendar, gradient: 'gradient-accent' },
    { label: 'Upcoming Events', value: s.upcoming_events || 0, icon: Calendar, gradient: 'gradient-sky' },
    { label: 'Pending Events', value: s.pending_events || 0, icon: BookOpen, gradient: 'gradient-warm' },
    { label: 'Total Resources', value: s.total_resources || 0, icon: Package, gradient: 'gradient-purple' },
    { label: 'Pending Bookings', value: s.pending_bookings || 0, icon: ClipboardList, gradient: 'gradient-rose' },
    { label: 'Total Registrations', value: s.total_registrations || 0, icon: BookOpen, gradient: 'gradient-sky' },
    { label: 'Total Bookings', value: s.total_bookings || 0, icon: FileText, gradient: 'gradient-accent' },
  ];

  const quickActions = [
    { label: 'Add Event', to: '/events/create', gradient: 'gradient-primary' },
    { label: 'Manage Events', to: '/events', gradient: 'gradient-accent' },
    { label: 'Manage Resources', to: '/resources', gradient: 'gradient-warm' },
    { label: 'Manage Venues', to: '/manage-venues', gradient: 'gradient-purple' },
    { label: 'Manage Users', to: '/manage-users', gradient: 'gradient-sky' },
    { label: 'Approve Bookings', to: '/manage-bookings', gradient: 'gradient-rose' },
    { label: 'Reports', to: '/reports', gradient: 'gradient-primary' },
    { label: 'Audit Logs', to: '/audit-logs', gradient: 'gradient-accent' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-surface-800 to-surface-900 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Admin Dashboard ⚡</h1>
        <p className="text-surface-300 mt-1">Complete overview of campus events and resources.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, gradient }) => (
          <div key={label} className="bg-white rounded-xl p-5 shadow-sm card-hover border border-surface-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-surface-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-surface-800 mt-1">{value}</p>
              </div>
              <div className={`w-11 h-11 ${gradient} rounded-xl flex items-center justify-center shadow-md`}>
                <Icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map(({ label, to, gradient }) => (
          <button key={to} onClick={() => navigate(to)}
            className={`${gradient} text-white rounded-xl p-4 text-sm font-semibold flex items-center justify-between shadow-md hover:shadow-lg transition-all hover:scale-[1.02]`}>
            {label}<ArrowRight size={16} />
          </button>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Events by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-800 mb-4 flex items-center gap-2"><Tag size={18} /> Events by Category</h3>
          {(charts.eventsByCategory || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={charts.eventsByCategory} dataKey="count" nameKey="category_name" cx="50%" cy="50%" outerRadius={90} label={({ category_name, count }) => `${category_name} (${count})`}>
                  {charts.eventsByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-surface-500 text-center py-10">No data available</p>}
        </div>

        {/* Registrations by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-800 mb-4 flex items-center gap-2"><BarChart3 size={18} /> Registrations by Month</h3>
          {(charts.regByMonth || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.regByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-surface-500 text-center py-10">No data available</p>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-800 mb-4 flex items-center gap-2"><Users size={18} /> User Distribution</h3>
          {(charts.userDist || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={charts.userDist} dataKey="count" nameKey="role" cx="50%" cy="50%" innerRadius={50} outerRadius={90} label={({ role, count }) => `${role} (${count})`}>
                  {charts.userDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-surface-500 text-center py-10">No data available</p>}
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-5">
          <h3 className="font-semibold text-surface-800 mb-4 flex items-center gap-2"><Package size={18} /> Top Resources</h3>
          {(charts.resourceUsage || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={charts.resourceUsage} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="resource_name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="booking_count" fill="#10b981" radius={[0, 4, 4, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-surface-500 text-center py-10">No data available</p>}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-100">
        <div className="px-5 py-4 border-b border-surface-100 flex justify-between items-center">
          <h3 className="font-semibold text-surface-800">Recent Events</h3>
          <button onClick={() => navigate('/events')} className="text-xs text-primary-600 font-medium hover:text-primary-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Title</th><th>Date</th><th>Organizer</th><th>Status</th></tr></thead>
            <tbody>
              {(data?.recentEvents || []).map(ev => (
                <tr key={ev.event_id} className="cursor-pointer" onClick={() => navigate(`/events/${ev.event_id}`)}>
                  <td className="font-medium">{ev.title}</td>
                  <td>{new Date(ev.event_date).toLocaleDateString()}</td>
                  <td>{ev.organizer_name}</td>
                  <td><span className={`badge badge-${ev.status}`}>{ev.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
