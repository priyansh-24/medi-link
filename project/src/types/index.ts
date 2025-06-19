export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: string;
  medicalHistory: string[];
  allergies: string[];
  appointmentDate: string;
  appointmentTime: string;
  symptoms: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicines: Medicine[];
  diagnosis: string;
  notes: string;
  date: string;
}

export interface HealthAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  patientId?: string;
  date: string;
  read: boolean;
}

export interface Feedback {
  id: string;
  doctorId: string;
  patientId: string;
  rating: number;
  comment: string;
  date: string;
}

export type Language = 'en' | 'es' | 'fr';