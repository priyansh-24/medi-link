import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DashboardHome from './components/Dashboard/DashboardHome';
import PatientList from './components/Patients/PatientList';
import PrescriptionManager from './components/Prescriptions/PrescriptionManager';
import DoctorProfile from './components/Profile/DoctorProfile';
import { Patient, HealthAlert, Feedback } from './types';

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, 
    activeSection, 
    setPatients, 
    setHealthAlerts, 
    setFeedbacks 
  } = useApp();

  useEffect(() => {
    // Initialize with sample data
    const samplePatients: Patient[] = [
      {
        id: '1',
        name: 'John Smith',
        age: 45,
        gender: 'male',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        address: '123 Main St, City, State',
        medicalHistory: ['Hypertension', 'Diabetes Type 2'],
        allergies: ['Penicillin'],
        appointmentDate: '2024-01-15',
        appointmentTime: '10:00 AM',
        symptoms: 'Chest pain, shortness of breath',
        status: 'pending',
      },
      {
        id: '2',
        name: 'Maria Garcia',
        age: 32,
        gender: 'female',
        email: 'maria.garcia@email.com',
        phone: '+1-555-0124',
        address: '456 Oak Ave, City, State',
        medicalHistory: ['Asthma'],
        allergies: ['Shellfish'],
        appointmentDate: '2024-01-15',
        appointmentTime: '2:00 PM',
        symptoms: 'Persistent cough, fever',
        status: 'in-progress',
      },
      {
        id: '3',
        name: 'Robert Johnson',
        age: 67,
        gender: 'male',
        email: 'robert.johnson@email.com',
        phone: '+1-555-0125',
        address: '789 Pine St, City, State',
        medicalHistory: ['Heart Disease', 'Arthritis'],
        allergies: ['Aspirin'],
        appointmentDate: '2024-01-16',
        appointmentTime: '9:00 AM',
        symptoms: 'Joint pain, mobility issues',
        status: 'completed',
      },
    ];

    const sampleAlerts: HealthAlert[] = [
      {
        id: '1',
        type: 'urgent',
        title: 'Critical Lab Results',
        message: 'Patient John Smith has abnormal blood test results requiring immediate attention.',
        patientId: '1',
        date: '2024-01-15T08:00:00Z',
        read: false,
      },
      {
        id: '2',
        type: 'warning',
        title: 'Medication Refill Due',
        message: 'Patient Maria Garcia needs prescription refill for asthma medication.',
        patientId: '2',
        date: '2024-01-15T10:00:00Z',
        read: false,
      },
      {
        id: '3',
        type: 'info',
        title: 'Appointment Reminder',
        message: 'Upcoming appointment with Robert Johnson tomorrow at 9:00 AM.',
        patientId: '3',
        date: '2024-01-15T12:00:00Z',
        read: true,
      },
    ];

    const sampleFeedbacks: Feedback[] = [
      {
        id: '1',
        doctorId: '1',
        patientId: '1',
        rating: 5,
        comment: 'Excellent care and very professional. Thank you for your help!',
        date: '2024-01-14T15:30:00Z',
      },
      {
        id: '2',
        doctorId: '1',
        patientId: '2',
        rating: 4,
        comment: 'Good service, though the wait time was a bit long.',
        date: '2024-01-13T11:20:00Z',
      },
    ];

    setPatients(samplePatients);
    setHealthAlerts(sampleAlerts);
    setFeedbacks(sampleFeedbacks);
  }, [setPatients, setHealthAlerts, setFeedbacks]);

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome />;
      case 'patients':
        return <PatientList />;
      case 'prescriptions':
        return <PrescriptionManager />;
      case 'appointments':
        return <div className="p-6">Appointments section coming soon...</div>;
      case 'health-alerts':
        return <div className="p-6">Health Alerts section coming soon...</div>;
      case 'feedback':
        return <div className="p-6">Feedback section coming soon...</div>;
      case 'profile':
        return <DoctorProfile />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;