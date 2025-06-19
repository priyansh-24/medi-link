import React, { useState } from 'react';
import Layout from './Layout';
import { Download, Printer, Clock, AlertCircle, CheckCircle, Pill } from 'lucide-react';
import { getDatabase, ref, onValue } from "firebase/database";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';



const Prescriptions: React.FC = () => {
  const { t } = useTranslation();
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQRData] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [currentPrescriptions, setCurrentPrescriptions] = useState<any[]>([]);
  const [pastPrescriptions, setPastPrescriptions] = useState<any[]>([]);
  const [medicationReminders, setMedicationReminders] = useState<any[]>([]);

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
      const reminders: any[] = [];

      Object.entries(data).forEach(([id, prescription]: any) => {
        const expiry = new Date(prescription.expiryDate);
        const isActive = expiry >= today;

        const enriched = {
          ...prescription,
          id,
          status: isActive ? "active" : "completed",
          completedDate: !isActive ? expiry.toISOString().split("T")[0] : null
        };

        if (isActive) {
          current.push(enriched);

          if (Array.isArray(prescription.schedule)) {
            prescription.schedule.forEach((time: string) => {
              reminders.push({
                medication: `${prescription.medication} ${prescription.dosage}`,
                time,
                taken: false
              });
            });
          }
        } else {
          past.push(enriched);
        }
      });

      setCurrentPrescriptions(current);
      setPastPrescriptions(past);
      setMedicationReminders(reminders);
    });
  }, []);

  const handlePrint = () => window.print();

  const uploadPrescriptionToFirebase = async (blob: Blob, filename: string): Promise<string> => {
  const storage = getStorage();
  const fileRef = storageRef(storage, `prescriptions/${filename}`);
  await uploadBytes(fileRef, blob);
  const url = await getDownloadURL(fileRef);
  return url;
};
const handleDownloadAndGenerateQR = (prescription: any) => {
  const doc = new jsPDF();

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(33, 150, 243);
  doc.text('MediLink', 10, 20);

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Prescription', 10, 30);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Doctor: ${prescription.doctor || 'N/A'}`, 10, 45);
  doc.text(`Prescribed Date: ${new Date(prescription.prescribedDate).toLocaleDateString()}`, 10, 52);
  doc.text(`Expires On: ${new Date(prescription.expiryDate).toLocaleDateString()}`, 10, 59);

  autoTable(doc, {
    startY: 70,
    head: [['Medication', 'Dosage', 'Frequency', 'Instructions']],
    body: [
      [
        prescription.medication || 'N/A',
        prescription.dosage || 'N/A',
        prescription.frequency || 'N/A',
        prescription.instructions || 'N/A',
      ],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [33, 150, 243], textColor: 255, fontStyle: 'bold' },
  });

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  setQRData(blobUrl);
  setShowQR(true);
};

 const handleDownload = (prescription: any) => {
  const doc = new jsPDF();

  // Heading: MediLink Prescription
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(33, 150, 243); // Blue color
  doc.text('MediLink', 10, 20);

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Prescription', 10, 30);

  // Doctor & Prescription Info
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Doctor: ${prescription.doctor || 'N/A'}`, 10, 45);
  doc.text(`Prescribed Date: ${new Date(prescription.prescribedDate).toLocaleDateString()}`, 10, 52);
  doc.text(`Expires On: ${new Date(prescription.expiryDate).toLocaleDateString()}`, 10, 59);
  doc.text(`Refills Left: ${prescription.refillsLeft ?? '-'}`, 10, 66);

  // Add Medication Table
  autoTable(doc, {
    startY: 75,
    head: [['Medication', 'Dosage', 'Frequency', 'Instructions']],
    body: [
      [
        prescription.medication || 'N/A',
        prescription.dosage || 'N/A',
        prescription.frequency || 'N/A',
        prescription.instructions || 'N/A',
      ],
    ],
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [33, 150, 243],
      textColor: 255,
      fontStyle: 'bold',
    },
    bodyStyles: {
      textColor: 50,
    },
  });

  // Footer Note
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    'Note: Please take medication as prescribed. Contact your doctor for any concerns.',
    10,
    pageHeight - 20
  );

  doc.save(`${prescription.medication || 'prescription'}.pdf`);
};

const handleQR = (prescription: any) => {
  const data = {
    medication: prescription.medication,
    dosage: prescription.dosage,
    doctor: prescription.doctor,
    prescribedDate: prescription.prescribedDate,
    expiryDate: prescription.expiryDate,
  };
  setQRData(JSON.stringify(data));
  setShowQR(true);
};


  const prescriptions = activeTab === 'current' ? currentPrescriptions : pastPrescriptions;

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('prescriptions.title')}</h1>

          {/* Today's Medication Reminders */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                {t('prescriptions.todaysSchedule')}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(
                  medicationReminders.reduce((acc: any, reminder: any, index: number) => {
                    const key = reminder.medication;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push({ ...reminder, index });
                    return acc;
                  }, {})
                ).map(([medication, reminders]: any) => (
                  <div
                    key={medication}
                    className={`border-2 rounded-lg p-4 ${
                      reminders.every((r: any) => r.taken)
                        ? 'border-green-200 bg-green-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <p className="font-medium text-gray-900 mb-4">{medication}</p>
                    <div className="flex flex-wrap gap-4">
                      {reminders.map((reminder: any) => (
                        <div key={reminder.index} className="flex flex-col items-center gap-2">
                          <div
                            className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-semibold shadow ${
                              reminder.taken
                                ? 'bg-green-100 text-green-600'
                                : 'bg-yellow-100 text-yellow-600'
                            }`}
                          >
                            {reminder.taken ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span className="block text-center">{reminder.time}</span>
                            )}
                          </div>
                          {!reminder.taken && (
                            <button
                              onClick={() =>
                                setMedicationReminders((prev: any[]) =>
                                  prev.map((r, i) =>
                                    i === reminder.index ? { ...r, taken: true } : r
                                  )
                                )
                              }
                              className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md hover:bg-blue-700 transition"
                            >
                              {t('prescriptions.markButton')}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
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
                  {t('prescriptions.currentTab')} ({currentPrescriptions.length})
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'past'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('prescriptions.pastTab')} ({pastPrescriptions.length})
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
                        <p className="text-sm text-gray-500">
                          {t('prescriptions.prescribedBy')} {prescription.doctor}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownloadAndGenerateQR(prescription)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title="Generate QR"
                      >
                        {/* QR Icon (simple SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 3h4v4H3V3zM3 9h4v4H3V9zM9 3h4v4H9V3zM15 3h2v2h-2V3zM9 9h4v4H9V9zM15 9h2v2h-2V9zM9 15h4v4H9v-4zM15 15h2v2h-2v-2z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDownload(prescription)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title={t('prescriptions.downloadTitle')}
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title={t('prescriptions.printTitle')}
                      >
                        <Printer className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t('prescriptions.prescribedDate')}
                      </p>
                      <p className="text-gray-900">
                        {new Date(prescription.prescribedDate).toLocaleDateString()}
                      </p>
                    </div>
                    {prescription.status === 'active' ? (
                      <>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t('prescriptions.expires')}
                          </p>
                          <p className="text-gray-900">
                            {new Date(prescription.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {t('prescriptions.refillsLeft')}
                          </p>
                          <p className="text-gray-900">{prescription.refillsLeft}</p>
                        </div>
                      </>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {t('prescriptions.completedDate')}
                        </p>
                        <p className="text-gray-900">
                          {new Date(prescription.completedDate!).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {t('prescriptions.instructionsTitle')}
                    </h4>
                    <p className="text-gray-700 text-sm">{prescription.instructions}</p>
                  </div>

                  {prescription.status === 'active' && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {prescription.refillsLeft > 0 ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {t('prescriptions.refillsAvailable')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {t('prescriptions.contactForRefill')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {prescription.refillsLeft >= 0 && (
                          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                            {t('prescriptions.requestRefill')}
                          </button>
                        )}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                          {t('prescriptions.contactDoctor')}
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
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              {t('prescriptions.managementTips')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">📱 {t('prescriptions.setReminders')}</p>
                <p>{t('prescriptions.setRemindersDesc')}</p>
              </div>
              <div>
                <p className="font-medium mb-1">🔄 {t('prescriptions.trackRefills')}</p>
                <p>{t('prescriptions.trackRefillsDesc')}</p>
              </div>
              <div>
                <p className="font-medium mb-1">💊 {t('prescriptions.followInstructions')}</p>
                <p>{t('prescriptions.followInstructionsDesc')}</p>
              </div>
              <div>
                <p className="font-medium mb-1">👨‍⚕️ {t('prescriptions.consultDoctor')}</p>
                <p>{t('prescriptions.consultDoctorDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
{showQR && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">📲 Scan QR to Download</h2>

      <div className="flex justify-center mb-4">
        <QRCodeSVG value={qrData} size={200} />
      </div>

      <a
        href={qrData}
        download="prescription.pdf"
        className="inline-block mb-3 text-sm text-blue-600 hover:underline"
      >
        🔗 Open PDF Link
      </a>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setShowQR(false)}
          className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}



    </Layout>
  );
};

export default Prescriptions;