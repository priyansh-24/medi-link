import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { Phone, Mail, MapPin, Activity, Edit2, Save } from 'lucide-react';
import { auth, db } from './lib/Firebase'; 
import { ref, set, get } from 'firebase/database';


const PatientProfile: React.FC = () => {
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

        // Save base64 to profile state
        setProfile(prev => ({ ...prev, photoURL: base64String }));

        // Save to Realtime Database
        await set(ref(db, `users/${uid}/photoURL`), base64String);
        console.log("Base64 photo saved to database");
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
    if (!uid) return alert("User not logged in");
    try {
      await set(ref(db, `users/${uid}`), profile);
      setIsEditing(false);
      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Patient Profile</h1>
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                isEditing 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
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
                      title="Upload Profile Photo"
                    />
                  )}
                </div>

                <div className="ml-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Full Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({...profile, name: e.target.value})}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900">{profile.name || 'N/A'}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900">
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}
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
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
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
                    <span className="text-gray-900">{profile.email || 'N/A'}</span>
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
                    <span className="text-gray-900">{profile.phone || 'N/A'}</span>
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
                    <span className="text-gray-900">{profile.address || 'N/A'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Medical Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Blood Type</label>
                  {isEditing ? (
                    <select
                      value={profile.bloodType}
                      onChange={(e) => setProfile({...profile, bloodType: e.target.value})}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.bloodType || 'N/A'}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Height</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.height}
                        onChange={(e) => setProfile({...profile, height: e.target.value})}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.height || 'N/A'}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Weight</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.weight}
                        onChange={(e) => setProfile({...profile, weight: e.target.value})}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.weight || 'N/A'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Allergies</label>
                  {isEditing ? (
                    <textarea
                      value={profile.allergies}
                      onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                      className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                  ) : (
                    <p className="text-gray-900">{profile.allergies || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Current Vitals
                </h3>
              </div>
              <div className="p-6 text-sm text-gray-500">
                No vitals available for now.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile;
