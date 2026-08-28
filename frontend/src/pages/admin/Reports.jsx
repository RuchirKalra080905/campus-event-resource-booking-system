import { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Download, Calendar, Filter, Star, Users, MapPin, Package, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];

const REPORT_TABS = [
  { id: 'popular_events', label: 'Popular Events' },
  { id: 'events_by_category', label: 'Events by Category' },
  { id: 'monthly_registrations', label: 'Monthly Registrations' },
  { id: 'resource_utilization', label: 'Resource Utilization' },
  { id: 'popular_resources', label: 'Most Booked Resources' },
  { id: 'venue_utilization', label: 'Venue Utilization' },
  { id: 'user_activity', label: 'User Activity' },
  { id: 'booking_status', label: 'Booking Statuses' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('popular_events');
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [activeTab, dateFrom, dateTo]);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/reports');
      setSummary(res.data.summary);
    } catch (err) { /* silent */ }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = { report_type: activeTab };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await api.get('/reports', { params });
      setReportData(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!reportData || reportData.length === 0) {
      return toast.error('No data to export');
    }
    const headers = Object.keys(reportData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const row of reportData) {
      const values = headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
        const escaped = val.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campushub_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV report exported!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Analytics & Reports</h1>
          <p className="text-sm text-surface-500">Database-backed analytics, DBMS views, and reporting</p>
        </div>
        <button onClick={exportCSV} className="btn btn-secondary">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-100">
            <p className="text-xs text-surface-500">Total Approved Events</p>
            <p className="text-xl font-bold text-surface-800 mt-1">{summary.total_events}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-100">
            <p className="text-xs text-surface-500">Active Registrations</p>
            <p className="text-xl font-bold text-surface-800 mt-1">{summary.total_registrations}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-100">
            <p className="text-xs text-surface-500">Resource Bookings</p>
            <p className="text-xl font-bold text-surface-800 mt-1">{summary.total_bookings}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-surface-100">
            <p className="text-xs text-surface-500">Registered Users</p>
            <p className="text-xl font-bold text-surface-800 mt-1">{summary.total_users}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-surface-200">
        {REPORT_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-surface-600 hover:bg-surface-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4 flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xs font-semibold text-surface-700 flex items-center gap-1.5 shrink-0">
          <Filter size={14} /> Date Filter:
        </span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="input text-xs py-1.5"
            placeholder="From Date"
          />
          <span className="text-xs text-surface-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="input text-xs py-1.5"
            placeholder="To Date"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="text-xs text-primary-600 hover:underline font-medium ml-auto"
          >
            Reset Dates
          </button>
        )}
      </div>

      {/* Report Chart and Table Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Chart Rendering */}
          <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
            <h3 className="text-sm font-semibold text-surface-800 mb-4 flex items-center gap-2">
              <BarChart3 size={16} /> Visual Representation
            </h3>

            {reportData.length === 0 ? (
              <p className="text-sm text-surface-500 text-center py-10">No data available for this report period.</p>
            ) : activeTab === 'popular_events' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="title" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="registrations" fill="#6366f1" radius={[4, 4, 0, 0]} name="Registrations" />
                </BarChart>
              </ResponsiveContainer>
            ) : activeTab === 'events_by_category' ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={reportData} dataKey="event_count" nameKey="category_name" cx="50%" cy="50%" outerRadius={100} label={({ category_name, event_count }) => `${category_name}: ${event_count}`}>
                    {reportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : activeTab === 'monthly_registrations' ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={3} name="Registrations" />
                </LineChart>
              </ResponsiveContainer>
            ) : activeTab === 'resource_utilization' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="resource_name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip />
                  <Bar dataKey="utilization_pct" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            ) : activeTab === 'popular_resources' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="resource_name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total_bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Total Bookings" />
                </BarChart>
              </ResponsiveContainer>
            ) : activeTab === 'venue_utilization' ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="venue_name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="events_hosted" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Events Hosted" />
                </BarChart>
              </ResponsiveContainer>
            ) : activeTab === 'booking_status' ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={reportData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={100} label={({ status, count }) => `${status}: ${count}`}>
                    {reportData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="event_registrations" fill="#6366f1" name="Event Registrations" />
                  <Bar dataKey="resource_bookings" fill="#10b981" name="Resource Bookings" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Table Rendering */}
          <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
            <div className="p-4 border-b border-surface-100 font-semibold text-surface-800 text-sm">
              Tabular Dataset ({reportData.length} records)
            </div>
            <div className="table-container">
              {reportData.length === 0 ? (
                <p className="text-sm text-surface-500 text-center py-8">No records to display.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      {Object.keys(reportData[0]).map(k => (
                        <th key={k} className="capitalize">{k.replace(/_/g, ' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i}>
                            {val === null || val === undefined ? '—' : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
