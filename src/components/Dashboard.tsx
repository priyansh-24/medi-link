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
  Users,
  Check
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
          const meds: React.SetStateAction<any[]> = [];
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
  {Object.entries(
    todayMedications.reduce((acc: any, med) => {
      if (!acc[med.name]) acc[med.name] = [];
      acc[med.name].push(med);
      return acc;
    }, {})
  ).map(([name, meds]: any, index) => (
    <div key={index} className="bg-gray-50 rounded-lg p-4 shadow flex flex-col gap-2">
      <p className="text-sm font-semibold text-gray-900">{name}</p>
      <div className="flex gap-4">
        {meds.map((med: any, idx: number) => {
          const formatTime = (timeStr: string) => {
          if (!timeStr.includes(':')) timeStr = timeStr.replace(/(am|pm)/i, ':00$1');
          const date = new Date(`1970-01-01T${convertTo24Hr(timeStr)}`);
          if (isNaN(date.getTime())) return timeStr.toUpperCase(); // fallback
          return date.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        };

        const convertTo24Hr = (time: string) => {
          const [_, hourStr, minuteStr, meridian] = time
            .match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)/i) || [];
          if (!hourStr || !meridian) return time;
          let hour = parseInt(hourStr);
          const minute = minuteStr || '00';
          if (meridian.toLowerCase() === 'pm' && hour !== 12) hour += 12;
          if (meridian.toLowerCase() === 'am' && hour === 12) hour = 0;
          return `${hour.toString().padStart(2, '0')}:${minute}`;
        };


          return (
            <div
              key={idx}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold cursor-pointer transition ${
                med.status === 'taken'
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-300 text-yellow-900'
              }`}
              title={formatTime(med.time)}
              onClick={() => {
                const updated = [...todayMedications];
                const medIndex = updated.findIndex(
                  (m) => m.name === med.name && m.time === med.time
                );
                if (medIndex !== -1) {
                  updated[medIndex].status =
                    updated[medIndex].status === 'taken' ? 'pending' : 'taken';
                  setTodayMedications(updated);
                }
              }}
            >
              {med.status === 'taken' ? (
                <Check size={16} />
              ) : (
                <span className="block text-center text-[12px] leading-tight">
                  {formatTime(med.time)}
                </span>
              )}
            </div>
          );
        })}
      </div>
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
