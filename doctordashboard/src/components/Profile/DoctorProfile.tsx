import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, Edit3, Save, X, Camera, Shield, Bell, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Doctor } from '../../types';

const DoctorProfile: React.FC = () => {
  const { language, currentDoctor, setCurrentDoctor, patients, prescriptions, feedbacks } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDoctor, setEditedDoctor] = useState<Doctor | null>(currentDoctor);
  const [activeTab, setActiveTab] = useState('personal');

  const handleSave = () => {
    if (editedDoctor) {
      setCurrentDoctor(editedDoctor);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedDoctor(currentDoctor);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Doctor, value: string) => {
    if (editedDoctor) {
      setEditedDoctor({
        ...editedDoctor,
        [field]: value,
      });
    }
  };

  const doctorStats = {
    totalPatients: patients.length,
    totalPrescriptions: prescriptions.length,
    averageRating: feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0',
    totalFeedbacks: feedbacks.length,
  };

  const tabs = [
    { id: 'personal', label: t('personalInfo', language), icon: User },
    { id: 'professional', label: t('professionalInfo', language), icon: Award },
    { id: 'settings', label: t('settings', language), icon: Shield },
    { id: 'statistics', label: t('statistics', language), icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {currentDoctor?.name?.charAt(0)}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full hover:bg-blue-400 transition-all">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{currentDoctor?.name}</h1>
              <p className="text-blue-100 text-lg">{currentDoctor?.specialization}</p>
              <p className="text-blue-200 text-sm">License: {currentDoctor?.licenseNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? t('cancel', language) : t('edit', language)}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalPatients', language)}</p>
              <p className="text-2xl font-bold text-gray-900">{doctorStats.totalPatients}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalPrescriptions', language)}</p>
              <p className="text-2xl font-bold text-gray-900">{doctorStats.totalPrescriptions}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('averageRating', language)}</p>
              <p className="text-2xl font-bold text-gray-900">{doctorStats.averageRating}/5</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('totalFeedbacks', language)}</p>
              <p className="text-2xl font-bold text-gray-900">{doctorStats.totalFeedbacks}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('personalInfo', language)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('fullName', language)}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedDoctor?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{currentDoctor?.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email', language)}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedDoctor?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{currentDoctor?.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone', language)}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={(editedDoctor as any)?.phone || ''}
                      onChange={(e) => handleInputChange('phone' as keyof Doctor, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{(currentDoctor as any)?.phone || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('address', language)}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(editedDoctor as any)?.address || ''}
                      onChange={(e) => handleInputChange('address' as keyof Doctor, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{(currentDoctor as any)?.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('professionalInfo', language)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('specialization', language)}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedDoctor?.specialization || ''}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{currentDoctor?.specialization}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('licenseNumber', language)}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedDoctor?.licenseNumber || ''}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{currentDoctor?.licenseNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('experience', language)}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(editedDoctor as any)?.experience || ''}
                      onChange={(e) => handleInputChange('experience' as keyof Doctor, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{(currentDoctor as any)?.experience || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('hospital', language)}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(editedDoctor as any)?.hospital || ''}
                      onChange={(e) => handleInputChange('hospital' as keyof Doctor, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{(currentDoctor as any)?.hospital || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('settings', language)}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('emailNotifications', language)}</p>
                      <p className="text-sm text-gray-500">{t('receiveEmailAlerts', language)}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('twoFactorAuth', language)}</p>
                      <p className="text-sm text-gray-500">{t('enableTwoFactor', language)}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('autoLanguageDetection', language)}</p>
                      <p className="text-sm text-gray-500">{t('detectPatientLanguage', language)}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('statistics', language)}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-4">{t('patientStatistics', language)}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('totalPatients', language)}:</span>
                      <span className="font-semibold text-blue-900">{doctorStats.totalPatients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('activePatients', language)}:</span>
                      <span className="font-semibold text-blue-900">{patients.filter(p => p.status !== 'completed').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('completedCases', language)}:</span>
                      <span className="font-semibold text-blue-900">{patients.filter(p => p.status === 'completed').length}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl">
                  <h4 className="font-semibold text-green-900 mb-4">{t('prescriptionStatistics', language)}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-700">{t('totalPrescriptions', language)}:</span>
                      <span className="font-semibold text-green-900">{doctorStats.totalPrescriptions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">{t('thisMonth', language)}:</span>
                      <span className="font-semibold text-green-900">{Math.floor(doctorStats.totalPrescriptions * 0.3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">{t('avgPerPatient', language)}:</span>
                      <span className="font-semibold text-green-900">{doctorStats.totalPatients > 0 ? (doctorStats.totalPrescriptions / doctorStats.totalPatients).toFixed(1) : '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl">
                <h4 className="font-semibold text-purple-900 mb-4">{t('feedbackSummary', language)}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-900">{doctorStats.averageRating}/5</p>
                    <p className="text-purple-700">{t('averageRating', language)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-900">{doctorStats.totalFeedbacks}</p>
                    <p className="text-purple-700">{t('totalReviews', language)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-900">{feedbacks.filter(f => f.rating >= 4).length}</p>
                    <p className="text-purple-700">{t('positiveReviews', language)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save/Cancel buttons for editing mode */}
          {isEditing && (
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>{t('cancel', language)}</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('save', language)}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;