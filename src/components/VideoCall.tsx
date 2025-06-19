import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  Settings, 
  MessageCircle,
  FileText,
  Download,
  Printer,
  Save
} from 'lucide-react';

const VideoCall: React.FC = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(true);
  const [showPrescription, setShowPrescription] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Mock appointment data
  const appointment = {
    id: appointmentId,
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face'
    },
    patient: {
      name: 'John Doe',
      age: 45,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
    },
    startTime: new Date().toISOString(),
    type: 'Follow-up Consultation'
  };

  const prescription = {
    id: 'RX-2024-001',
    date: new Date().toLocaleDateString(),
    patient: appointment.patient.name,
    doctor: appointment.doctor.name,
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food. Monitor blood pressure daily.'
      },
      {
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with food to prevent stomach irritation.'
      }
    ],
    notes: 'Patient is responding well to current treatment. Continue monitoring blood pressure and return in 3 months.',
    nextAppointment: '3 months'
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handleDownloadPrescription = () => {
    console.log('Downloading prescription...');
  };

  const handlePrintPrescription = () => {
    window.print();
  };

  const handleSavePrescription = () => {
    console.log('Saving prescription...');
  };

  if (!isCallActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="bg-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 transform rotate-[135deg]" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Call Ended</h2>
          <p className="text-gray-300 mb-4">Call duration: {formatDuration(callDuration)}</p>
          <p className="text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center text-white">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
          <span className="text-sm">Live Call • {formatDuration(callDuration)}</span>
        </div>
        <div className="text-white text-center">
          <h2 className="font-semibold">{appointment.type}</h2>
          <p className="text-sm text-gray-300">with {appointment.doctor.name}</p>
        </div>
        <button
          onClick={() => setShowPrescription(!showPrescription)}
          className="text-white hover:bg-gray-700 p-2 rounded-md"
        >
          <FileText className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex">
        {/* Video Call Area */}
        <div className={`${showPrescription ? 'w-2/3' : 'w-full'} relative`}>
          <div className="h-full bg-gray-800 relative">
            {/* Doctor's Video */}
            <div className="h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
              <div className="text-center text-white">
                <img
                  src={appointment.doctor.image}
                  alt={appointment.doctor.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/20"
                />
                <h3 className="text-xl font-semibold">{appointment.doctor.name}</h3>
                <p className="text-blue-200">{appointment.doctor.specialty}</p>
              </div>
            </div>

            {/* Patient's Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center border-2 border-white/20">
              <div className="text-center text-white">
                <img
                  src={appointment.patient.image}
                  alt={appointment.patient.name}
                  className="w-16 h-16 rounded-full mx-auto mb-2"
                />
                <p className="text-sm font-medium">You</p>
              </div>
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-gray-900/80 p-4 rounded-full backdrop-blur-sm">
                <button
                  onClick={() => setIsAudioOn(!isAudioOn)}
                  className={`p-3 rounded-full transition-colors ${
                    isAudioOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <Phone className="h-5 w-5 transform rotate-[135deg]" />
                </button>

                <button className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </button>

                <button className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Panel */}
        {showPrescription && (
          <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Digital Prescription</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDownloadPrescription}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handlePrintPrescription}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Print"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSavePrescription}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    title="Save"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Prescription Header */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-bold text-blue-600">MediLink</h2>
                  <p className="text-sm text-gray-600">Digital Prescription</p>
                  <p className="text-xs text-gray-500">Rx ID: {prescription.id}</p>
                </div>

                {/* Doctor & Patient Info */}
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Doctor:</p>
                    <p className="text-gray-700">{prescription.doctor}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Patient:</p>
                    <p className="text-gray-700">{prescription.patient}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Date:</p>
                    <p className="text-gray-700">{prescription.date}</p>
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Prescribed Medications:</h4>
                  <div className="space-y-4">
                    {prescription.medications.map((medication, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">{medication.name}</p>
                            <p className="text-gray-600">{medication.dosage}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">{medication.frequency}</p>
                            <p className="text-gray-600">{medication.duration}</p>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600">{medication.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor's Notes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Doctor's Notes:</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{prescription.notes}</p>
                  </div>
                </div>

                {/* Next Appointment */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Follow-up:</h4>
                  <p className="text-sm text-gray-700">Return in {prescription.nextAppointment}</p>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <button
                      onClick={handleSavePrescription}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save to My Prescriptions
                    </button>
                    <button
                      onClick={handleDownloadPrescription}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;