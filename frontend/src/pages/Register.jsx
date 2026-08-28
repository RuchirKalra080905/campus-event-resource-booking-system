import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Phone, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', department: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ ...form, role: 'student' });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Enter your full name', required: true },
    { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'Enter your email', required: true },
    { key: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: 'Min 6 characters', required: true },
    { key: 'phone', label: 'Phone', type: 'tel', icon: Phone, placeholder: 'Phone number' },
    { key: 'department', label: 'Department', type: 'text', icon: Building, placeholder: 'e.g. Computer Science' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-surface-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-2xl mb-3">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-primary-200 text-sm">Join Campus Hub as a student</p>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, icon: Icon, placeholder, required }) => (
              <div key={key}>
                <label className="input-label">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input type={type} value={form[key]} onChange={update(key)} placeholder={placeholder}
                    className="input pl-10" required={required} id={`register-${key}`} />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg" id="register-submit">
              {loading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-surface-600 mt-6">
            Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
