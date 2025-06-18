import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { 
  Star, 
  MapPin, 
  Clock, 
  Phone, 
  Video, 
  Calendar, 
  Award, 
  GraduationCap,
  Users,
  MessageCircle
} from 'lucide-react';

const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();

  // Mock doctor data
  const doctor = {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    subSpecialty: 'Interventional Cardiology',
    rating: 4.9,
    reviewCount: 247,
    experience: '15 years',
    location: 'City General Hospital',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
    about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She specializes in interventional cardiology and has performed over 2,000 cardiac procedures. Dr. Johnson is known for her compassionate care and innovative treatment approaches.',
    education: [
      'MD - Harvard Medical School (2008)',
      'Residency - Internal Medicine, Johns Hopkins (2011)',
      'Fellowship - Cardiology, Mayo Clinic (2014)',
      'Fellowship - Interventional Cardiology, Cleveland Clinic (2015)'
    ],
    certifications: [
      'Board Certified in Internal Medicine',
      'Board Certified in Cardiovascular Disease',
      'Board Certified in Interventional Cardiology'
    ],
    languages: ['English', 'Spanish', 'French'],
    acceptedInsurance: ['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'UnitedHealth', 'Medicare'],
    appointmentTypes: [
      { type: 'In-Person Consultation', duration: '45 min', price: '$250' },
      { type: 'Video Consultation', duration: '30 min', price: '$180' },
      { type: 'Follow-up Visit', duration: '30 min', price: '$150' },
      { type: 'Emergency Consultation', duration: '60 min', price: '$400' }
    ],
    availableSlots: [
      { date: '2024-01-20', time: '2:00 PM', type: 'in-person' },
      { date: '2024-01-20', time: '3:30 PM', type: 'video' },
      { date: '2024-01-21', time: '10:00 AM', type: 'in-person' },
      { date: '2024-01-21', time: '2:30 PM', type: 'video' },
      { date: '2024-01-22', time: '9:00 AM', type: 'in-person' },
      { date: '2024-01-22', time: '4:00 PM', type: 'video' }
    ],
    recentReviews: [
      {
        id: '1',
        patient: 'John D.',
        rating: 5,
        date: '2024-01-10',
        comment: 'Dr. Johnson was incredibly thorough and took time to explain my condition. Excellent bedside manner.'
      },
      {
        id: '2',
        patient: 'Maria S.',
        rating: 5,
        date: '2024-01-08',
        comment: 'Professional, knowledgeable, and caring. Would highly recommend to anyone needing cardiac care.'
      },
      {
        id: '3',
        patient: 'Robert L.',
        rating: 4,
        date: '2024-01-05',
        comment: 'Great experience overall. Dr. Johnson answered all my questions and provided clear treatment options.'
      }
    ]
  };

  const handleBookAppointment = (slot: any) => {
    // Simulate booking confirmation
    alert(`Appointment booked for ${slot.date} at ${slot.time}`);
    navigate('/dashboard');
  };

  const handleVideoCall = () => {
    navigate(`/video-call/appointment-123`);
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Doctor Header */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="h-32 w-32 rounded-full mx-auto md:mx-0 mb-4 md:mb-0"
              />
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                <p className="text-lg text-gray-600">{doctor.specialty}</p>
                <p className="text-md text-gray-500">{doctor.subSpecialty}</p>
                
                <div className="flex items-center justify-center md:justify-start mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">{doctor.rating} ({doctor.reviewCount} reviews)</span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start mt-4 space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {doctor.experience}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {doctor.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {doctor.reviewCount}+ patients
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 mt-4 md:mt-0">
                <button
                  onClick={handleVideoCall}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md flex items-center justify-center"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Start Video Call
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center justify-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Call Now
                </button>
                <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-md flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Message
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Doctor Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About Dr. {doctor.name.split(' ')[1]}</h2>
                <p className="text-gray-700 leading-relaxed">{doctor.about}</p>
              </div>

              {/* Education & Certifications */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Education & Certifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Education</h3>
                    <ul className="space-y-2">
                      {doctor.education.map((edu, index) => (
                        <li key={index} className="text-gray-700 text-sm">{edu}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Certifications</h3>
                    <ul className="space-y-2">
                      {doctor.certifications.map((cert, index) => (
                        <li key={index} className="text-gray-700 text-sm">{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Languages & Insurance */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Languages Spoken</h3>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Accepted Insurance</h3>
                    <div className="space-y-1">
                      {doctor.acceptedInsurance.slice(0, 3).map((insurance, index) => (
                        <p key={index} className="text-gray-700 text-sm">{insurance}</p>
                      ))}
                      <button className="text-blue-600 text-sm hover:underline">
                        +{doctor.acceptedInsurance.length - 3} more
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                  {doctor.recentReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{review.patient}</span>
                          <div className="flex items-center ml-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div className="space-y-6">
              {/* Appointment Types */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Types</h2>
                <div className="space-y-4">
                  {doctor.appointmentTypes.map((type, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{type.type}</h3>
                        <span className="text-lg font-semibold text-green-600">{type.price}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {type.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Slots */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Available Appointments
                </h2>
                <div className="space-y-3">
                  {doctor.availableSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(slot.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            {slot.time}
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                              {slot.type === 'video' ? 'Video' : 'In-Person'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBookAppointment(slot)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-md">
                  View More Times
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorProfile;