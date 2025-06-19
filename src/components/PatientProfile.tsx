import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from './Layout';
import { Phone, Mail, MapPin, Activity, Edit2, Save } from 'lucide-react';
import { auth, db } from './lib/Firebase'; 
import { ref, set, get } from 'firebase/database';

const PatientProfile: React.FC = () => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    bloodType: '',
    height: '',
    weight: '',
    emergencyContact: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
    photoURL: '',
  });

  const uid = auth.currentUser?.uid;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setProfile(prev => ({ ...prev, photoURL: base64String }));
      await set(ref(db, `users/${uid}/photoURL`), base64String);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!uid) return;
    const userRef = ref(db, `users/${uid}`);
    get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.val());
      }
    });
  }, [uid]);

  const handleSave = async () => {
    if (!uid) return alert(t('patientProfile.alerts.loginRequired'));
    try {
      await set(ref(db, `users/${uid}`), profile);
      setIsEditing(false);
      alert(t('patientProfile.alerts.saveSuccess'));
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(t('patientProfile.alerts.saveError'));
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">{t('patientProfile.title')}</h1>
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                isEditing 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
              {isEditing ? t('patientProfile.saveChanges') : t('patientProfile.editProfile')}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-8">
              <div className="flex items-center">
                <div className="relative">
                  {profile.photoURL ? (
                    <img
                      className="h-24 w-24 rounded-full object-cover"
                      src={profile.photoURL}
                      alt="Profile"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-semibold">
                      {profile.name ? profile.name[0].toUpperCase() : '?'}
                    </div>
                  )}
                  {isEditing && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute bottom-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      title={t('patientProfile.basicInfo.uploadPhoto')}
                    />
                  )}
                </div>

                <div className="ml-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">{t('patientProfile.basicInfo.fullName')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900">{profile.name || t('patientProfile.notAvailable')}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">{t('patientProfile.basicInfo.dateOfBirth')}</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900">
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : t('patientProfile.notAvailable')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{t('patientProfile.contactInfo.title')}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{profile.email || t('patientProfile.notAvailable')}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{profile.phone || t('patientProfile.notAvailable')}</span>
                  )}
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  {isEditing ? (
                    <textarea
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  ) : (
                    <span className="text-gray-900">{profile.address || t('patientProfile.notAvailable')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{t('patientProfile.medicalInfo.title')}</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-500">{t('patientProfile.medicalInfo.bloodType')}</label>
                  {isEditing ? (
                    <select
                      value={profile.bloodType}
                      onChange={(e) => setProfile({...profile, bloodType: e.target.value})}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{t('patientProfile.medicalInfo.selectBloodType')}</option>
                      {Object.entries(t('patientProfile.medicalInfo.bloodTypes', { returnObjects: true })).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profile.bloodType || t('patientProfile.notAvailable')}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">{t('patientProfile.medicalInfo.height')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.height}
                        onChange={(e) => setProfile({...profile, height: e.target.value})}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.height || t('patientProfile.notAvailable')}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">{t('patientProfile.medicalInfo.weight')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.weight}
                        onChange={(e) => setProfile({...profile, weight: e.target.value})}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.weight || t('patientProfile.notAvailable')}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">{t('patientProfile.medicalInfo.allergies')}</label>
                  {isEditing ? (
                    <textarea
                      value={profile.allergies}
                      onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.allergies || t('patientProfile.notAvailable')}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  {t('patientProfile.vitals.title')}
                </h3>
              </div>
              <div className="p-6 text-sm text-gray-500">
                {t('patientProfile.vitals.noData')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile;