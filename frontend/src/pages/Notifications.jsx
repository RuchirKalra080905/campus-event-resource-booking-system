import { useState, useEffect } from 'react';
import api from '../services/api';
import { Bell, CheckCheck, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
    } catch (err) { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to update notifications');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-amber-500" />;
      case 'error': return <AlertCircle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-primary-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Notifications</h1>
          <p className="text-sm text-surface-500">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification(s)` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm flex items-center gap-1.5">
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-surface-100">
          <Bell size={48} className="mx-auto text-surface-300 mb-3" />
          <h3 className="text-base font-semibold text-surface-700">No Notifications</h3>
          <p className="text-xs text-surface-500 mt-1">
            System notices about event approvals, cancellations, and booking updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.notification_id}
              onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
              className={`p-4 rounded-xl border transition-all flex items-start gap-4 cursor-pointer ${
                n.is_read
                  ? 'bg-white border-surface-100 opacity-80'
                  : 'bg-primary-50/40 border-primary-200 shadow-sm'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {n.type === 'success' ? <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> :
                 n.type === 'error' ? <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" /> :
                 n.type === 'warning' ? <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" /> :
                 <span className="w-2.5 h-2.5 rounded-full bg-primary-500 block" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm ${n.is_read ? 'font-medium text-surface-800' : 'font-bold text-surface-900'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-surface-400 shrink-0">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-surface-600 mt-1 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {!n.is_read && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleMarkRead(n.notification_id); }}
                  className="p-1 hover:bg-surface-200 rounded text-surface-500 shrink-0"
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
