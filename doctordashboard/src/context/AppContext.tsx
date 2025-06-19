import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Doctor, Patient, Prescription, HealthAlert, Feedback, Language } from '../types';

interface AppContextType {
  currentDoctor: Doctor | null;
  setCurrentDoctor: (doctor: Doctor | null) => void;
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
  prescriptions: Prescription[];
  setPrescriptions: (prescriptions: Prescription[]) => void;
  healthAlerts: HealthAlert[];
  setHealthAlerts: (alerts: HealthAlert[]) => void;
  feedbacks: Feedback[];
  setFeedbacks: (feedbacks: Feedback[]) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <AppContext.Provider
      value={{
        currentDoctor,
        setCurrentDoctor,
        patients,
        setPatients,
        prescriptions,
        setPrescriptions,
        healthAlerts,
        setHealthAlerts,
        feedbacks,
        setFeedbacks,
        language,
        setLanguage,
        isAuthenticated,
        setIsAuthenticated,
        activeSection,
        setActiveSection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};