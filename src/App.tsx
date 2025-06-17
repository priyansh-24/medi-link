import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PatientProfile from './components/PatientProfile';
import EmergencyServices from './components/EmergencyServices';
import Prescriptions from './components/Prescriptions';
import BookAppointment from './components/BookAppointment';
import DoctorProfile from './components/DoctorProfile';
import VideoCall from './components/VideoCall';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<PatientProfile />} />
            <Route path="/emergency" element={<EmergencyServices />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/doctor/:id" element={<DoctorProfile />} />
            <Route path="/video-call/:appointmentId" element={<VideoCall />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;