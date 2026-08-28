import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, BookOpen, Package, Bell, ArrowRight, Clock, MapPin, Plus } from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

  const s = data?.stats || {};
  const statCards = [
    { label: 'My Events', value: s.total_events || 0, icon: Calendar, gradient: 'gradient-primary' },
    { label: 'Pending Proposals', value: s.pending_events || 0, icon: BookOpen, gradient: 'gradient-warm' },
    { label: 'Upcoming Events', value: s.upcoming_events || 0, icon: Calendar, gradient: 'gradient-accent' },
    { label: 'Active Bookings', value: s.active_bookings || 0, icon: Package, gradient: 'gradient-purple' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Welcome, {user?.name?.split(' ')[0]}! 🎓</h1>
        <p className="text-primary-100 mt-1">Manage your events and campus resources.</p>
      </div>

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Create Event', to: '/events/create', gradient: 'gradient-primary', icon: Plus },
          { label: 'My Events', to: '/events', gradient: 'gradient-accent', icon: Calendar },
          { label: 'Book Resource', to: '/resources/book', gradient: 'gradient-warm', icon: Package },
          { label: 'My Bookings', to: '/my-bookings', gradient: 'gradient-purple', icon: BookOpen },
        ].map(({ label, to, gradient }) => (
          <button key={to} onClick={() => navigate(to)}
            className={`${gradient} text-white rounded-xl p-4 text-sm font-semibold flex items-center justify-between shadow-md hover:shadow-lg transition-all hover:scale-[1.02]`}>
            {label}<ArrowRight size={16} />
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-100">
        <div className="px-5 py-4 border-b border-surface-100">
          <h3 className="font-semibold text-surface-800">My Upcoming Events</h3>
        </div>
        <div className="p-4 space-y-3">
          {(data?.upcomingEvents || []).length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-6">No upcoming events. <button onClick={() => navigate('/events/create')} className="text-primary-600 hover:underline">Create one</button></p>
          ) : (
            data.upcomingEvents.map(ev => (
              <div key={ev.event_id} onClick={() => navigate(`/events/${ev.event_id}`)}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors">
                <div className="w-12 h-12 gradient-primary rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold shrink-0">
                  <span>{new Date(ev.event_date).toLocaleDateString('en', { day: '2-digit' })}</span>
                  <span className="text-[10px]">{new Date(ev.event_date).toLocaleDateString('en', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800 truncate">{ev.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`badge badge-${ev.status}`}>{ev.status}</span>
                    <span className="text-xs text-surface-500">{ev.registered_count || 0} registrations</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="flex items-center gap-1 text-xs text-surface-500"><Clock size={12} />{ev.start_time?.slice(0,5)}</span>
                  {ev.venue_name && <span className="flex items-center gap-1 text-xs text-surface-500 mt-1"><MapPin size={12} />{ev.venue_name}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
