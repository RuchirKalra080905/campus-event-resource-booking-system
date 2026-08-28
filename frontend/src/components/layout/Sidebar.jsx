import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calendar, BookOpen, Package, MapPin, Users, BarChart3, FileText, Bell, Tag, ClipboardList, X, GraduationCap } from 'lucide-react';

const navItems = {
  student: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/events', icon: Calendar, label: 'Browse Events' },
    { to: '/my-registrations', icon: BookOpen, label: 'My Registrations' },
    { to: '/resources', icon: Package, label: 'Resources' },
    { to: '/resources/book', icon: ClipboardList, label: 'Book Resource' },
    { to: '/my-bookings', icon: FileText, label: 'My Bookings' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ],
  faculty: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/events', icon: Calendar, label: 'Events' },
    { to: '/events/create', icon: BookOpen, label: 'Create Event' },
    { to: '/resources', icon: Package, label: 'Resources' },
    { to: '/resources/book', icon: ClipboardList, label: 'Book Resource' },
    { to: '/my-bookings', icon: FileText, label: 'My Bookings' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/events', icon: Calendar, label: 'Manage Events' },
    { to: '/events/create', icon: BookOpen, label: 'Add Event' },
    { to: '/resources', icon: Package, label: 'Resources' },
    { to: '/manage-bookings', icon: ClipboardList, label: 'Manage Bookings' },
    { to: '/manage-venues', icon: MapPin, label: 'Manage Venues' },
    { to: '/manage-categories', icon: Tag, label: 'Categories' },
    { to: '/manage-users', icon: Users, label: 'Manage Users' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/audit-logs', icon: FileText, label: 'Audit Logs' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ],
};

export default function Sidebar({ onClose }) {
  const { user } = useAuth();
  const items = navItems[user?.role] || navItems.student;

  return (
    <div className="h-full flex flex-col bg-surface-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Campus Hub</h1>
            <p className="text-[10px] text-surface-400 uppercase tracking-widest">Events & Resources</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 hover:bg-surface-700 rounded">
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/20 text-primary-300 shadow-sm'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-surface-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
