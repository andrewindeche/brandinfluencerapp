import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Forgot Password
        </h2>
        <form>
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
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-red-600 text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
          >
            Reset Password
          </button>
        </form>

        <p className="text-white text-center mt-4">
          Remember your password?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Log In
          </Link>
        </p>

        <button
          onClick={handleBackToHome}
          className="w-full bg-gradient-to-r from-green-400 to-teal-500 text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105 mt-6"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
