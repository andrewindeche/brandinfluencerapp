import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';
import Toast from '../app/components/Toast';
import {
  formState$,
  setFormField,
  submitSignUpForm,
  initialState,
} from '../rxjs/store';

const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [formState, setFormState] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  useEffect(() => {
    const subscription = formState$.subscribe((state) => {
      setFormState(state);
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
    setErrors((prevErrors) => ({ ...prevErrors, [id]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formState.email) {
      newErrors.email = 'Email is required';
    }
    if (!formState.role || formState.role === 'unknown') {
      newErrors.role = 'User type is required';
    }
    if (!formState.username) {
      newErrors.username = 'Username is required';
    }
    if (!formState.password) {
      newErrors.password = 'Password is required';
    }
    if (!formState.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    }
    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await submitSignUpForm(
        () => {
          setFormState(initialState);
          router.push('/login?signup=success');
        },
        () => {},
        setErrors,
        (message, type = 'error') => {
          setToast({ message, type });
        },
      );
    } catch (error) {
      if (error instanceof AxiosError) {
        const { status, data } = error.response || {};

        if (status === 409 && data?.code === 'DUPLICATE_USER') {
          setErrors({ email: data.message, username: data.message });
        } else {
          setToast({
            message: 'An unexpected error occurred. Please try again.',
            type: 'error',
          });
        }
      } else {
        setToast({
          message: 'Unexpected error occurred.',
          type: 'error',
        });
      }
    }
  };

  const closeToast = () => {
    setToast(null);
  };

  const { email, role, username, password, confirmPassword } = formState;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-white text-sm font-semibold mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
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
              htmlFor="role"
              className="block text-white text-sm font-semibold mb-2"
            >
              User Type
            </label>
            <select
              id="role"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
              value={role}
              onChange={handleChange}
            >
              <option value="unknown">Select User Type</option>
              <option value="influencer">Influencer</option>
              <option value="brand">Brand</option>
            </select>
            {errors.role && (
              <p className="text-red-400 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-white text-sm font-semibold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
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
              htmlFor="password"
              className="block text-white text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
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
              htmlFor="confirmPassword"
              className="block text-white text-sm font-semibold mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={`w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 ${
                formState.password === confirmPassword
                  ? 'focus:ring-yellow-400'
                  : 'focus:ring-red-400'
              } shadow-lg bg-white`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
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

      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default SignUpForm;
