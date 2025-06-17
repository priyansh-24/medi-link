import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Navigation,
  Clock,
  Heart,
  Ambulance,
} from 'lucide-react';

type Hospital = {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  phone: string;
  emergencyWait: string;
  specialties: string[];
};

const EmergencyServices: React.FC = () => {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);

  const emergencyTypes = [
    { id: 'cardiac', name: 'Cardiac Emergency', icon: Heart, color: 'bg-red-500', description: 'Chest pain, heart attack symptoms' },
    { id: 'trauma', name: 'Trauma/Accident', icon: Ambulance, color: 'bg-orange-500', description: 'Injuries, accidents, bleeding' },
    { id: 'breathing', name: 'Breathing Difficulty', icon: AlertTriangle, color: 'bg-yellow-500', description: 'Shortness of breath, asthma attack' },
    { id: 'severe', name: 'Severe Pain', icon: AlertTriangle, color: 'bg-purple-500', description: 'Intense pain, medical emergency' },
  ];

  const quickActions = [
    { name: 'Call 911', action: () => window.open('tel:911'), color: 'bg-red-600', icon: Phone },
    { name: 'Call Poison Control', action: () => window.open('tel:1-800-222-1222'), color: 'bg-orange-600', icon: Phone },
    { name: 'Share Location', action: () => {}, color: 'bg-blue-600', icon: MapPin },
    { name: 'Medical ID', action: () => {}, color: 'bg-green-600', icon: Heart },
  ];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          fetchNearbyHospitals(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Location access denied. Please enable location.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    const apiKey = 'YOUR_API_KEY_HERE';
    const radius = 5000;
    const type = 'hospital';

    try {
      const proxyUrl = `https://corsproxy.io/?`;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;

      const res = await fetch(proxyUrl + encodeURIComponent(url));
      const data = await res.json();

      if (data.results) {
        const hospitals: Hospital[] = data.results.map((hospital: any) => ({
          name: hospital.name,
          address: hospital.vicinity,
          location: hospital.geometry.location,
          rating: hospital.rating || 0,
          phone: '', // Add phone fetching logic if needed
          emergencyWait: 'N/A',
          specialties: ['General', 'Emergency'],
        }));
        setNearbyHospitals(hospitals);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Emergency Services</h1>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">
                <strong>Emergency Protocol:</strong> If this is life-threatening, call 911 immediately.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} hover:opacity-90 text-white rounded-lg p-4 text-center transition duration-200 transform hover:scale-105`}
                >
                  <Icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{action.name}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">What type of emergency is this?</h3>
              <p className="text-sm text-gray-500 mt-1">This helps us suggest the most appropriate care.</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedEmergency(type.id)}
                      className={`border-2 rounded-lg p-4 text-left transition ${
                        selectedEmergency === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className={`${type.color} p-2 rounded-lg mr-3`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{type.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                Nearby Hospitals & Emergency Rooms
              </h3>
              {locationError && <p className="text-sm text-red-600">{locationError}</p>}
              {!location && !locationError && <p className="text-sm text-gray-500">Detecting location...</p>}
              {location && nearbyHospitals.length === 0 && <p className="text-sm text-gray-500">Fetching hospitals...</p>}
            </div>
            <div className="divide-y divide-gray-200">
              {nearbyHospitals.map((hospital, index) => (
                <div key={index} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{hospital.name}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {hospital.emergencyWait} wait
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{hospital.address}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {hospital.specialties.map((specialty, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-4 w-4 ${i < Math.floor(hospital.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                              ★
                            </div>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{hospital.rating}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`tel:${hospital.phone}`)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </button>
                          <button
                            onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(hospital.address)}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Directions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-4">Your Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-yellow-800">Blood Type:</p>
                <p className="text-yellow-700">O+</p>
              </div>
              <div>
                <p className="font-medium text-yellow-800">Allergies:</p>
                <p className="text-yellow-700">Penicillin, Shellfish</p>
              </div>
              <div>
                <p className="font-medium text-yellow-800">Current Medications:</p>
                <p className="text-yellow-700">Lisinopril, Aspirin</p>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-4">
              This information is automatically shared with emergency responders when you call for help.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmergencyServices;
