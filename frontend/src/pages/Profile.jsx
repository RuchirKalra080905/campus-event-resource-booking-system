import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Phone, Building, Shield, Calendar, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-800">My Profile</h1>
        <p className="text-sm text-surface-500">Manage your personal details and campus credentials</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
        <div className="h-24 gradient-primary relative">
          <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl bg-white p-1 shadow-lg">
            <div className="w-full h-full gradient-primary rounded-xl flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="pt-10 p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-surface-900">{user?.name}</h2>
              <p className="text-xs text-surface-500 mt-0.5">{user?.email}</p>
            </div>
            <span className={`badge ${
              user?.role === 'admin' ? 'bg-purple-100 text-purple-800' :
              user?.role === 'faculty' ? 'badge-approved' : 'bg-blue-100 text-blue-800'
            }`}>
              {user?.role?.toUpperCase()}
            </span>
          </div>

          {!editing ? (
            <div className="space-y-4 pt-2">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-50 rounded-xl border border-surface-100">
                  <div className="flex items-center gap-2 text-xs text-surface-500 mb-1">
                    <Building size={14} className="text-primary-500" /> Department
                  </div>
                  <p className="text-sm font-semibold text-surface-800">{user?.department || 'Not specified'}</p>
                </div>

                <div className="p-4 bg-surface-50 rounded-xl border border-surface-100">
                  <div className="flex items-center gap-2 text-xs text-surface-500 mb-1">
                    <Phone size={14} className="text-primary-500" /> Phone Number
                  </div>
                  <p className="text-sm font-semibold text-surface-800">{user?.phone || 'Not specified'}</p>
                </div>
              </div>

              <div className="p-4 bg-surface-50 rounded-xl border border-surface-100">
                <div className="flex items-center gap-2 text-xs text-surface-500 mb-1">
                  <Shield size={14} className="text-primary-500" /> Account Security & Role Permissions
                </div>
                <p className="text-xs text-surface-700 mt-1">
                  {user?.role === 'admin' ? 'Full system administrative access to events, venues, bookings, audit logs, and users.' :
                   user?.role === 'faculty' ? 'Faculty access to organize campus events, request resources, and review attendee registrations.' :
                   'Student access to discover campus events, register for sessions, and submit resource booking requests.'}
                </p>
              </div>

              <div className="pt-4 border-t border-surface-100">
                <button onClick={() => setEditing(true)} className="btn btn-primary">
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="input"
                  />
                </div>

                <div>
                  <label className="input-label">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-100">
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn btn-secondary px-6"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
