import React, { useState } from 'react';
import Layout from './Layout';
import { User, Phone, Mail, MapPin, Calendar, Heart, Activity, Edit2, Save, X } from 'lucide-react';

const PatientProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    dateOfBirth: '1985-06-15',
    bloodType: 'O+',
    height: '6\'0"',
    weight: '180 lbs',
    emergencyContact: 'Jane Doe - (555) 987-6543',
    allergies: 'Penicillin, Shellfish',
    chronicConditions: 'Hypertension',
    currentMedications: 'Lisinopril 10mg, Aspirin 81mg'
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to API
  };

  const medicalHistory = [
    { date: '2024-01-15', condition: 'Annual Physical', doctor: 'Dr. Smith', status: 'Completed' },
    { date: '2023-12-08', condition: 'Flu Vaccination', doctor: 'Dr. Johnson', status: 'Completed' },
    { date: '2023-10-22', condition: 'Blood Pressure Check', doctor: 'Dr. Smith', status: 'Completed' },
    { date: '2023-08-14', condition: 'Chest X-Ray', doctor: 'Dr. Wilson', status: 'Completed' },
  ];

  const vitals = [
    { name: 'Blood Pressure', value: '120/80 mmHg', status: 'normal', date: '2024-01-15' },
    { name: 'Heart Rate', value: '72 bpm', status: 'normal', date: '2024-01-15' },
    { name: 'Temperature', value: '98.6°F', status: 'normal', date: '2024-01-15' },
    { name: 'Weight', value: '180 lbs', status: 'normal', date: '2024-01-15' },
  ];

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
          {/* Profile Header */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-24 w-24 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                    alt="Profile"
                  />
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
                        <p className="text-lg font-medium text-gray-900">{profile.name}</p>
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
                        <p className="text-lg font-medium text-gray-900">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
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
                    <span className="text-gray-900">{profile.email}</span>
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
                    <span className="text-gray-900">{profile.phone}</span>
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
                    <span className="text-gray-900">{profile.address}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information */}
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
                    <p className="text-gray-900 font-medium">{profile.bloodType}</p>
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
                      <p className="text-gray-900 font-medium">{profile.height}</p>
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
                      <p className="text-gray-900 font-medium">{profile.weight}</p>
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
                    <p className="text-gray-900">{profile.allergies}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Current Vitals */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  Current Vitals
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {vitals.map((vital, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vital.name}</p>
                        <p className="text-sm text-gray-500">{vital.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{vital.value}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          vital.status === 'normal' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {vital.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition/Treatment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicalHistory.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.condition}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.doctor}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientProfile;