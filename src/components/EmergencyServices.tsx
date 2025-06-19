import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from './Layout';
import {
  AlertTriangle, Phone, MapPin, Navigation, Clock, Heart, Ambulance
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
  const { t } = useTranslation();
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
    { id: 'cardiac', name: t('emergency.emergencyTypes.cardiac.name'), icon: Heart, color: 'bg-red-500', description: t('emergency.emergencyTypes.cardiac.description') },
    { id: 'trauma', name: t('emergency.emergencyTypes.trauma.name'), icon: Ambulance, color: 'bg-orange-500', description: t('emergency.emergencyTypes.trauma.description') },
    { id: 'breathing', name: t('emergency.emergencyTypes.breathing.name'), icon: AlertTriangle, color: 'bg-yellow-500', description: t('emergency.emergencyTypes.breathing.description') },
    { id: 'severe', name: t('emergency.emergencyTypes.severe.name'), icon: AlertTriangle, color: 'bg-purple-500', description: t('emergency.emergencyTypes.severe.description') },
  ];

  const shareLocation = () => {
    if (!location) {
      alert(t('emergency.errors.location'));
      return;
    }

    const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const message = `🚨 ${t('emergency.title')}! ${t('emergency.protocol.message')} ${t('emergency.protocol.title')}: ${mapsUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const quickActions = [
    { name: t('emergency.quickActions.call911'), action: () => window.open('tel:911'), color: 'bg-red-600', icon: Phone },
    { name: t('emergency.quickActions.poisonControl'), action: () => window.open('tel:18002221222'), color: 'bg-orange-600', icon: Phone },
    { name: t('emergency.quickActions.shareLocation'), action: shareLocation, color: 'bg-blue-600', icon: MapPin },
    { name: t('emergency.quickActions.medicalID'), action: () => alert(t('emergency.quickActions.medicalID')), color: 'bg-green-600', icon: Heart },
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
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setLocation(loc);
          fetchNearbyHospitals(loc.lat, loc.lng);
        },
        (error) => {
          console.error("Location error:", error);
          setHospitalError(t('emergency.errors.location'));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [t]);

  const fetchNearbyHospitals = (lat: number, lng: number) => {
    if (!window.google || !window.google.maps) {
      setHospitalError(t('emergency.errors.maps'));
      return;
    }

    setLoadingHospitals(true);

    const map = new window.google.maps.Map(document.createElement('div'));
    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location: new window.google.maps.LatLng(lat, lng),
      radius: 5000,
      type: 'hospital',
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setNearbyHospitals(
          results.map((place) => ({
            name: place.name ?? 'Unknown',
            vicinity: place.vicinity ?? t('emergency.hospitals.noHospitals'),
            rating: place.rating ?? 0,
            user_ratings_total: place.user_ratings_total ?? 0,
          }))
        );
      } else {
        setHospitalError(t('emergency.errors.noHospitals'));
      }
      setLoadingHospitals(false);
    });
  };

  return (
    <Layout>
      <div className="py-6 px-4 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">{t('emergency.title')}</h1>
        </div>

        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">
              <strong>{t('emergency.protocol.title')}</strong> {t('emergency.protocol.message')}
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
            <h3 className="text-lg font-medium text-gray-900">{t('emergency.emergencyTypes.title')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('emergency.emergencyTypes.subtitle')}</p>
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
                      {t('emergency.hospitals.waitTime')}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{hospital.vicinity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, idx) => (
                        <span key={idx} className={`text-sm ${idx < (hospital.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{hospital.rating?.toFixed(1) || t('emergency.hospitals.rating')}</span>
                    </div>
                    <button
                      onClick={() => window.open(`https://maps.google.com?q=${encodeURIComponent(hospital.vicinity)}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      {t('emergency.hospitals.directions')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {nearbyHospitals.length === 0 && !loadingHospitals && !hospitalError && (
            <p className="p-6 text-sm text-gray-500">{t('emergency.hospitals.noHospitals')}</p>
          )}
        </div>

        {medicalInfo && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-yellow-800 mb-4">{t('emergency.medicalInfo.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-yellow-800">{t('emergency.medicalInfo.bloodType')}</p>
                <p className="text-yellow-700">{medicalInfo.bloodType || t('emergency.medicalInfo.bloodTypeNA')}</p>
              </div>
              <div>
                <p className="font-medium text-yellow-800">{t('emergency.medicalInfo.allergies')}</p>
                <p className="text-yellow-700">{medicalInfo.allergies || t('emergency.medicalInfo.allergiesNone')}</p>
              </div>
              <div>
                <p className="font-medium text-yellow-800">{t('emergency.medicalInfo.medications')}</p>
                <p className="text-yellow-700">
                  {medicalInfo.currentMedications?.length
                    ? medicalInfo.currentMedications.join(', ')
                    : t('emergency.medicalInfo.medicationsNone')}
                </p>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-4">
              {t('emergency.medicalInfo.disclaimer')}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmergencyServices;