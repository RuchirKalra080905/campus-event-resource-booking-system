import { useState, useEffect } from 'react';
import api from '../../services/api';
import { MapPin, Plus, Edit, Trash2, Search, Users, Building, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [form, setForm] = useState({
    venue_name: '',
    building: '',
    floor: '',
    capacity: 100,
    location: '',
    facilities: '',
    status: 'available',
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await api.get('/venues');
      setVenues(res.data);
    } catch (err) {
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingVenue(null);
    setForm({
      venue_name: '',
      building: '',
      floor: '',
      capacity: 100,
      location: '',
      facilities: '',
      status: 'available',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVenue(v);
    setForm({
      venue_name: v.venue_name,
      building: v.building,
      floor: v.floor || '',
      capacity: v.capacity,
      location: v.location || '',
      facilities: v.facilities || '',
      status: v.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await api.put(`/venues/${editingVenue.venue_id}`, form);
        toast.success('Venue updated successfully');
      } else {
        await api.post('/venues', form);
        toast.success('Venue created successfully');
      }
      setModalOpen(false);
      fetchVenues();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (venueId, name) => {
    if (!confirm(`Are you sure you want to delete venue "${name}"?`)) return;
    try {
      await api.delete(`/venues/${venueId}`);
      toast.success('Venue deleted');
      fetchVenues();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete venue with linked events');
    }
  };

  const filteredVenues = venues.filter(v =>
    v.venue_name.toLowerCase().includes(search.toLowerCase()) ||
    v.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Venue Management</h1>
          <p className="text-sm text-surface-500">Auditoriums, seminar halls, labs, and conference rooms</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Add Venue
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search venue by name or building..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map(v => (
            <div
              key={v.venue_id}
              className="bg-white rounded-xl shadow-sm border border-surface-100 p-5 flex flex-col justify-between card-hover"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`badge ${
                    v.status === 'available' ? 'badge-approved' :
                    v.status === 'maintenance' ? 'badge-pending' : 'badge-rejected'
                  }`}>
                    {v.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-primary-700 font-semibold bg-primary-50 px-2 py-0.5 rounded">
                    Max: {v.capacity} seats
                  </span>
                </div>

                <h3 className="text-base font-semibold text-surface-800">{v.venue_name}</h3>
                <p className="text-xs text-surface-500">{v.building} {v.floor ? `(${v.floor})` : ''}</p>

                {v.location && (
                  <p className="text-xs text-surface-500 mt-1 flex items-center gap-1">
                    <MapPin size={12} className="text-primary-500" /> {v.location}
                  </p>
                )}

                {v.facilities && (
                  <div className="mt-3 p-2.5 bg-surface-50 rounded-lg text-xs text-surface-600">
                    <span className="font-semibold text-surface-700">Facilities: </span>
                    {v.facilities}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-surface-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="p-1.5 hover:bg-surface-100 rounded-lg text-surface-600 hover:text-primary-600"
                  title="Edit Venue"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(v.venue_id, v.venue_name)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-surface-600 hover:text-red-600"
                  title="Delete Venue"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Venue Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-surface-800 mb-4">
              {editingVenue ? 'Edit Venue' : 'Add New Venue'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="input-label">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={form.venue_name}
                  onChange={e => setForm(f => ({ ...f, venue_name: e.target.value }))}
                  className="input"
                  placeholder="e.g. Main Auditorium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Building *</label>
                  <input
                    type="text"
                    required
                    value={form.building}
                    onChange={e => setForm(f => ({ ...f, building: e.target.value }))}
                    className="input"
                    placeholder="e.g. Central Block"
                  />
                </div>
                <div>
                  <label className="input-label">Floor</label>
                  <input
                    type="text"
                    value={form.floor}
                    onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                    className="input"
                    placeholder="e.g. 2nd Floor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Capacity (seats) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.capacity}
                    onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="input"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="input-label">Location Details</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="input"
                  placeholder="e.g. North Wing, Entrance Gate 2"
                />
              </div>

              <div>
                <label className="input-label">Available Facilities</label>
                <textarea
                  rows={2}
                  value={form.facilities}
                  onChange={e => setForm(f => ({ ...f, facilities: e.target.value }))}
                  className="input"
                  placeholder="e.g. Projector, Sound System, AC, Stage, Green Room"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-100">
                <button type="submit" className="btn btn-primary flex-1">
                  Save Venue
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
