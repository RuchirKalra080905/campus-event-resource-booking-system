import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, BookOpen, Package, Bell, ArrowRight, MapPin, Clock } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

  const stats = data?.stats || {};
  const statCards = [
    { label: 'Registered Events', value: stats.registered_events || 0, icon: BookOpen, gradient: 'gradient-primary' },
    { label: 'Upcoming Events', value: stats.upcoming_events || 0, icon: Calendar, gradient: 'gradient-accent' },
    { label: 'Active Bookings', value: stats.active_bookings || 0, icon: Package, gradient: 'gradient-warm' },
    { label: 'Notifications', value: stats.unread_notifications || 0, icon: Bell, gradient: 'gradient-purple' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-primary-100 mt-1">Here's what's happening on campus today.</p>
      </div>

      {/* Stats */}
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
        {[
          { label: 'Browse Events', to: '/events', gradient: 'gradient-primary' },
          { label: 'My Registrations', to: '/my-registrations', gradient: 'gradient-accent' },
          { label: 'Book Resource', to: '/resources/book', gradient: 'gradient-warm' },
          { label: 'My Bookings', to: '/my-bookings', gradient: 'gradient-purple' },
        ].map(({ label, to, gradient }) => (
          <button key={to} onClick={() => navigate(to)}
            className={`${gradient} text-white rounded-xl p-4 text-sm font-semibold flex items-center justify-between shadow-md hover:shadow-lg transition-all hover:scale-[1.02]`}>
            {label}
            <ArrowRight size={16} />
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming registered events */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-semibold text-surface-800">Your Upcoming Events</h3>
            <button onClick={() => navigate('/my-registrations')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">View All</button>
          </div>
          <div className="p-4 space-y-3">
            {(data?.upcomingEvents || []).length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-6">No upcoming events. <button onClick={() => navigate('/events')} className="text-primary-600 hover:underline">Browse events</button></p>
            ) : (
              data.upcomingEvents.map(ev => (
                <div key={ev.event_id} onClick={() => navigate(`/events/${ev.event_id}`)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold shrink-0">
                    <span>{new Date(ev.event_date).toLocaleDateString('en', { day: '2-digit' })}</span>
                    <span className="text-[10px]">{new Date(ev.event_date).toLocaleDateString('en', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-surface-500"><Clock size={12} />{ev.start_time?.slice(0,5)}</span>
                      {ev.venue_name && <span className="flex items-center gap-1 text-xs text-surface-500"><MapPin size={12} />{ev.venue_name}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available events to register */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-semibold text-surface-800">Discover Events</h3>
            <button onClick={() => navigate('/events')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">View All</button>
          </div>
          <div className="p-4 space-y-3">
            {(data?.availableEvents || []).length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-6">No new events available right now.</p>
            ) : (
              data.availableEvents.map(ev => (
                <div key={ev.event_id} onClick={() => navigate(`/events/${ev.event_id}`)}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors">
                  <div className="w-12 h-12 gradient-accent rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold shrink-0">
                    <span>{new Date(ev.event_date).toLocaleDateString('en', { day: '2-digit' })}</span>
                    <span className="text-[10px]">{new Date(ev.event_date).toLocaleDateString('en', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-800 truncate">{ev.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {ev.category_name && <span className="badge badge-approved">{ev.category_name}</span>}
                      <span className="text-xs text-surface-500">{ev.registered_count}/{ev.max_participants} registered</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
