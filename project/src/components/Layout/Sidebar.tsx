import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  AlertTriangle,
  MessageSquare,
  User,
  LogOut,
  Stethoscope,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';

const Sidebar: React.FC = () => {
  const { language, activeSection, setActiveSection, setIsAuthenticated, setCurrentDoctor } = useApp();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard', language) },
    { id: 'patients', icon: Users, label: t('patients', language) },
    { id: 'prescriptions', icon: FileText, label: t('prescriptions', language) },
    { id: 'appointments', icon: Calendar, label: t('appointments', language) },
    { id: 'health-alerts', icon: AlertTriangle, label: t('healthAlerts', language) },
    { id: 'feedback', icon: MessageSquare, label: t('feedback', language) },
    { id: 'profile', icon: User, label: t('profile', language) },
  ];

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentDoctor(null);
    setActiveSection('dashboard');
  };

  return (
    <div className="bg-white h-full w-64 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">MediCare</h2>
            <p className="text-sm text-gray-500">Doctor Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeSection === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('logout', language)}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;