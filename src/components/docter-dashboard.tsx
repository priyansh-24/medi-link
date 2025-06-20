import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import { useEffect } from 'react';

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

    useEffect(() => {
      if (!user ) {
        navigate('/dashboard');
      }
    }, [user, navigate]);
  
    const handleLogout = () => {
      logout();
      navigate('/');
    };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Doctor Portal</h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-md px-4 py-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            The doctor dashboard is currently under development. We're working hard to bring you the best experience.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <div className="flex">
              <div className="flex-shrink-0">
                <Stethoscope className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">What to expect</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Patient management system</li>
                    <li>Appointment scheduling</li>
                    <li>Medical records access</li>
                    <li>Prescription tools</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} MediLink. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default DoctorDashboard;