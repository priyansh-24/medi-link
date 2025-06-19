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
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
            <Route path="/emergency" element={<ProtectedRoute><EmergencyServices /></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
            <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
            <Route path="/doctor/:id" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
            <Route path="/video-call/:appointmentId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;