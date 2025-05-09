import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { formState$, setEmail } from '../rxjs/store';
import Toast from '../app/components/Toast';
import { useToast } from '../hooks/useToast';

const LoginForm: React.FC = () => {
  const [userType, setUserType] = useState<
    'brand' | 'influencer' | 'admin' | 'user' | 'unknown'
  >('unknown');
  const [email, setEmailState] = useState('');
  const [password, setPassword] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const subscription = formState$.subscribe((state) => {
      setEmailState(state.email);
      setUserType(state.role);
    });

    if (router.query.signup === 'success') {
      setShowSuccessDialog(true);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router.query]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setEmailState('');
      setPassword('');

      switch (userType) {
        case 'brand':
        case 'influencer':
        case 'admin':
        case 'user':
          sessionStorage.setItem('toastMessage', 'Login successful!');
          router.push(`/${userType === 'user' ? 'dashboard' : userType}`);
          break;
        default:
          showToast('Unknown user type', 'error');
      }
    } else {
      showToast('Please enter both email and password', 'error');
    }
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
      className={`min-h-screen flex items-center justify-center ${backgroundColor}`}
    >
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Log In
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="text-2xl font-bold text-center text-yellow-400 mb-6">
            <h3 className="text-center text-xl font-bold mb-4">
              {userType === 'brand' && 'Log in as a Brand!'}
              {userType === 'influencer' && 'Log in as an Influencer!'}
              {userType === 'admin' && 'Admin Dashboard'}
              {userType === 'user' && 'Log in as a User!'}
              {userType === 'unknown' && 'Welcome'}
            </h3>
          </div>

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
              value={email}
              onChange={handleEmailChange}
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-white text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-white"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
            disabled={userType === 'unknown' || !email || !password}
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
            <h3 className="text-xl text-black font-bold mb-4">
              User Created Successfully!
            </h3>
            <p className="mb-4 text-black">
              You can now log in with your new account.
            </p>
            <button
              onClick={closeDialog}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default LoginForm;
