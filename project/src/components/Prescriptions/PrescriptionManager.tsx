import React, { useState } from 'react';
import { Plus, Bot, FileText, Search, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Prescription, Medicine } from '../../types';

const PrescriptionManager: React.FC = () => {
  const { language, patients, prescriptions, setPrescriptions, currentDoctor } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  const addMedicine = () => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    };
    setMedicines([...medicines, newMedicine]);
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: string) => {
    setMedicines(medicines.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const generateAIPrescription = async () => {
    setAiGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const aiMedicines: Medicine[] = [
        {
          id: '1',
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '7 days',
          instructions: 'Take with food'
        },
        {
          id: '2',
          name: 'Paracetamol',
          dosage: '650mg',
          frequency: 'As needed',
          duration: '5 days',
          instructions: 'For fever and pain relief'
        }
      ];
      
      setMedicines(aiMedicines);
      setDiagnosis('Upper respiratory tract infection');
      setNotes('Patient should rest and maintain hydration. Follow up if symptoms persist.');
      setAiGenerating(false);
    }, 2000);
  };

  const savePrescription = () => {
    if (!selectedPatient || !diagnosis || medicines.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const newPrescription: Prescription = {
      id: Date.now().toString(),
      patientId: selectedPatient,
      doctorId: currentDoctor?.id || '',
      medicines,
      diagnosis,
      notes,
      date: new Date().toISOString(),
    };

    setPrescriptions([...prescriptions, newPrescription]);
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedPatient('');
    setDiagnosis('');
    setNotes('');
    setMedicines([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('prescriptions', language)}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('generatePrescription', language)}</span>
        </button>
      </div>

      {/* Prescription List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {prescriptions.map((prescription) => {
            const patient = patients.find(p => p.id === prescription.patientId);
            return (
              <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{patient?.name}</h3>
                      <span className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(prescription.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Diagnosis:</strong> {prescription.diagnosis}
                    </p>
                    <div className="space-y-1">
                      {prescription.medicines.map((medicine) => (
                        <div key={medicine.id} className="text-sm text-gray-600">
                          <strong>{medicine.name}</strong> - {medicine.dosage} ({medicine.frequency})
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800">
                    <FileText className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Prescription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('generatePrescription', language)}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('patientName', language)}
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Assistant */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-900">{t('aiAssistance', language)}</span>
                  </div>
                  <button
                    onClick={generateAIPrescription}
                    disabled={aiGenerating}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-all"
                  >
                    {aiGenerating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                <p className="text-sm text-purple-700 mt-2">
                  Let AI assist you in creating prescriptions based on symptoms and diagnosis
                </p>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('diagnosis', language)}
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter diagnosis"
                />
              </div>

              {/* Medicines */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Medicines
                  </label>
                  <button
                    onClick={addMedicine}
                    className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-all text-sm"
                  >
                    {t('addMedicine', language)}
                  </button>
                </div>

                <div className="space-y-4">
                  {medicines.map((medicine) => (
                    <div key={medicine.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <input
                          type="text"
                          placeholder="Medicine name"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(medicine.id, 'name', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Dosage"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(medicine.id, 'dosage', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Frequency"
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(medicine.id, 'frequency', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          placeholder="Duration"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(medicine.id, 'duration', e.target.value)}
                          className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => removeMedicine(medicine.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        placeholder="Instructions"
                        value={medicine.instructions}
                        onChange={(e) => updateMedicine(medicine.id, 'instructions', e.target.value)}
                        className="w-full mt-2 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('notes', language)}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes and instructions"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              >
                {t('cancel', language)}
              </button>
              <button
                onClick={savePrescription}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                {t('save', language)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionManager;