import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Package, Calendar, Clock, CheckCircle2, XCircle, Clock4, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId, resourceName) => {
    if (!confirm(`Cancel booking for "${resourceName}"?`)) return;
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel booking');
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
          <h1 className="text-2xl font-bold text-surface-800">My Resource Bookings</h1>
          <p className="text-sm text-surface-500">Track and manage your campus equipment and facility requests</p>
        </div>
        <button onClick={() => navigate('/resources/book')} className="btn btn-primary btn-sm self-start sm:self-auto">
          Book New Resource
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-surface-100">
          <Package size={48} className="mx-auto text-surface-300 mb-3" />
          <h3 className="text-lg font-semibold text-surface-700">No Resource Bookings</h3>
          <p className="text-sm text-surface-500 mt-1 max-w-md mx-auto">
            You have not requested any campus resources yet. You can request projectors, audio systems, lab items, and more.
          </p>
          <button onClick={() => navigate('/resources/book')} className="btn btn-primary mt-5">
            Create Booking Request
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {bookings.map(b => {
            const canCancel = ['pending', 'approved'].includes(b.status);
            return (
              <div
                key={b.booking_id}
                className="bg-white rounded-xl shadow-sm border border-surface-100 p-5 flex flex-col justify-between card-hover"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`badge ${
                      b.status === 'approved' ? 'badge-approved' :
                      b.status === 'pending' ? 'badge-pending' :
                      b.status === 'rejected' ? 'badge-rejected' : 'badge-cancelled'
                    }`}>
                      {b.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
                      Qty: {b.quantity}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-surface-800">{b.resource_name}</h3>
                  <p className="text-xs text-surface-400 capitalize">{b.resource_type}</p>

                  {b.purpose && (
                    <p className="text-xs text-surface-600 mt-2 bg-surface-50 p-2.5 rounded-lg border border-surface-100">
                      <span className="font-medium text-surface-700">Purpose: </span>{b.purpose}
                    </p>
                  )}

                  <div className="space-y-1.5 mt-3 text-xs text-surface-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-primary-500" />
                      <span>{new Date(b.booking_date).toLocaleDateString('en', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary-500" />
                      <span>
                        {new Date(b.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(b.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {b.event_title && (
                      <div className="text-xs text-primary-600 font-medium">
                        Linked Event: {b.event_title}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-surface-100 flex items-center justify-between text-xs">
                  <span className="text-surface-400">
                    Requested on {new Date(b.created_at).toLocaleDateString()}
                  </span>

                  {canCancel && (
                    <button
                      onClick={() => handleCancel(b.booking_id, b.resource_name)}
                      className="font-medium text-red-600 hover:text-red-700 hover:underline"
                    >
                      Cancel Booking
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
