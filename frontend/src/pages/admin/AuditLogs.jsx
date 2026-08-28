import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileText, Search, ShieldAlert, Calendar, User, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', table_name: '' });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (filters.action) params.action = filters.action;
      if (filters.table_name) params.table_name = filters.table_name;
      const res = await api.get('/audit', { params });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">System Audit Logs</h1>
          <p className="text-sm text-surface-500">
            Immutable log of database operations, status transitions, and critical system modifications
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filters.table_name}
            onChange={e => setFilters(f => ({ ...f, table_name: e.target.value }))}
            className="input w-auto"
          >
            <option value="">All Database Tables</option>
            <option value="events">events</option>
            <option value="resource_bookings">resource_bookings</option>
            <option value="users">users</option>
            <option value="resources">resources</option>
            <option value="venues">venues</option>
          </select>

          <input
            type="text"
            placeholder="Filter by Action (e.g. CREATE, STATUS_CHANGE_APPROVED)..."
            value={filters.action}
            onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
            className="input flex-1"
          />
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
                  <th>Log ID</th>
                  <th>Action</th>
                  <th>Target Table</th>
                  <th>Record ID</th>
                  <th>Description</th>
                  <th>Triggered By</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-surface-500">
                      No audit records found.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.log_id}>
                      <td className="font-mono text-xs text-surface-400">#{log.log_id}</td>
                      <td>
                        <span className={`badge ${
                          log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-800' :
                          log.action.includes('APPROVED') ? 'bg-blue-100 text-blue-800' :
                          log.action.includes('DELETE') ? 'bg-red-100 text-red-800' : 'bg-surface-100 text-surface-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-primary-600 font-semibold">{log.table_name}</td>
                      <td className="font-mono text-xs text-surface-600">{log.record_id || '—'}</td>
                      <td className="max-w-md truncate text-xs text-surface-700 font-medium" title={log.description}>
                        {log.description}
                      </td>
                      <td>
                        <span className="text-xs text-surface-800 font-medium">
                          {log.user_name ? `${log.user_name}` : 'System / Auto Trigger'}
                        </span>
                      </td>
                      <td className="text-xs text-surface-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
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
