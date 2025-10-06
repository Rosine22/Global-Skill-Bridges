import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Globe,
  Home,
  Briefcase,
  Users,
  Award,
  User,
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  BarChart3,
  FileText
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Profile', href: '/profile', icon: User },
      { name: 'Messages', href: '/messages', icon: MessageSquare }
    ];

    switch (user?.role) {
      case 'job-seeker':
        return [
          ...baseItems,
          { name: 'Find Jobs', href: '/dashboard', icon: Briefcase },
          { name: 'My Applications', href: '/applications', icon: Briefcase },
          { name: 'Mentorship', href: '/mentorship', icon: Users },
          { name: 'Skills Verification', href: '/skills-verification', icon: Award }
        ];
      case 'employer':
        return [
          ...baseItems,
          { name: 'My Jobs', href: '/dashboard', icon: Briefcase },
          { name: 'Applications', href: '/applications', icon: Briefcase },
          { name: 'Find Talent', href: '/talent', icon: Users }
        ];
      case 'mentor':
        return [
          ...baseItems,
          { name: 'Mentees', href: '/dashboard', icon: Users },
          { name: 'Sessions', href: '/sessions', icon: MessageSquare }
        ];
      case 'admin':
        return [
          ...baseItems,
          { name: 'User Management', href: '/admin/users', icon: Users },
          { name: 'Job Management', href: '/admin/jobs', icon: Briefcase },
          { name: 'Verifications', href: '/admin/verifications', icon: Award },
          { name: 'Reports', href: '/admin/reports', icon: Settings }
        ];
      case 'rtb-admin':
        return [
          ...baseItems,
          { name: 'Graduate Tracking', href: '/dashboard', icon: Users },
          { name: 'Employment Analytics', href: '/rtb/analytics', icon: BarChart3 },
          { name: 'Skills Gap Analysis', href: '/rtb/skills-gap', icon: Award },
          { name: 'Program Effectiveness', href: '/rtb/programs', icon: Briefcase },
          { name: 'Export Reports', href: '/rtb/reports', icon: FileText }
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center">
            <Globe className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">GSB</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-6 border-t">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('-', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 capitalize">
              {user?.role?.replace('-', ' ')} Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/notifications"
                className="relative p-2 text-gray-400 hover:text-gray-600"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;