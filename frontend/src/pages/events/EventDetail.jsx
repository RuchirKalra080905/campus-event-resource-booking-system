import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, Clock, MapPin, Users, Star, ArrowLeft, UserPlus, UserMinus, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [newFeedback, setNewFeedback] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchEvent(); fetchFeedback(); }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) { toast.error('Event not found'); navigate('/events'); }
    finally { setLoading(false); }
  };

  const fetchFeedback = async () => {
    try {
      const res = await api.get(`/feedback/event/${id}`);
      setFeedback(res.data.feedback || []);
      setFeedbackStats(res.data.stats);
    } catch (err) { /* silent */ }
  };

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await api.post(`/registrations/${id}`);
      toast.success('Registered successfully!');
      fetchEvent();
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your registration?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/registrations/${id}`);
      toast.success('Registration cancelled');
      fetchEvent();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post('/feedback', { event_id: parseInt(id), ...newFeedback });
      toast.success('Feedback submitted!');
      setNewFeedback({ rating: 5, comment: '' });
      fetchFeedback();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;
  if (!event) return null;

  const remaining = event.max_participants - (event.registered_count || 0);
  const isFull = remaining <= 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 transition-colors">
        <ArrowLeft size={16} /> Back to Events
      </button>

      {/* Event Header */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
        <div className="h-3 gradient-primary" />
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`badge badge-${event.status}`}>{event.status}</span>
            {event.category_name && <span className="badge bg-primary-100 text-primary-800">{event.category_name}</span>}
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">{event.title}</h1>
          {event.description && <p className="text-surface-600 leading-relaxed">{event.description}</p>}

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={18} className="text-primary-500" />
                <span>{new Date(event.event_date).toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={18} className="text-primary-500" />
                <span>{event.start_time?.slice(0,5)} – {event.end_time?.slice(0,5)}</span>
              </div>
              {event.venue_name && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={18} className="text-primary-500" />
                  <span>{event.venue_name}, {event.building}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Users size={18} className="text-primary-500" />
                <span>{event.registered_count || 0} / {event.max_participants} registered ({remaining} remaining)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Building size={18} className="text-primary-500" />
                <span>Organized by {event.organizer_name} ({event.organizer_department})</span>
              </div>
              {event.avg_rating > 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  <span>{Number(event.avg_rating).toFixed(1)} / 5 ({event.feedback_count} reviews)</span>
                </div>
              )}
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-surface-500 mb-1">
              <span>Capacity</span>
              <span>{Math.round((event.registered_count / event.max_participants) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-surface-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-primary-500'}`}
                style={{ width: `${Math.min(100, (event.registered_count / event.max_participants) * 100)}%` }} />
            </div>
          </div>

          {/* Action buttons */}
          {event.status === 'approved' && user?.role === 'student' && (
            <div className="mt-6 pt-4 border-t border-surface-100">
              {event.is_registered ? (
                <button onClick={handleCancel} disabled={actionLoading} className="btn btn-danger">
                  <UserMinus size={16} /> Cancel Registration
                </button>
              ) : (
                <button onClick={handleRegister} disabled={actionLoading || isFull} className="btn btn-primary">
                  <UserPlus size={16} /> {isFull ? 'Event Full' : 'Register for Event'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
        <h2 className="text-lg font-semibold text-surface-800 mb-4">Feedback & Ratings</h2>
        
        {/* Feedback form */}
        {event.is_registered && (
          <form onSubmit={handleFeedback} className="mb-6 p-4 bg-surface-50 rounded-lg">
            <h3 className="text-sm font-medium text-surface-700 mb-3">Leave your feedback</h3>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button" onClick={() => setNewFeedback(f => ({ ...f, rating: star }))}>
                  <Star size={24} className={`transition-colors ${star <= newFeedback.rating ? 'text-amber-500 fill-amber-500' : 'text-surface-300'}`} />
                </button>
              ))}
            </div>
            <textarea value={newFeedback.comment} onChange={e => setNewFeedback(f => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience..." className="input mb-3" rows={3} />
            <button type="submit" className="btn btn-primary btn-sm">Submit Feedback</button>
          </form>
        )}

        {/* Feedback list */}
        {feedback.length === 0 ? (
          <p className="text-sm text-surface-500 text-center py-4">No feedback yet</p>
        ) : (
          <div className="space-y-4">
            {feedback.map(fb => (
              <div key={fb.feedback_id} className="border-b border-surface-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-800">{fb.user_name}</span>
                    <span className="text-xs text-surface-400">{fb.department}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= fb.rating ? 'text-amber-500 fill-amber-500' : 'text-surface-300'} />)}
                  </div>
                </div>
                {fb.comment && <p className="text-sm text-surface-600">{fb.comment}</p>}
                <p className="text-xs text-surface-400 mt-1">{new Date(fb.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
