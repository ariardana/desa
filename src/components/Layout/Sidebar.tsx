import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Megaphone,
  MessageSquare,
  Calendar,
  FileText,
  Camera,
  Users,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Beranda', href: '/', icon: Home, public: true },
    { name: 'Pengumuman', href: '/announcements', icon: Megaphone, public: true },
    { name: 'Aduan', href: '/complaints', icon: MessageSquare, public: false },
    { name: 'Agenda', href: '/events', icon: Calendar, public: true },
    { name: 'Dokumen', href: '/documents', icon: FileText, public: true },
    { name: 'Galeri', href: '/gallery', icon: Camera, public: true },
    { name: 'Kontak', href: '/contacts', icon: Users, public: true },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span className="font-medium">{item.name}</span>
              {isActive(item.href) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r"
                />
              )}
            </Link>
          );
        })}

        {/* Admin Section */}
        {user && (user.role === 'admin' || user.role === 'super_admin') && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r"
                    />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;