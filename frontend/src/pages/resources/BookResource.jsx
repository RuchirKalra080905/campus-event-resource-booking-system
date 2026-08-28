import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Package, Calendar, Clock, FileText, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookResource() {
  const [searchParams] = useSearchParams();
  const initialResourceId = searchParams.get('resource_id') || '';
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    resource_id: initialResourceId,
    event_id: '',
    quantity: 1,
    booking_date: '',
    start_time: '09:00',
    end_time: '12:00',
    purpose: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRes, evRes] = await Promise.all([
        api.get('/resources?available=true'),
        api.get('/events')
      ]);
      setResources(resRes.data.resources || []);
      setMyEvents(evRes.data.events || []);

      if (initialResourceId) {
        const found = resRes.data.resources?.find(r => r.resource_id === Number(initialResourceId));
        if (found) setSelectedResource(found);
      }
    } catch (err) {
      toast.error('Failed to load resources for booking');
    }
  };

  const handleResourceChange = (e) => {
    const rId = e.target.value;
    setForm(f => ({ ...f, resource_id: rId }));
    const found = resources.find(r => r.resource_id === Number(rId));
    setSelectedResource(found || null);
    if (found && form.quantity > found.available_quantity) {
      setForm(f => ({ ...f, quantity: 1 }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.resource_id) return toast.error('Please select a resource');
    if (!form.booking_date) return toast.error('Please select booking date');
    if (form.start_time >= form.end_time) return toast.error('End time must be after start time');

    const start_datetime = `${form.booking_date} ${form.start_time}:00`;
    const end_datetime = `${form.booking_date} ${form.end_time}:00`;

    setLoading(true);
    try {
      await api.post('/bookings', {
        resource_id: Number(form.resource_id),
        event_id: form.event_id ? Number(form.event_id) : null,
        quantity: Number(form.quantity),
        booking_date: form.booking_date,
        start_datetime,
        end_datetime,
        purpose: form.purpose,
      });
      toast.success('Resource booking requested! Pending admin approval.');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/resources')} className="flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 transition-colors">
        <ArrowLeft size={16} /> Back to Resources
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
        <div className="h-3 gradient-warm" />
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-surface-800 mb-1">Request Campus Resource</h1>
          <p className="text-sm text-surface-500 mb-6">
            Submit a booking request for lab equipment, audiovisual aids, or portable furniture.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Select Resource *</label>
              <div className="relative">
                <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                <select
                  required
                  value={form.resource_id}
                  onChange={handleResourceChange}
                  className="input pl-10"
                >
                  <option value="">-- Select Available Resource --</option>
                  {resources.map(r => (
                    <option key={r.resource_id} value={r.resource_id}>
                      {r.resource_name} ({r.resource_type} • {r.available_quantity} available)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedResource && (
              <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{selectedResource.resource_name}</p>
                  <p className="mt-0.5">{selectedResource.description || 'No description provided.'}</p>
                  <p className="mt-1 font-medium">
                    Currently in stock: <span className="underline">{selectedResource.available_quantity} units available</span> for reservation.
                  </p>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Quantity Needed *</label>
                <input
                  type="number"
                  min={1}
                  max={selectedResource ? selectedResource.available_quantity : 20}
                  required
                  value={form.quantity}
                  onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                  className="input"
                />
              </div>

              <div>
                <label className="input-label">Related Event (Optional)</label>
                <select
                  value={form.event_id}
                  onChange={e => setForm(f => ({ ...f, event_id: e.target.value }))}
                  className="input"
                >
                  <option value="">None (Individual / Department Use)</option>
                  {myEvents.map(e => (
                    <option key={e.event_id} value={e.event_id}>{e.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Booking Date *</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="date"
                    required
                    value={form.booking_date}
                    onChange={e => setForm(f => ({ ...f, booking_date: e.target.value }))}
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
              <label className="input-label">Purpose / Usage Details *</label>
              <textarea
                rows={3}
                required
                placeholder="Explain what the resource will be used for (e.g. Lab experiment demonstration, Guest lecture projection)..."
                value={form.purpose}
                onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                className="input"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-surface-100">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 btn-lg"
              >
                {loading ? 'Submitting Request...' : 'Submit Booking Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/resources')}
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
