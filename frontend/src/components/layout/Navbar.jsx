import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) { /* silent */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-surface-200 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-surface-100 rounded-lg" id="menu-toggle">
            <Menu size={20} className="text-surface-600" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-surface-800">
              Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0]}</span>
            </h2>
            <p className="text-xs text-surface-500 capitalize">{user?.role} • {user?.department || 'Campus Hub'}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 hover:bg-surface-100 rounded-lg transition-colors"
            id="notification-bell"
          >
            <Bell size={20} className="text-surface-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-surface-100 rounded-lg transition-colors"
              id="profile-dropdown-trigger"
            >
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <ChevronDown size={14} className="text-surface-500" />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-surface-200 py-1 z-20 animate-fade-in">
                  <button onClick={() => { navigate('/profile'); setShowDropdown(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50">
                    <User size={16} /> Profile
                  </button>
                  <hr className="my-1 border-surface-100" />
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
