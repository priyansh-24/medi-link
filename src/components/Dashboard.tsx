import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { getDatabase, ref, get, child } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import {
  Calendar,
  FileText,
  AlertTriangle,
  Clock,
  Heart,
  Activity,
  Pill,
  Users
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getDatabase();
      const bookingsRef = ref(db, `bookings/${user.uid}`);

      try {
        const snapshot = await get(bookingsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const allAppointments = Object.values(data) as any[];

          // Sort by timestamp ascending (earliest first)
          allAppointments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

          setAppointments(allAppointments);
          setNextAppointment(allAppointments[0] || null);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  const stats = [
    {
      name: 'Next Appointment',
      value: nextAppointment
        ? `${nextAppointment.preferredDate}, ${nextAppointment.preferredTime}`
        : 'No upcoming appointment',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    { name: 'Active Prescriptions', value: '3', icon: Pill, color: 'bg-green-500' },
    { name: 'Health Score', value: '85/100', icon: Heart, color: 'bg-red-500' },
    { name: 'Last Checkup', value: '2 weeks ago', icon: Activity, color: 'bg-purple-500' }
  ];

  const quickActions = [
    { name: 'Book Appointment', icon: Calendar, href: '/book-appointment', color: 'bg-blue-600' },
    { name: 'Emergency Services', icon: AlertTriangle, href: '/emergency', color: 'bg-red-600' },
    { name: 'View Prescriptions', icon: FileText, href: '/prescriptions', color: 'bg-green-600' },
    { name: 'Update Profile', icon: Users, href: '/profile', color: 'bg-purple-600' }
  ];

  const recentMedications = [
    { name: 'Aspirin 100mg', time: '8:00 AM', status: 'taken' },
    { name: 'Vitamin D3', time: '12:00 PM', status: 'pending' },
    { name: 'Blood Pressure Med', time: '6:00 PM', status: 'pending' }
  ];

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-md ${item.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                          <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.name}
                    onClick={() => navigate(action.href)}
                    className={`${action.color} hover:opacity-90 text-white rounded-lg p-6 text-center transition-all duration-200 transform hover:scale-105`}
                  >
                    <Icon className="h-8 w-8 mx-auto mb-2" />
                    <span className="font-medium">{action.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Medication Reminders */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Today's Medications
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {recentMedications.map((med, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{med.name}</p>
                      <p className="text-sm text-gray-500">{med.time}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      med.status === 'taken'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {med.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-500" />
                  Upcoming Appointments
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-36 overflow-y-auto pr-2">
                  {appointments.map((appointment, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4">
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.symptoms || 'General Consultation'}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.specialty}</p>
                      <p className="text-sm text-blue-600">
                        {new Date(appointment.preferredDate).toDateString()} at {appointment.preferredTime}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="mt-4 w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors duration-200"
                >
                  Book New Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
