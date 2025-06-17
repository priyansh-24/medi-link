import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { getDatabase, ref, get } from 'firebase/database';
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
  const [activePrescriptions, setActivePrescriptions] = useState<any[]>([]);
  const [todayMedications, setTodayMedications] = useState<any[]>([]);
  const [healthScore, setHealthScore] = useState<string>('Loading...');
  const [lastCheckup, setLastCheckup] = useState<string>('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const db = getDatabase();
      const userRef = user.uid;

      try {
        // Fetch Appointments
        const bookingsSnap = await get(ref(db, `bookings/${userRef}`));
        if (bookingsSnap.exists()) {
          const data = Object.values(bookingsSnap.val()) as any[];
          data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          setAppointments(data);
          setNextAppointment(data[0] || null);
        }

        // Fetch Prescriptions
        const prescriptionsSnap = await get(ref(db, `prescriptions/${userRef}`));
        if (prescriptionsSnap.exists()) {
          const prescriptions = Object.values(prescriptionsSnap.val()) as any[];

          // Filter active prescriptions
          const today = new Date();
          const active = prescriptions.filter((p) => new Date(p.expiryDate) > today);
          setActivePrescriptions(active);

          // Last Checkup = most recent prescribedDate
          if (active.length > 0) {
            const latest = active.reduce((a, b) =>
              new Date(a.prescribedDate) > new Date(b.prescribedDate) ? a : b
            );
            setLastCheckup(new Date(latest.prescribedDate).toDateString());
          } else {
            setLastCheckup('No active prescriptions');
          }

          // Build today's medications
          const meds = [];
          active.forEach((p) => {
            const times = Array.isArray(p.schedule)
              ? p.schedule
              : Object.values(p.schedule || {});
            times.forEach((time: string) => {
              meds.push({
                name: `${p.medication} ${p.dosage}`,
                time,
                status: 'pending'
              });
            });
          });
          setTodayMedications(meds);
        }

        // Fetch Profile for Health Score
        const profileSnap = await get(ref(db, `profiles/${userRef}`));
        if (profileSnap.exists()) {
          const profile = profileSnap.val();
          setHealthScore(profile.healthScore || 'N/A');
        } else {
          setHealthScore('N/A');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchData();
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
    {
      name: 'Active Prescriptions',
      value: `${activePrescriptions.length}`,
      icon: Pill,
      color: 'bg-green-500'
    },
    {
      name: 'Health Score',
      value: healthScore,
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      name: 'Last Checkup',
      value: lastCheckup,
      icon: Activity,
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    { name: 'Book Appointment', icon: Calendar, href: '/book-appointment', color: 'bg-blue-600' },
    { name: 'Emergency Services', icon: AlertTriangle, href: '/emergency', color: 'bg-red-600' },
    { name: 'View Prescriptions', icon: FileText, href: '/prescriptions', color: 'bg-green-600' },
    { name: 'Update Profile', icon: Users, href: '/profile', color: 'bg-purple-600' }
  ];

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

          {/* Stats Section */}
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

          {/* Today’s Medications and Appointments */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Medications */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Today's Medications
                </h3>
              </div>
              <div className="p-6 space-y-4 max-h-64 overflow-y-auto">
                {todayMedications.length > 0 ? (
                  todayMedications.map((med, index) => (
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
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No medications scheduled for today.</p>
                )}
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
