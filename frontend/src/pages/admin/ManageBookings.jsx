import { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardList, Check, X, Search, Calendar, Clock, Package, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/bookings', { params });
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId, resourceName) => {
    try {
      await api.put(`/bookings/${bookingId}/approve`);
      toast.success(`Booking for "${resourceName}" approved! Inventory updated.`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed');
    }
  };

  const handleReject = async (bookingId, resourceName) => {
    try {
      await api.put(`/bookings/${bookingId}/reject`);
      toast.success(`Booking for "${resourceName}" rejected`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rejection failed');
    }
  };

  const filteredBookings = bookings.filter(b =>
    b.resource_name.toLowerCase().includes(search.toLowerCase()) ||
    b.user_name.toLowerCase().includes(search.toLowerCase()) ||
    (b.purpose && b.purpose.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Resource Booking Requests</h1>
          <p className="text-sm text-surface-500">Review, approve, or reject campus equipment allocations</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Search by requester or resource..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Requester</th>
                  <th>Quantity</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-surface-500">
                      No resource booking requests found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr key={b.booking_id}>
                      <td>
                        <div className="font-semibold text-surface-800 text-sm">{b.resource_name}</div>
                        <div className="text-xs text-surface-400 capitalize">{b.resource_type}</div>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-surface-800">{b.user_name}</div>
                        <div className="text-xs text-surface-500">{b.user_email}</div>
                      </td>
                      <td>
                        <span className="font-bold text-primary-700">{b.quantity} unit(s)</span>
                      </td>
                      <td className="text-xs text-surface-600">
                        <div>{new Date(b.booking_date).toLocaleDateString()}</div>
                        <div className="text-surface-400">
                          {new Date(b.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="max-w-xs truncate text-xs text-surface-600" title={b.purpose}>
                        {b.purpose || '—'}
                      </td>
                      <td>
                        <span className={`badge ${
                          b.status === 'approved' ? 'badge-approved' :
                          b.status === 'pending' ? 'badge-pending' :
                          b.status === 'rejected' ? 'badge-rejected' : 'badge-cancelled'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right">
                        {b.status === 'pending' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(b.booking_id, b.resource_name)}
                              className="btn btn-success btn-sm px-2.5 py-1"
                              title="Approve Booking"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(b.booking_id, b.resource_name)}
                              className="btn btn-danger btn-sm px-2.5 py-1"
                              title="Reject Booking"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-surface-400">
                            {b.approved_by_name ? `By ${b.approved_by_name}` : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
