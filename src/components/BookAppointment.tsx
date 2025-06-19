import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './Layout';
import { Clock, Stethoscope, MapPin, Star, Bot, Upload, X, Mic, MicOff } from 'lucide-react';
import { ref, push, onValue } from 'firebase/database';
import { auth, db } from './lib/Firebase';

const BookAppointment: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState({
    specialty: '',
    symptoms: '',
    photoURL: '',
    urgency: '',
    preferredDate: '',
    preferredTime: '',
    doctorId: ''
  });
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isVoiceAssistantOn, setIsVoiceAssistantOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  
  // Refs for stable references
  const recognitionRef = useRef<any>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const isMountedRef = useRef(false);

  const specialties = [
    { id: 'general', name: t('bookAppointment.specialties.general.name'), description: t('bookAppointment.specialties.general.description') },
    { id: 'cardiology', name: t('bookAppointment.specialties.cardiology.name'), description: t('bookAppointment.specialties.cardiology.description') },
    { id: 'dermatology', name: t('bookAppointment.specialties.dermatology.name'), description: t('bookAppointment.specialties.dermatology.description') },
    { id: 'orthopedics', name: t('bookAppointment.specialties.orthopedics.name'), description: t('bookAppointment.specialties.orthopedics.description') },
    { id: 'neurology', name: t('bookAppointment.specialties.neurology.name'), description: t('bookAppointment.specialties.neurology.description') },
    { id: 'pediatrics', name: t('bookAppointment.specialties.pediatrics.name'), description: t('bookAppointment.specialties.pediatrics.description') }
  ];
  const urgencyLevels = [
    { id: 'routine', name: t('bookAppointment.urgency.routine.name'), description: t('bookAppointment.urgency.routine.description'), color: 'bg-green-100 text-green-800' },
    { id: 'soon', name: t('bookAppointment.urgency.soon.name'), description: t('bookAppointment.urgency.soon.description'), color: 'bg-yellow-100 text-yellow-800' },
    { id: 'urgent', name: t('bookAppointment.urgency.urgent.name'), description: t('bookAppointment.urgency.urgent.description'), color: 'bg-orange-100 text-orange-800' },
    { id: 'emergency', name: t('bookAppointment.urgency.emergency.name'), description: t('bookAppointment.urgency.emergency.description'), color: 'bg-red-100 text-red-800' }
  ];

  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [aiRecommendedDoctors, setAiRecommendedDoctors] = useState<any[]>([]);
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      
      handleVoiceCommand(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Voice recognition error', event.error);
      if (isMountedRef.current) {
        setIsListening(false);
        setAssistantMessageWithSpeech('Sorry, I had trouble hearing you. Please try again.');
      }
    };

    recognitionRef.current.onend = () => {
      if (isMountedRef.current && isVoiceAssistantOn && isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Recognition restart error:', e);
          if (isMountedRef.current) {
            setIsListening(false);
            setAssistantMessageWithSpeech('Voice recognition stopped. Say "Hey Assistant" to restart.');
          }
        }
      }
    };
  }, []);

  // Initialize speech synthesis
  const initializeSpeechSynthesis = useCallback(() => {
    if (typeof window !== 'undefined') {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  // Component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    initializeSpeechRecognition();
    initializeSpeechSynthesis();

    const doctorsRef = ref(db, 'Doctors');
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const doctorList = Object.entries(data).map(([id, doctor]: any) => ({
          id,
          ...doctor,
          image: doctor.image || 'https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg',
          aiMatch: calculateMatchPercentage(doctor)
        }));
        setAllDoctors(doctorList);
        setAiRecommendedDoctors(doctorList);
      }
    });
    
    return () => {
      isMountedRef.current = false;
      unsubscribe();
      
      // Cleanup recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
        } catch (e) {
          console.error('Recognition cleanup error:', e);
        }
      }
      
      // Cleanup timers
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      
      // Cleanup synthesis
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [initializeSpeechRecognition, initializeSpeechSynthesis]);

  // Filter doctors by specialty
  useEffect(() => {
    if (appointmentData.specialty && allDoctors.length > 0) {
      const specialtyDoctors = allDoctors.filter(doctor => 
        doctor.specialty.toLowerCase().includes(appointmentData.specialty.toLowerCase())
      );
      const otherDoctors = allDoctors.filter(doctor => 
        !doctor.specialty.toLowerCase().includes(appointmentData.specialty.toLowerCase())
      );
      setAiRecommendedDoctors([...specialtyDoctors, ...otherDoctors]);
    } else {
      setAiRecommendedDoctors(allDoctors);
    }
  }, [appointmentData.specialty, allDoctors]);

  // Handle voice assistant toggle
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (isVoiceAssistantOn) {
      const welcomeMessage = `Welcome to the voice assistant. I'll help you book your appointment. 
        ${getStepInstructions()}`;
      setAssistantMessageWithSpeech(welcomeMessage);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
          resetSleepTimer();
        } catch (e) {
          console.error('Start error:', e);
          setAssistantMessageWithSpeech('Could not start voice recognition. Please check your microphone permissions.');
          setIsListening(false);
        }
      } else {
        setAssistantMessageWithSpeech('Voice recognition not supported in your browser. Try Chrome or Edge.');
        setIsListening(false);
      }
    } else {
      setIsListening(false);
      setAssistantMessage('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Stop error:', e);
        }
      }
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    }
  }, [isVoiceAssistantOn]);

  // Update instructions when step changes
  useEffect(() => {
    if (isVoiceAssistantOn && isMountedRef.current) {
      setAssistantMessageWithSpeech(getStepInstructions());
    }
  }, [step, isVoiceAssistantOn]);

  const speakMessage = useCallback((message: string) => {
    if (!isVoiceAssistantOn || !speechSynthesisRef.current) return;
    
    speechSynthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesisRef.current.speak(utterance);
  }, [isVoiceAssistantOn]);

  const setAssistantMessageWithSpeech = useCallback((message: string) => {
    setAssistantMessage(message);
    speakMessage(message);
  }, [speakMessage]);

  const resetSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }
    sleepTimerRef.current = setTimeout(() => {
      if (isListening && isMountedRef.current) {
        setAssistantMessageWithSpeech("I'm going to sleep now. Say 'Hey Assistant' to wake me up.");
        setIsListening(false);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.error('Sleep timer stop error:', e);
          }
        }
      }
    }, 60000); // 60 seconds of inactivity
  }, [isListening, setAssistantMessageWithSpeech]);

  const calculateMatchPercentage = (doctor: any) => {
    let match = 50;
    if (doctor.specialty.toLowerCase().includes(appointmentData.specialty.toLowerCase())) {
      match += 30;
    }
    if (doctor.availability === 'high') {
      match += 10;
    } else if (doctor.availability === 'medium') {
      match += 5;
    }
    return Math.min(100, Math.max(0, match));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    if (isVoiceAssistantOn) {
      setAssistantMessageWithSpeech(getStepInstructions());
      resetSleepTimer();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    if (isVoiceAssistantOn) {
      setAssistantMessageWithSpeech(getStepInstructions());
      resetSleepTimer();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');

    if (!file.type.match('image.*')) {
      setImageError('Please upload an image file (JPEG, PNG)');
      return;
    }

    const MAX_SIZE = 500 * 1024;
    if (file.size > MAX_SIZE) {
      setImageError('Image size should be less than 500KB');
      return;
    }

    setIsImageUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAppointmentData({
          ...appointmentData,
          photoURL: event.target.result as string
        });
      }
      setIsImageUploading(false);
    };
    reader.onerror = () => {
      setImageError('Error reading file');
      setIsImageUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setAppointmentData({
      ...appointmentData,
      photoURL: ''
    });
  };

  const handleBooking = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to book an appointment.');
      return;
    }

    const bookingData = {
      specialty: appointmentData.specialty,
      symptoms: appointmentData.symptoms,
      urgency: appointmentData.urgency,
      preferredDate: appointmentData.preferredDate,
      preferredTime: appointmentData.preferredTime,
      doctorId: appointmentData.doctorId,
      timestamp: new Date().toISOString(),
      ...(appointmentData.photoURL && appointmentData.photoURL.length < 900000 && { photoURL: appointmentData.photoURL })
    };

    const bookingRef = ref(db, `bookings/${user.uid}`);
    try {
      await push(bookingRef, bookingData);
      navigate(`/doctor/${appointmentData.doctorId}`);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment. Please try again with a smaller image or no image.');
    }
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Wake word detection
    if (lowerCommand.includes('hey assistant') || lowerCommand.includes('hi assistant')) {
      if (!isListening) {
        setIsListening(true);
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Wake word start error:', e);
          }
        }
        setAssistantMessageWithSpeech("I'm listening now. How can I help you?");
        resetSleepTimer();
      }
      return;
    }

    // Only process commands if listening
    if (!isListening) return;

    resetSleepTimer();

    if (lowerCommand.includes('next') || lowerCommand.includes('continue')) {
      handleNext();
    } else if (lowerCommand.includes('back') || lowerCommand.includes('previous')) {
      handleBack();
    } else if (step === 1) {
      if (lowerCommand.includes('symptoms are')) {
        const symptoms = command.split('symptoms are')[1].trim();
        setAppointmentData({ ...appointmentData, symptoms });
        setAssistantMessageWithSpeech(`Got it. Your symptoms are: ${symptoms}. Now please select a specialty.`);
      } else if (lowerCommand.includes('specialty')) {
        const specialty = specialties.find(s => 
          lowerCommand.includes(s.name.toLowerCase()) || 
          lowerCommand.includes(s.id.toLowerCase())
        );
        if (specialty) {
          setAppointmentData({ ...appointmentData, specialty: specialty.id });
          setAssistantMessageWithSpeech(`Selected specialty: ${specialty.name}. You can say "next" to continue.`);
        }
      }
    } else if (step === 2) {
      const urgency = urgencyLevels.find(level => 
        lowerCommand.includes(level.name.toLowerCase()) || 
        lowerCommand.includes(level.id.toLowerCase())
      );
      if (urgency) {
        setAppointmentData({ ...appointmentData, urgency: urgency.id });
        setAssistantMessageWithSpeech(`Selected urgency level: ${urgency.name}. You can say "next" to continue.`);
      }
    } else if (step === 3) {
      if (lowerCommand.includes('date')) {
        const dateMatch = command.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) || 
                         command.match(/\d{1,2}-\d{1,2}-\d{2,4}/) ||
                         command.match(/\d{1,2} \d{1,2} \d{2,4}/);
        if (dateMatch) {
          const dateStr = dateMatch[0].replace(/-/g, '/').replace(/ /g, '/');
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            const formattedDate = date.toISOString().split('T')[0];
            setAppointmentData({ ...appointmentData, preferredDate: formattedDate });
            setAssistantMessageWithSpeech(`Selected date: ${formattedDate}. Now please select a time.`);
          }
        }
      } else if (lowerCommand.includes('time')) {
        const timeMatch = command.match(/\d{1,2}:\d{2}/) || 
                         command.match(/\d{1,2} \d{2}/) ||
                         command.match(/\d{1,2}(am|pm)/i);
        if (timeMatch) {
          let timeStr = timeMatch[0].replace(/ /g, ':');
          if (!timeStr.includes(':')) {
            const ampm = timeStr.match(/am|pm/i)?.[0] || '';
            const digits = timeStr.replace(/am|pm/i, '');
            timeStr = digits + (ampm ? ' ' + ampm : '');
          }
          setAppointmentData({ ...appointmentData, preferredTime: timeStr });
          setAssistantMessageWithSpeech(`Selected time: ${timeStr}. You can say "next" to continue.`);
        }
      }
    } else if (step === 4) {
      if (lowerCommand.includes('doctor') || lowerCommand.includes('select')) {
        const doctorMatch = aiRecommendedDoctors.find(doc => 
          lowerCommand.includes(doc.name.toLowerCase())
        );
        if (doctorMatch) {
          setAppointmentData({ ...appointmentData, doctorId: doctorMatch.id });
          setAssistantMessageWithSpeech(`Selected doctor: ${doctorMatch.name}. You can say "book appointment" to confirm.`);
        }
      } else if (lowerCommand.includes('book') || lowerCommand.includes('confirm')) {
        handleBooking();
      }
    }
  };

  const toggleVoiceAssistant = () => {
    setIsVoiceAssistantOn(prev => !prev);
  };

  const getStepInstructions = useCallback(() => {
    switch (step) {
      case 1:
        return `Please describe your symptoms and select a specialty. 
                You can type things like "My symptoms are headache and fever" 
                or "I need a dermatologist".`;
      case 2:
        return `Please select how urgent your appointment is. 
                You can type "routine care", "soon", "urgent", or "emergency".`;
      case 3:
        return `Please select a date and time for your appointment. 
                You can type things like "date is June 15th" or "time is 2:30 PM".`;
      case 4:
        return `Please select a doctor from the recommendations. 
                You can type "select doctor" followed by the doctor's name. 
                Or type "book appointment" to confirm.`;
      default:
        return '';
    }
  }, [step]);

  useEffect(() => {
    if (isVoiceAssistantOn) {
      setAssistantMessageWithSpeech(getStepInstructions());
    }
  }, [step, isVoiceAssistantOn]);

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleVoiceAssistant}
              className={`flex items-center px-4 py-2 rounded-full transition-all ${
                isVoiceAssistantOn 
                  ? isListening 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isVoiceAssistantOn ? (
                isListening ? (
                  <Mic className="h-5 w-5 mr-2" />
                ) : (
                  <MicOff className="h-5 w-5 mr-2" />
                )
              ) : (
                <MicOff className="h-5 w-5 mr-2" />
              )}
              {isVoiceAssistantOn ? 
                (isListening ? 'Voice Assistant ON' : 'Voice Assistant ON') : 
                'Voice Assistant'}
              {isListening && (
                <span className="ml-2 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>

          {isVoiceAssistantOn && assistantMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
              <div className="flex">
                <Bot className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Voice Assistant</p>
                  <p className="text-blue-700">{assistantMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">{t('bookAppointment.title')}</h1>
            <div className="mt-4 flex items-center">
              {[1, 2, 3, 4].map((number) => (
                <div key={number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {number}
                  </div>
                  {number < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > number ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Step {step} of 4: {
                step === 1 ? t('bookAppointment.steps.symptoms') :
                step === 2 ? t('bookAppointment.steps.urgency') :
                step === 3 ? t('bookAppointment.steps.time') :
                t('bookAppointment.steps.doctor')
              }
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookAppointment.symptomsTitle')}</h3>
                  <textarea
                    value={appointmentData.symptoms}
                    onChange={(e) => setAppointmentData({ ...appointmentData, symptoms: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder={t('bookAppointment.symptomsPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('bookAppointment.uploadTitle')}</h3>
                  <p className="text-sm text-gray-500 mb-4">{t('bookAppointment.uploadDescription')}</p>

                  <div className="flex items-center">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">{t('bookAppointment.uploadClick')}</span> {t('bookAppointment.uploadDrag')}
                        </p>
                        <p className="text-xs text-gray-500">{t('bookAppointment.uploadFormats')}</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isImageUploading}
                      />
                    </label>
                  </div>
                  
                  {isImageUploading && (
                    <div className="mt-2 text-sm text-blue-600">Processing image...</div>
                  )}

                  {imageError && (
                    <div className="mt-2 text-sm text-blue-600">{t('bookAppointment.uploadProcessing')}</div>
                  )}

                  {imageError && (
                    <div className="mt-2 text-sm text-red-600">{imageError}</div>
                  )}

                  {appointmentData.photoURL && (
                    <div className="mt-4 relative">
                      <p className="text-sm font-medium text-gray-700 mb-2">{t('bookAppointment.uploadedImage')}</p>
                      <div className="relative inline-block">
                        <img 
                          src={appointmentData.photoURL} 
                          alt={t('bookAppointment.imageAlt')} 
                          className="h-32 object-contain border rounded"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -mt-2 -mr-2"
                          aria-label={t('bookAppointment.removeImage')}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('bookAppointment.specialtyTitle')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specialties.map((specialty) => (
                      <button
                        key={specialty.id}
                        onClick={() => setAppointmentData({ ...appointmentData, specialty: specialty.id })}
                        className={`border-2 rounded-lg p-4 text-left transition-colors ${
                          appointmentData.specialty === specialty.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h4 className="font-medium text-gray-900">{specialty.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{specialty.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}


         {/* Step 2: Urgency Level */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">{t('bookAppointment.urgencyTitle')}</h3>
                <div className="space-y-3">
                  {urgencyLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setAppointmentData({ ...appointmentData, urgency: level.id })}
                      className={`w-full border-2 rounded-lg p-4 text-left transition-colors ${
                        appointmentData.urgency === level.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{level.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${level.color}`}>
                          {level.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Date and Time Preference */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">{t('bookAppointment.scheduleTitle')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookAppointment.preferredDate')}</label>
                    <input
                      type="date"
                      value={appointmentData.preferredDate}
                      onChange={(e) => setAppointmentData({ ...appointmentData, preferredDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookAppointment.preferredTime')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setAppointmentData({ ...appointmentData, preferredTime: time })}
                          className={`p-2 text-sm border rounded-md transition-colors ${
                            appointmentData.preferredTime === time
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: AI Doctor Recommendations */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center mb-6">
                  <Bot className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">{t('bookAppointment.aiRecommendations')}</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  {appointmentData.specialty ? 
                    t('bookAppointment.showingSpecialists', { specialty: specialties.find(s => s.id === appointmentData.specialty)?.name }) : 
                    t('bookAppointment.availableDoctors')}
                </p>

                {aiRecommendedDoctors.length > 0 ? (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {aiRecommendedDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                          appointmentData.doctorId === doctor.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setAppointmentData({ ...appointmentData, doctorId: doctor.id })}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <img
                              src={doctor.image}
                              alt={doctor.name}
                              className="h-16 w-16 rounded-full mr-4"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg';
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{doctor.name}</h4>
                                {doctor.specialty.toLowerCase().includes(appointmentData.specialty.toLowerCase()) && (
                                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    {t('bookAppointment.aiMatched')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-gray-600 mb-2">
                                <Stethoscope className="h-4 w-4 mr-1" />
                                <span className="text-sm">{doctor.specialty}</span>
                                <span className="mx-2">•</span>
                                <span className="text-sm">{doctor.experience}</span>
                              </div>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{doctor.location}</span>
                              </div>
                              <div className="flex items-center mb-3">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium">{doctor.rating}</span>
                                <Clock className="h-4 w-4 text-gray-400 ml-3 mr-1" />
                                <span className="text-sm text-gray-600">{doctor.nextAvailable}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(doctor.reasons ?? []).map((reason: string, index: number) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">{t('bookAppointment.noDoctors')}</p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.back')}
              </button>
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!appointmentData.symptoms || !appointmentData.specialty)) ||
                    (step === 2 && !appointmentData.urgency) ||
                    (step === 3 && (!appointmentData.preferredDate || !appointmentData.preferredTime))
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.next')}
                </button>
              ) : (
                <button
                  onClick={handleBooking}
                  disabled={!appointmentData.doctorId}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('bookAppointment.bookButton')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookAppointment;