import React, { useState } from 'react';
import axiosInstance from '../rxjs/axiosInstance';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Toast from '../app/components/Toast';
import { useToast } from '../hooks/useToast';

const ForgotPasswordForm: React.FC = () => {
  const [state, setState] = useState({
    email: '',
    resetStatus: 'idle',
    password: '',
    confirmPassword: '',
    loading: false,
    isNavigating: false,
  });

  const { toast, showToast, closeToast } = useToast();

  const router = useRouter();
  const token = router.query.token as string | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await axiosInstance.post('/auth/forgot-password', {
        email: state.email,
      });

      if (res.data.previewLink) {
        window.open(res.data.previewLink, '_blank');
        setState((prev) => ({
          ...prev,
          email: '',
          resetStatus: 'success',
          loading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, resetStatus: 'error', loading: false }));
        showToast('Failed to send reset email.', 'error');
      }
    } catch (error) {
      console.error('Email reset error:', error);
      setState((prev) => ({ ...prev, resetStatus: 'error', loading: false }));
      showToast('Error sending reset email.', 'error');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (state.password !== state.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
        password: state.password,
      });

      if (res.status === 201 || res.status === 200) {
        showToast('Password reset successful!');
        setState((prev) => ({ ...prev, isNavigating: true }));
        setTimeout(() => {
          router.push('/login');
        }, 500);
      } else {
        showToast('Failed to reset password.', 'error');
      }
    } catch (error) {
      console.error('Reset error:', error);
      showToast('Failed to reset password. Try again later', 'error');
    } finally {
      setState((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
        loading: false,
      }));
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {token ? 'Set New Password' : 'Forgot Password'}
        </h2>

        {token ? (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label
                className="block text-white text-sm font-semibold mb-2"
                htmlFor="password"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={state.password}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, password: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
                placeholder="Enter new password"
              />
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
                value={state.confirmPassword}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center"
              disabled={state.loading}
            >
              {state.loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 01-8 8z"
                  ></path>
                </svg>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        ) : (
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
                value={state.email}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center"
              disabled={state.loading}
            >
              {state.loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 01-8 8z"
                  ></path>
                </svg>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {state.resetStatus === 'success' && !token && (
          <p className="text-green-200 text-center mt-4">
            Reset email sent! Please check your inbox.
          </p>
        )}
        {state.resetStatus === 'error' && !token && (
          <p className="text-red-300 text-center mt-4">
            Failed to send reset email. Try again later.
          </p>
        )}

        {!token && (
          <p className="text-white text-center mt-4">
            Remember your password?{' '}
            <Link href="/login" className="text-yellow-400 hover:underline">
              Log In
            </Link>
          </p>
        )}

        <button
          onClick={handleBackToHome}
          className="w-full bg-gradient-to-r from-green-400 to-teal-500 text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105 mt-6"
        >
          Back to Home
        </button>
      </div>

      {toast?.message && toast?.type && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default ForgotPasswordForm;
