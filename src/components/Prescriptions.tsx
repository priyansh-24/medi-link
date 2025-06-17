import React, { useState } from 'react';
import Layout from './Layout';
import { FileText, Download, Printer, Save, Clock, AlertCircle, CheckCircle, Pill } from 'lucide-react';
import { getDatabase, ref, onValue } from "firebase/database";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";



const Prescriptions: React.FC = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [currentPrescriptions, setCurrentPrescriptions] = useState<any[]>([]);
  const [pastPrescriptions, setPastPrescriptions] = useState<any[]>([]);

  useEffect(() => {
  const db = getDatabase();
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return;

  const prescriptionRef = ref(db, `prescriptions/${user.uid}`);
  onValue(prescriptionRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const today = new Date();
    const current: any[] = [];
    const past: any[] = [];

    Object.entries(data).forEach(([id, prescription]: any) => {
      const expiry = new Date(prescription.expiryDate);
      const isActive = expiry >= today;

      const enriched = {
        ...prescription,
        id,
        status: isActive ? "active" : "completed",
        completedDate: !isActive ? expiry.toISOString().split("T")[0] : null
      };

      isActive ? current.push(enriched) : past.push(enriched);
    });

    setCurrentPrescriptions(current);
    setPastPrescriptions(past);
  });
}, []);


  const medicationReminders = [
    { medication: 'Lisinopril 10mg', time: '8:00 AM', taken: true },
    { medication: 'Aspirin 81mg', time: '8:00 AM', taken: true },
    { medication: 'Vitamin D3', time: '12:00 PM', taken: false },
  ];

  const handleDownload = (prescriptionId: string) => {
    // Simulate download
    console.log(`Downloading prescription ${prescriptionId}`);
  };

  const handlePrint = (prescriptionId: string) => {
    // Simulate print
    window.print();
  };

  const handleSave = (prescriptionId: string) => {
    // Simulate save
    console.log(`Saving prescription ${prescriptionId}`);
  };

  const prescriptions = activeTab === 'current' ? currentPrescriptions : pastPrescriptions;

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Prescriptions</h1>

          {/* Today's Medication Reminders */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Today's Medication Schedule
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {medicationReminders.map((reminder, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-lg p-4 ${
                      reminder.taken ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{reminder.medication}</p>
                        <p className="text-sm text-gray-600">{reminder.time}</p>
                      </div>
                      <div className={`p-2 rounded-full ${
                        reminder.taken ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {reminder.taken ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                    </div>
                    {!reminder.taken && (
                      <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700">
                        Mark as Taken
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prescription Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'current'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Current Prescriptions ({currentPrescriptions.length})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'past'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Past Prescriptions ({pastPrescriptions.length})
                </button>
              </nav>
            </div>

            <div className="divide-y divide-gray-200">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg mr-4">
                        <Pill className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prescription.medication} {prescription.dosage}
                        </h3>
                        <p className="text-gray-600">{prescription.frequency}</p>
                        <p className="text-sm text-gray-500">Prescribed by {prescription.doctor}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(prescription.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePrint(prescription.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title="Print"
                      >
                        <Printer className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleSave(prescription.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title="Save"
                      >
                        <Save className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Prescribed Date</p>
                      <p className="text-gray-900">{new Date(prescription.prescribedDate).toLocaleDateString()}</p>
                    </div>
                    {prescription.status === 'active' ? (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Expires</p>
                          <p className="text-gray-900">{new Date(prescription.expiryDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Refills Left</p>
                          <p className="text-gray-900">{prescription.refillsLeft}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completed Date</p>
                        <p className="text-gray-900">{new Date(prescription.completedDate!).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                    <p className="text-gray-700 text-sm">{prescription.instructions}</p>
                  </div>

                  {prescription.status === 'active' && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {prescription.refillsLeft > 0 ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Refills available</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Contact doctor for refill</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {prescription.refillsLeft > 0 && (
                          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                            Request Refill
                          </button>
                        )}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                          Contact Doctor
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prescription Summary */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">Prescription Management Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">📱 Set Reminders</p>
                <p>Use medication reminders to never miss a dose</p>
              </div>
              <div>
                <p className="font-medium mb-1">🔄 Track Refills</p>
                <p>Request refills before running out of medication</p>
              </div>
              <div>
                <p className="font-medium mb-1">💊 Follow Instructions</p>
                <p>Take medications exactly as prescribed</p>
              </div>
              <div>
                <p className="font-medium mb-1">👨‍⚕️ Consult Doctor</p>
                <p>Contact your doctor with any concerns or side effects</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Prescriptions;