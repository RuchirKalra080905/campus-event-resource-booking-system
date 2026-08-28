import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Search, Filter, Calendar, MapPin, Users, Clock, Plus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EventList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category_id: '', status: '', sort: 'date_desc' });

  useEffect(() => { fetchEvents(); fetchFilters(); }, [filters]);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.status) params.status = filters.status;
      params.sort = filters.sort;
      const res = await api.get('/events', { params });
      setEvents(res.data.events || []);
    } catch (err) { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const fetchFilters = async () => {
    try {
      const [catRes, venRes] = await Promise.all([api.get('/categories'), api.get('/venues')]);
      setCategories(catRes.data);
      setVenues(venRes.data);
    } catch (err) { /* silent */ }
  };

  const handleStatusChange = async (eventId, status) => {
    try {
      await api.put(`/events/${eventId}/status`, { status });
      toast.success(`Event ${status}`);
      fetchEvents();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Events</h1>
          <p className="text-sm text-surface-500">Browse and manage campus events</p>
        </div>
        {['admin', 'faculty'].includes(user?.role) && (
          <button onClick={() => navigate('/events/create')} className="btn btn-primary" id="create-event-btn">
            <Plus size={18} /> Create Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" placeholder="Search events..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="input pl-10" id="event-search" />
          </div>
          <select value={filters.category_id} onChange={e => setFilters(f => ({ ...f, category_id: e.target.value }))}
            className="input w-auto" id="category-filter">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
          {user?.role === 'admin' && (
            <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              className="input w-auto">
              <option value="">All Status</option>
              {['pending', 'approved', 'rejected', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))} className="input w-auto">
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Event Cards */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-12 text-center">
          <Calendar size={48} className="mx-auto text-surface-300 mb-3" />
          <p className="text-surface-600 font-medium">No events found</p>
          <p className="text-sm text-surface-500 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => (
            <div key={ev.event_id} className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden card-hover group cursor-pointer"
              onClick={() => navigate(`/events/${ev.event_id}`)}>
              {/* Card header with gradient */}
              <div className="h-2 gradient-primary" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge badge-${ev.status}`}>{ev.status}</span>
                  {ev.category_name && <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded">{ev.category_name}</span>}
                </div>
                <h3 className="text-base font-semibold text-surface-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">{ev.title}</h3>
                {ev.description && <p className="text-xs text-surface-500 mb-3 line-clamp-2">{ev.description}</p>}
                
                <div className="space-y-1.5 text-xs text-surface-600">
                  <div className="flex items-center gap-2"><Calendar size={13} />{new Date(ev.event_date).toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <div className="flex items-center gap-2"><Clock size={13} />{ev.start_time?.slice(0,5)} – {ev.end_time?.slice(0,5)}</div>
                  {ev.venue_name && <div className="flex items-center gap-2"><MapPin size={13} />{ev.venue_name}, {ev.building}</div>}
                  <div className="flex items-center gap-2"><Users size={13} />{ev.registered_count || 0} / {ev.max_participants} registered</div>
                </div>

                {ev.organizer_name && (
                  <p className="mt-3 pt-3 border-t border-surface-100 text-xs text-surface-500">By {ev.organizer_name} • {ev.department}</p>
                )}

                {/* Admin actions */}
                {user?.role === 'admin' && ev.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-surface-100 flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleStatusChange(ev.event_id, 'approved')} className="btn btn-success btn-sm flex-1">
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => handleStatusChange(ev.event_id, 'rejected')} className="btn btn-danger btn-sm flex-1">
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
