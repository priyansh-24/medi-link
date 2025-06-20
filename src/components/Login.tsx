import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, User, Lock, Loader2, Stethoscope } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/Firebase';
import { useAuth } from '../context/AuthContext';

type UserType = 'patient' | 'doctor';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [userType, setUserType] = useState<UserType>('patient');
  const [doctorId, setDoctorId] = useState('');
  const [authCompleted, setAuthCompleted] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (user && isAuthenticated) {
      if (userType === 'patient') {
        navigate('/dashboard');
      } else if (userType === 'doctor' && authCompleted) {
        navigate('/doctor-dashboard');
      }
    }
  }, [user, isAuthenticated, authCompleted, userType, navigate]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDoctorId('');
    setAuthCompleted(false);
    setError('');
  };

  const handleAuthSuccess = async () => {
    if (userType === 'patient') {
      navigate('/dashboard');
      return;
    }

    // For doctors, proceed to ID verification
    setAuthCompleted(true);
    setIsLoading(false);
  };

  const verifyDoctorId = async () => {
    try {
      if (doctorId !== doctorId) {
        await signOut(auth);
        setError('Invalid doctor ID. Please try again.');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Doctor verification error:', err);
      await signOut(auth);
      setError('Verification failed. Please try again.');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegisterMode) {
        await createUserWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        
        if (userType === 'doctor' && !authCompleted) {
          await handleAuthSuccess();
          return;
        }

        if (userType === 'doctor' && authCompleted) {
          const isValidDoctor = await verifyDoctorId();
          if (isValidDoctor) {
            navigate('/doctor-dashboard');
          }
        }
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      if (!(userType === 'doctor' && !authCompleted)) {
        setIsLoading(false);
      }
    }
  };

  const handleAuthError = (err: any) => {
    switch (err.code) {
      case 'auth/email-already-in-use':
        setError('Email already in use.');
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setError('Invalid email or password.');
        break;
      case 'auth/invalid-email':
        setError('Please enter a valid email address.');
        break;
      case 'auth/weak-password':
        setError('Password should be at least 6 characters.');
        break;
      default:
        setError('An error occurred. Please try again.');
        console.error('Authentication error:', err);
    }
    setAuthCompleted(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      } catch (err) {
        setError('Google sign-in failed. Please try again.');
        setIsLoading(false);
        return;
      }

    if (userType === 'doctor') {
      setAuthCompleted(true);
      setIsLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isRegisterMode ? 'Create Account' : 'Sign In to MediLink'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {userType === 'doctor' ? 'Healthcare Professional Portal' : 'Patient Health Platform'}
          </p>
        </div>

        <div className="bg-white py-4 px-6 shadow rounded-lg">
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => handleUserTypeChange('patient')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                userType === 'patient'
                  ? 'bg-blue-100 text-blue-700 shadow-inner'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleUserTypeChange('doctor')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                userType === 'doctor'
                  ? 'bg-blue-100 text-blue-700 shadow-inner'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Doctor
            </button>
          </div>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {userType === 'doctor' && authCompleted ? (
              <>
                <div>
                  <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                    Doctor Verification
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Stethoscope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="doctorId"
                      name="doctorId"
                      type="text"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your hospital ID"
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Please enter the verification ID provided by your hospital administration.
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      'Verify Identity'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      signOut(auth);
                      resetForm();
                    }}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                      required
                      minLength={6}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={isRegisterMode ? 'At least 6 characters' : 'Your password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isRegisterMode ? (
                      'Create Account'
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                  >
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="h-4 w-4 mr-2"
                    />
                    Google
                  </button>
                </div>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      resetForm();
                    }}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {isRegisterMode
                      ? 'Already have an account? Sign In'
                      : "Don't have an account? Create Account"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;