import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Package, Search, Plus, MapPin, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResourceList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', type: '', available: false });

  // Modal state for Admin CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    resource_name: '',
    resource_type: '',
    description: '',
    quantity: 1,
    location: '',
    status: 'available',
  });

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchResources = async () => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.available) params.available = 'true';
      const res = await api.get('/resources', { params });
      setResources(res.data.resources || []);
      setTypes(res.data.types || []);
    } catch (err) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingResource(null);
    setFormData({
      resource_name: '',
      resource_type: '',
      description: '',
      quantity: 1,
      location: '',
      status: 'available',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (res) => {
    setEditingResource(res);
    setFormData({
      resource_name: res.resource_name,
      resource_type: res.resource_type,
      description: res.description || '',
      quantity: res.quantity,
      location: res.location || '',
      status: res.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingResource) {
        await api.put(`/resources/${editingResource.resource_id}`, formData);
        toast.success('Resource updated successfully');
      } else {
        await api.post('/resources', formData);
        toast.success('Resource created successfully');
      }
      setModalOpen(false);
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (resourceId, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/resources/${resourceId}`);
      toast.success('Resource deleted');
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot delete resource with active bookings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Campus Resources</h1>
          <p className="text-sm text-surface-500">Audio/Visual, IT equipment, hall equipment and infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <button onClick={handleOpenCreate} className="btn btn-secondary">
              <Plus size={16} /> Add Resource
            </button>
          )}
          <button onClick={() => navigate('/resources/book')} className="btn btn-primary">
            Request Booking
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search resource name or description..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="input pl-10"
            />
          </div>
          <select
            value={filters.type}
            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            className="input w-auto"
          >
            <option value="">All Categories / Types</option>
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-3 py-2 bg-surface-50 rounded-lg text-xs font-medium text-surface-700 cursor-pointer hover:bg-surface-100 select-none">
            <input
              type="checkbox"
              checked={filters.available}
              onChange={e => setFilters(f => ({ ...f, available: e.target.checked }))}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            Available Only
          </label>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-surface-100">
          <Package size={48} className="mx-auto text-surface-300 mb-3" />
          <p className="text-surface-700 font-semibold">No resources match your search</p>
          <p className="text-sm text-surface-500 mt-1">Try clearing some filter criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(item => {
            const isAvail = item.status === 'available' && item.available_quantity > 0;
            return (
              <div
                key={item.resource_id}
                className="bg-white rounded-xl shadow-sm border border-surface-100 p-5 flex flex-col justify-between card-hover"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`badge ${
                      item.status === 'available' ? 'badge-approved' :
                      item.status === 'maintenance' ? 'badge-pending' : 'badge-rejected'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
                      {item.resource_type}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-surface-800">{item.resource_name}</h3>
                  {item.description && (
                    <p className="text-xs text-surface-500 mt-1 line-clamp-2">{item.description}</p>
                  )}

                  <div className="mt-4 space-y-2 text-xs text-surface-600">
                    <div className="flex items-center justify-between p-2 bg-surface-50 rounded-lg">
                      <span className="text-surface-500">Inventory Status</span>
                      <span className="font-semibold text-surface-800">
                        {item.available_quantity} / {item.quantity} available
                      </span>
                    </div>

                    {item.location && (
                      <div className="flex items-center gap-1.5 text-surface-500">
                        <MapPin size={13} className="text-primary-500" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigate(`/resources/book?resource_id=${item.resource_id}`)}
                    disabled={!isAvail}
                    className={`btn btn-sm flex-1 ${isAvail ? 'btn-primary' : 'bg-surface-200 text-surface-400 cursor-not-allowed'}`}
                  >
                    {isAvail ? 'Book Now' : 'Unavailable'}
                  </button>

                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 hover:bg-surface-100 rounded-lg text-surface-600 hover:text-primary-600"
                        title="Edit Resource"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.resource_id, item.resource_name)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-surface-600 hover:text-red-600"
                        title="Delete Resource"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <h2 className="text-xl font-bold text-surface-800 mb-4">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="input-label">Resource Name *</label>
                <input
                  type="text"
                  required
                  value={formData.resource_name}
                  onChange={e => setFormData(f => ({ ...f, resource_name: e.target.value }))}
                  className="input"
                  placeholder="e.g. Sony 4K Projector"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Category / Type *</label>
                  <input
                    type="text"
                    required
                    value={formData.resource_type}
                    onChange={e => setFormData(f => ({ ...f, resource_type: e.target.value }))}
                    className="input"
                    placeholder="Electronics, Audio, Furniture..."
                  />
                </div>
                <div>
                  <label className="input-label">Total Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={e => setFormData(f => ({ ...f, quantity: Number(e.target.value) }))}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="input"
                  placeholder="Specs, model info, accessories included..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Location / Room</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                    className="input"
                    placeholder="e.g. IT Store Room"
                  />
                </div>
                <div>
                  <label className="input-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                    className="input"
                  >
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-100">
                <button type="submit" className="btn btn-primary flex-1">
                  Save Resource
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
