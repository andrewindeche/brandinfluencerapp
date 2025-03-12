import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import {
  formState$,
  setFormField,
  submitSignUpForm,
  initialState,
} from '../rxjs/store';

const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const subscription = formState$.subscribe((state) => {
      setFormState(state);
      setConfirmPassword('');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [errors]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    setFormField(id as keyof typeof formState, value);
    setErrors((prevErrors) => ({ ...prevErrors, [id]: '' })); // Clear errors on change
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(formState.password === e.target.value);
    setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: '' })); // Clear errors on change
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.email) {
      newErrors.email = 'Email is required';
    }
    if (!formState.userType || formState.userType === 'unknown') {
      newErrors.userType = 'User type is required';
    }
    if (!formState.username) {
      newErrors.username = 'Username is required';
    }
    if (!formState.password) {
      newErrors.password = 'Password is required';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    }
    if (!passwordsMatch) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await submitSignUpForm(() => {
        setFormState(initialState);
        setConfirmPassword('');
        setPasswordsMatch(true);
        router.push('/login?signup=success');
      }, setShowErrorDialog);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response && error.response.status === 409) {
          alert('Email or username already exists.');
        } else {
          alert('There was an error during registration. Please try again.');
        }
      } else {
        alert('Unexpected error occurred.');
      }

      setFormState(initialState);
      setConfirmPassword('');
      setPasswordsMatch(true);
    }
  };

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const { email, userType, username, password } = formState;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-white text-sm font-semibold mb-2"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-white text-sm font-semibold mb-2"
              htmlFor="userType"
            >
              User Type
            </label>
            <select
              id="userType"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              value={userType}
              onChange={handleChange}
            >
              <option value="unknown">Select User Type</option>
              <option value="influencer">Influencer</option>
              <option value="brand">Brand</option>
            </select>
            {errors.userType && (
              <p className="text-red-400 text-sm mt-1">{errors.userType}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-white text-sm font-semibold mb-2"
              htmlFor="username"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              placeholder="Enter your username"
              value={username}
              onChange={handleChange}
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-white text-sm font-semibold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              placeholder="Enter your password"
              value={password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-white text-sm font-semibold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 ${
                passwordsMatch ? 'focus:ring-yellow-400' : 'focus:ring-red-400'
              } shadow-lg`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-red-600 text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
          >
            Sign Up
          </button>
        </form>

        <p className="text-white text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
      {showErrorDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">Sign Up Failed!</h3>
            <p className="mb-4">
              There was an error during registration. Please try again.
            </p>
            <button
              onClick={closeErrorDialog}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUpForm;
