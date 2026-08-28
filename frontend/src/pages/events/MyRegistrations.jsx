import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, ArrowRight, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await api.get('/registrations/my');
      setRegistrations(res.data);
    } catch (err) {
      toast.error('Failed to load your registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId, eventTitle) => {
    if (!confirm(`Are you sure you want to cancel your registration for "${eventTitle}"?`)) return;
    try {
      await api.delete(`/registrations/${eventId}`);
      toast.success('Registration cancelled successfully');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel registration');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">My Registrations</h1>
          <p className="text-sm text-surface-500">Track all campus events you have registered for</p>
        </div>
        <button onClick={() => navigate('/events')} className="btn btn-primary btn-sm self-start sm:self-auto">
          Explore More Events
        </button>
      </div>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-surface-100">
          <Calendar size={48} className="mx-auto text-surface-300 mb-3" />
          <h3 className="text-lg font-semibold text-surface-700">No Registrations Yet</h3>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            You haven't signed up for any events yet. Check out the campus calendar and join technical talks, cultural fests, and workshops!
          </p>
          <button onClick={() => navigate('/events')} className="btn btn-primary mt-5">
            Browse Campus Events
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {registrations.map(reg => {
            const isCancelled = reg.attendance_status === 'cancelled';
            return (
              <div
                key={reg.registration_id}
                className={`bg-white rounded-xl shadow-sm border border-surface-100 p-5 card-hover transition-all flex flex-col justify-between ${
                  isCancelled ? 'opacity-60 bg-surface-50' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`badge ${
                      reg.attendance_status === 'registered' ? 'badge-approved' :
                      reg.attendance_status === 'attended' ? 'bg-blue-100 text-blue-800' :
                      reg.attendance_status === 'cancelled' ? 'badge-cancelled' : 'badge-pending'
                    }`}>
                      {reg.attendance_status.toUpperCase()}
                    </span>
                    {reg.category_name && (
                      <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
                        {reg.category_name}
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => navigate(`/events/${reg.event_id}`)}
                    className="text-base font-semibold text-surface-800 hover:text-primary-600 cursor-pointer transition-colors"
                  >
                    {reg.title}
                  </h3>

                  <div className="space-y-1.5 mt-3 text-xs text-surface-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary-500" />
                      <span>{new Date(reg.event_date).toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary-500" />
                      <span>{reg.start_time?.slice(0, 5)} – {reg.end_time?.slice(0, 5)}</span>
                    </div>
                    {reg.venue_name && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary-500" />
                        <span>{reg.venue_name}, {reg.building}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-primary-500" />
                      <span>Registered on {new Date(reg.registration_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-100 flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/events/${reg.event_id}`)}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    Event Details <ArrowRight size={12} />
                  </button>

                  {!isCancelled && (
                    <button
                      onClick={() => handleCancel(reg.event_id, reg.title)}
                      className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                    >
                      Cancel Registration
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
