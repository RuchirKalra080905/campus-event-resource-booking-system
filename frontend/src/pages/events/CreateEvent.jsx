import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Calendar, Clock, MapPin, Users, Tag, FileText, ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    venue_id: '',
    event_date: '',
    start_time: '',
    end_time: '',
    max_participants: 50,
  });

  useEffect(() => {
    fetchMetadata();
    if (isEdit) fetchEventData();
  }, [id]);

  const fetchMetadata = async () => {
    try {
      const [catRes, venRes] = await Promise.all([
        api.get('/categories'),
        api.get('/venues')
      ]);
      setCategories(catRes.data);
      setVenues(venRes.data);
    } catch (err) {
      toast.error('Failed to load form options');
    }
  };

  const fetchEventData = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      const ev = res.data;
      setForm({
        title: ev.title,
        description: ev.description || '',
        category_id: ev.category_id || '',
        venue_id: ev.venue_id || '',
        event_date: ev.event_date ? ev.event_date.split('T')[0] : '',
        start_time: ev.start_time || '',
        end_time: ev.end_time || '',
        max_participants: ev.max_participants || 50,
      });
      if (ev.venue_id) {
        const v = venues.find(item => item.venue_id === Number(ev.venue_id));
        setSelectedVenue(v);
      }
    } catch (err) {
      toast.error('Failed to load event data');
      navigate('/events');
    }
  };

  const handleVenueChange = (e) => {
    const venueId = e.target.value;
    setForm(f => ({ ...f, venue_id: venueId }));
    const v = venues.find(item => item.venue_id === Number(venueId));
    setSelectedVenue(v || null);
    if (v && form.max_participants > v.capacity) {
      setForm(f => ({ ...f, max_participants: v.capacity }));
      toast(`Max participants adjusted to venue capacity (${v.capacity})`, { icon: 'ℹ️' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.start_time >= form.end_time) {
      return toast.error('End time must be after start time');
    }
    if (selectedVenue && Number(form.max_participants) > selectedVenue.capacity) {
      return toast.error(`Max participants cannot exceed venue capacity (${selectedVenue.capacity})`);
    }

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/events/${id}`, form);
        toast.success('Event updated successfully!');
      } else {
        const res = await api.post('/events', form);
        toast.success(user.role === 'admin' ? 'Event created and approved!' : 'Event proposal submitted for admin approval!');
      }
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/events')} className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 transition-colors">
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
        <div className="h-3 gradient-primary" />
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-surface-800 mb-1">
            {isEdit ? 'Edit Event' : 'Create Event Proposal'}
          </h1>
          <p className="text-sm text-surface-500 mb-6">
            {user?.role === 'admin' 
              ? 'Events created by Admin are automatically approved and listed.' 
              : 'Proposals submitted by Faculty will be reviewed by campus administrators.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Event Title *</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Tech Symposium 2026"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Description</label>
              <textarea
                rows={4}
                placeholder="Provide a comprehensive agenda, target audience, and key highlights..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Category</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                  <select
                    value={form.category_id}
                    onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="input pl-10"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Venue</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                  <select
                    value={form.venue_id}
                    onChange={handleVenueChange}
                    className="input pl-10"
                  >
                    <option value="">Select Venue</option>
                    {venues.map(v => (
                      <option key={v.venue_id} value={v.venue_id}>
                        {v.venue_name} ({v.building} • Max: {v.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedVenue && (
              <div className="p-3 bg-surface-50 rounded-xl border border-surface-200 text-xs text-surface-600 flex items-start gap-2">
                <AlertCircle size={16} className="text-primary-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-surface-800">{selectedVenue.venue_name}</span> ({selectedVenue.building}, Floor {selectedVenue.floor || 'N/A'})
                  <br />
                  Facilities: {selectedVenue.facilities || 'Standard AV'} • Max Capacity: <span className="font-bold text-primary-700">{selectedVenue.capacity} seats</span>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Event Date *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="date"
                    required
                    value={form.event_date}
                    onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Start Time *</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="time"
                    required
                    value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">End Time *</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="time"
                    required
                    value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                    className="input pl-10"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="input-label">Max Participants Capacity *</label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="number"
                  min={1}
                  max={selectedVenue ? selectedVenue.capacity : 1000}
                  required
                  value={form.max_participants}
                  onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))}
                  className="input pl-10"
                />
              </div>
              {selectedVenue && (
                <p className="text-xs text-surface-500 mt-1">Must not exceed venue capacity of {selectedVenue.capacity}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-surface-100">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 btn-lg"
              >
                {loading ? 'Submitting...' : isEdit ? 'Update Event' : user?.role === 'admin' ? 'Create Event' : 'Submit Proposal'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="btn btn-secondary px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
