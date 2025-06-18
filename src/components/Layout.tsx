import React, { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Home,
  User,
  AlertTriangle,
  FileText,
  Calendar,
  MessageCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Emergency', href: '/emergency', icon: AlertTriangle },
    { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
    { name: 'Book Appointment', href: '/book-appointment', icon: Calendar },
  ];

  const renderNavItems = () =>
    navigation.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname === item.href;
      return (
        <button
          key={item.name}
          onClick={() => {
            navigate(item.href);
            setIsMobileMenuOpen(false);
          }}
          className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full text-left ${
            isActive
              ? 'bg-blue-100 text-blue-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Icon className="mr-4 h-6 w-6" />
          {item.name}
        </button>
      );
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu */}
      {user && (
        <div className={`fixed inset-0 z-50 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">MediLink</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <nav className="mt-5 px-2">{renderNavItems()}</nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      {user && (
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Heart className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MediLink</span>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">{renderNavItems()}</nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`${user ? 'lg:pl-64' : ''} flex flex-col flex-1`}>
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          {user && (
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Ask our AI assistant..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            {user && (
              <div className="ml-4 flex items-center md:ml-6">
                {user.profileImage ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={
                      user?.profileImage ||
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
                    }
                    alt="Profile"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                <span className="ml-3 text-gray-700 text-sm font-medium hidden md:block">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-3 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
