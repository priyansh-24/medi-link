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

import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

type Hospital = {
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
};

const EmergencyServices: React.FC = () => {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [hospitalError, setHospitalError] = useState<string | null>(null);
  const [medicalInfo, setMedicalInfo] = useState<{
    bloodType?: string;
    allergies?: string;
    currentMedications?: string[];
  } | null>(null);

  const emergencyTypes = [
    { id: 'cardiac', name: 'Cardiac Emergency', icon: Heart, color: 'bg-red-500', description: 'Chest pain, heart attack symptoms' },
    { id: 'trauma', name: 'Trauma/Accident', icon: Ambulance, color: 'bg-orange-500', description: 'Injuries, accidents, bleeding' },
    { id: 'breathing', name: 'Breathing Difficulty', icon: AlertTriangle, color: 'bg-yellow-500', description: 'Shortness of breath, asthma attack' },
    { id: 'severe', name: 'Severe Pain', icon: AlertTriangle, color: 'bg-purple-500', description: 'Intense pain, medical emergency' },
  ];

  const quickActions = [
    { name: 'Call 911', action: () => window.open('tel:911'), color: 'bg-red-600', icon: Phone },
    { name: 'Call Poison Control', action: () => window.open('tel:18002221222'), color: 'bg-orange-600', icon: Phone },
    {
    name: 'Share Location',
    action: () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude.toFixed(6);
            const longitude = position.coords.longitude.toFixed(6);
            const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const message = `🚨 I need help! Here's my live location: ${locationUrl}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert('Unable to access your location. Please allow location permissions.');
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        alert('Geolocation is not supported by this browser.');
      }
    },
    color: 'bg-blue-600',
    icon: MapPin,
  },
  { name: 'Medical ID', action: () => alert('Medical ID feature coming soon.'), color: 'bg-green-600', icon: Heart },
  ];

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);

      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const prescriptionsRef = ref(db, `prescriptions/${user.uid}`);
            get(prescriptionsRef).then((presSnap) => {
              const presData = presSnap.val();
              const today = new Date();
              const medications = presData
                ? Object.values(presData)
                    .filter((p: any) => {
                      if (!p.expiryDate) return true;
                      const exp = new Date(p.expiryDate);
                      return exp >= today;
                    })
                    .map((p: any) => p.medication)
                : [];

              setMedicalInfo({
                bloodType: userData.bloodType,
                allergies: userData.allergies,
                currentMedications: medications,
              });
            });
          }
        })
        .catch((err) => console.error("Error fetching user data:", err));
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc = { lat: latitude, lng: longitude };
          setLocation(loc);
          fetchNearbyHospitals(loc.lat, loc.lng);
        },
        (error) => {
          console.error("Location error:", error);
          setHospitalError("Unable to detect your location.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      setLoadingHospitals(true);
      const response = await fetch(`http://localhost:5000/nearby-hospitals?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      setNearbyHospitals(data.results || []);
    } catch (error) {
      console.error('Fetch error:', error);
      setHospitalError('Failed to fetch nearby hospitals.');
    } finally {
      setLoadingHospitals(false);
    }
  };

  return (
    <Layout>
      <div className="py-6 px-4 max-w-7xl mx-auto">
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
          {quickActions.map(({ name, action, icon: Icon, color }, i) => (
            <button
              key={i}
              onClick={action}
              className={`${color} hover:opacity-90 text-white rounded-lg p-4 text-center transition hover:scale-105`}
            >
              <Icon className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{name}</span>
            </button>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">What type of emergency is this?</h3>
            <p className="text-sm text-gray-500 mt-1">This helps us suggest the most appropriate care.</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyTypes.map(({ id, name, description, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setSelectedEmergency(id)}
                className={`border-2 rounded-lg p-4 text-left transition ${
                  selectedEmergency === id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start">
                  <div className={`${color} p-2 rounded-lg mr-3`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-200" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {nearbyHospitals.map((hospital, i) => (
            <div key={i} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{hospital.name}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      ~10 min wait
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{hospital.vicinity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, idx) => (
                        <div key={idx} className={`h-4 w-4 ${idx < (hospital.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </div>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{hospital.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(hospital.vicinity)}`)}
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

          {nearbyHospitals.length === 0 && !loadingHospitals && !hospitalError && (
            <p className="p-6 text-sm text-gray-500">No hospitals found nearby.</p>
          )}
        </div>

        {/* Medical Info Section */}
        {medicalInfo && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-4">Your Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-yellow-800">Blood Type:</p>
                <p className="text-yellow-700">{medicalInfo.bloodType || 'Not available'}</p>
              </div>
              <div>
                <p className="font-medium text-yellow-800">Allergies:</p>
                <p className="text-yellow-700">{medicalInfo.allergies || 'None listed'}</p>
              </div>
              <div>
                <p className="font-medium text-yellow-800">Current Medications:</p>
                <p className="text-yellow-700">
                  {medicalInfo.currentMedications && medicalInfo.currentMedications.length > 0
                    ? medicalInfo.currentMedications.join(', ')
                    : 'None'}
                </p>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-4">
              This information is automatically shared with emergency responders when you call for help.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmergencyServices;
