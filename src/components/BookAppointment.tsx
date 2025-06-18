import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { Calendar, Clock, User, Stethoscope, MapPin, Star, Bot } from 'lucide-react';
import { ref, push, onValue } from 'firebase/database';
import { auth, db } from './lib/Firebase'; 

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState({
    specialty: '',
    symptoms: '',
    urgency: '',
    preferredDate: '',
    preferredTime: '',
    doctorId: ''
  });

  const specialties = [
    { id: 'general', name: 'General Medicine', description: 'General health checkups and common conditions' },
    { id: 'cardiology', name: 'Cardiology', description: 'Heart and cardiovascular conditions' },
    { id: 'dermatology', name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
    { id: 'orthopedics', name: 'Orthopedics', description: 'Bone, joint, and muscle issues' },
    { id: 'neurology', name: 'Neurology', description: 'Brain and nervous system disorders' },
    { id: 'pediatrics', name: 'Pediatrics', description: 'Healthcare for children and adolescents' }
  ];

  const urgencyLevels = [
    { id: 'routine', name: 'Routine Care', description: 'Regular checkup or non-urgent concern', color: 'bg-green-100 text-green-800' },
    { id: 'soon', name: 'Soon', description: 'Concerning symptoms, within a week', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'urgent', name: 'Urgent', description: 'Significant symptoms, within 24-48 hours', color: 'bg-orange-100 text-orange-800' },
    { id: 'emergency', name: 'Emergency', description: 'Severe symptoms, immediate attention', color: 'bg-red-100 text-red-800' }
  ];

  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [aiRecommendedDoctors, setAiRecommendedDoctors] = useState<any[]>([]);

  useEffect(() => {
    const doctorsRef = ref(db, 'Doctors');
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const doctorList = Object.entries(data).map(([id, doctor]: any) => ({
          id,
          ...doctor,
          // Add a default image if none exists
          image: doctor.image || 'https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg',
          // Calculate AI match percentage based on specialty and availability
          aiMatch: calculateMatchPercentage(doctor)
        }));
        setAllDoctors(doctorList);
        // Initially set all doctors as recommendations
        setAiRecommendedDoctors(doctorList);
      }
    });
    return () => unsubscribe();
  }, []);

  // Update recommendations when specialty changes
  useEffect(() => {
    if (appointmentData.specialty && allDoctors.length > 0) {
      // Filter doctors by specialty first
      const specialtyDoctors = allDoctors.filter(doctor => 
        doctor.specialty.toLowerCase().includes(appointmentData.specialty.toLowerCase())
      );
      
      // Then add other doctors
      const otherDoctors = allDoctors.filter(doctor => 
        !doctor.specialty.toLowerCase().includes(appointmentData.specialty.toLowerCase())
      );
      
      // Combine with specialty doctors first
      setAiRecommendedDoctors([...specialtyDoctors, ...otherDoctors]);
    } else {
      setAiRecommendedDoctors(allDoctors);
    }
  }, [appointmentData.specialty, allDoctors]);

  // Helper function to calculate match percentage
  const calculateMatchPercentage = (doctor: any) => {
    let match = 50; // Base match
    
    // Increase match if specialty matches
    if (doctor.specialty.toLowerCase().includes(appointmentData.specialty.toLowerCase())) {
      match += 30;
    }
    
    // Increase match based on availability
    if (doctor.availability === 'high') {
      match += 10;
    } else if (doctor.availability === 'medium') {
      match += 5;
    }
    
    // Ensure match is between 0-100
    return Math.min(100, Math.max(0, match));
  };

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleBooking = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to book an appointment.');
      return;
    }

    const bookingRef = ref(db, `bookings/${user.uid}`);
    try {
      await push(bookingRef, {
        ...appointmentData,
        timestamp: new Date().toISOString()
      });
      navigate(`/doctor/${appointmentData.doctorId}`);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Book an Appointment</h1>
            <div className="mt-4 flex items-center">
              {[1, 2, 3, 4].map((number) => (
                <div key={number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {number}
                  </div>
                  {number < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > number ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Step {step} of 4: {
                step === 1 ? 'Tell us about your concern' :
                step === 2 ? 'Choose urgency level' :
                step === 3 ? 'Select preferred time' :
                'Choose your doctor'
              }
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            {/* Step 1: Symptoms and Specialty */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">What brings you in today?</h3>
                  <textarea
                    value={appointmentData.symptoms}
                    onChange={(e) => setAppointmentData({ ...appointmentData, symptoms: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Describe your symptoms or reason for visit..."
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Which specialty do you need?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specialties.map((specialty) => (
                      <button
                        key={specialty.id}
                        onClick={() => setAppointmentData({ ...appointmentData, specialty: specialty.id })}
                        className={`border-2 rounded-lg p-4 text-left transition-colors ${
                          appointmentData.specialty === specialty.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-medium text-gray-900">{specialty.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{specialty.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Urgency Level */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">How urgent is this appointment?</h3>
                <div className="space-y-3">
                  {urgencyLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setAppointmentData({ ...appointmentData, urgency: level.id })}
                      className={`w-full border-2 rounded-lg p-4 text-left transition-colors ${
                        appointmentData.urgency === level.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{level.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${level.color}`}>
                          {level.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Date and Time Preference */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">When would you like to schedule?</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                    <input
                      type="date"
                      value={appointmentData.preferredDate}
                      onChange={(e) => setAppointmentData({ ...appointmentData, preferredDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setAppointmentData({ ...appointmentData, preferredTime: time })}
                          className={`p-2 text-sm border rounded-md transition-colors ${
                            appointmentData.preferredTime === time
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: AI Doctor Recommendations */}
{step === 4 && (
  <div className="space-y-6">
    <div className="flex items-center mb-6">
      <Bot className="h-6 w-6 text-blue-600 mr-2" />
      <h3 className="text-lg font-medium text-gray-900">AI Recommended Doctors</h3>
    </div>
    <p className="text-gray-600 mb-6">
      {appointmentData.specialty ? 
        `Showing ${specialties.find(s => s.id === appointmentData.specialty)?.name} specialists first:` : 
        "Here are our available doctors:"}
    </p>

    {aiRecommendedDoctors.length > 0 ? (
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2"> {/* Added scrollable container */}
        {aiRecommendedDoctors.map((doctor) => (
          <div
            key={doctor.id}
            className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
              appointmentData.doctorId === doctor.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setAppointmentData({ ...appointmentData, doctorId: doctor.id })}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="h-16 w-16 rounded-full mr-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg';
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{doctor.name}</h4>
                    {doctor.specialty.toLowerCase().includes(appointmentData.specialty.toLowerCase()) && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        AI Matched
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    <span className="text-sm">{doctor.specialty}</span>
                    <span className="mx-2">•</span>
                    <span className="text-sm">{doctor.experience}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{doctor.location}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{doctor.rating}</span>
                    <Clock className="h-4 w-4 text-gray-400 ml-3 mr-1" />
                    <span className="text-sm text-gray-600">{doctor.nextAvailable}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(doctor.reasons ?? []).map((reason: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No doctors found. Please try again later.</p>
    )}
  </div>
)}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!appointmentData.symptoms || !appointmentData.specialty)) ||
                    (step === 2 && !appointmentData.urgency) ||
                    (step === 3 && (!appointmentData.preferredDate || !appointmentData.preferredTime))
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleBooking}
                  disabled={!appointmentData.doctorId}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookAppointment;