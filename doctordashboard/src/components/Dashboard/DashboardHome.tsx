import React from 'react';
import { Users, Calendar, FileText, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';

const DashboardHome: React.FC = () => {
  const { language, patients, healthAlerts, prescriptions } = useApp();

  const stats = [
    {
      icon: Users,
      label: t('totalPatients', language),
      value: patients.length,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Calendar,
      label: t('todayAppointments', language),
      value: patients.filter(p => p.appointmentDate === new Date().toISOString().split('T')[0]).length,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: FileText,
      label: t('pendingPrescriptions', language),
      value: prescriptions.length,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: AlertTriangle,
      label: t('unreadAlerts', language),
      value: healthAlerts.filter(alert => !alert.read).length,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
    },
  ];

  const recentPatients = patients.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} p-6 rounded-xl border border-gray-100`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('recentActivity', language)}
          </h3>
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-all">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-medium text-sm">
                    {patient.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <p className="text-sm text-gray-500">
                    {patient.appointmentDate} at {patient.appointmentTime}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  patient.status === 'completed' ? 'bg-green-100 text-green-800' :
                  patient.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {patient.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('quickActions', language)}
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Add New Patient</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-all">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Create Prescription</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-all">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Schedule Appointment</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-all">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      {healthAlerts.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('healthAlerts', language)}
          </h3>
          <div className="space-y-3">
            {healthAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'urgent' ? 'bg-red-50 border-red-500' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(alert.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;