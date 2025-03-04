import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { formState$, setEmail } from '../rxjs/store';

const LoginForm: React.FC = () => {
  const [userType, setUserType] = useState<'brand' | 'influencer' | 'unknown'>(
    'unknown',
  );
  const [email, setEmailState] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const subscription = formState$.subscribe((state) => {
      setEmailState(state.email);
      setUserType(state.userType);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccessDialog(true);
  };

  const closeDialog = () => {
    setShowSuccessDialog(false);
  };

  const backgroundColor =
    userType === 'brand'
      ? 'bg-purple-500'
      : userType === 'influencer'
        ? 'bg-green-500'
        : 'bg-gradient-to-r from-purple-600 to-blue-500';

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 transition-colors duration-500 ${backgroundColor}`}
    >
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Log In
        </h2>
        <form onSubmit={handleSubmit}>
          <p className="text-xl font-bold text-center text-white mb-6">
            {userType === 'brand' ? 'Brand Log In' : 'Log In'}
          </p>
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
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
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
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-red-600 text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
          >
            Log In
          </button>
        </form>

        <p className="text-white text-center mt-4">
          Don&#39;t have an account?{' '}
          <Link href="/signup" className="text-yellow-400 hover:underline">
            Sign Up
          </Link>
        </p>

        <p className="text-white text-center mt-2">
          <Link
            href="/forgotpassword"
            className="text-yellow-400 hover:underline"
          >
            Forgot your password?
          </Link>
        </p>
      </div>

      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h3 className="text-xl font-bold mb-4">
              User Created Successfully!
            </h3>
            <p className="mb-4">You can now log in with your new account.</p>
            <button
              onClick={closeDialog}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
