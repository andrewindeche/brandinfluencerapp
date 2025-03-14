import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { formState$, setEmail } from '../rxjs/store';

const LoginForm: React.FC = () => {
  const [userType, setUserType] = useState<
    'brand' | 'influencer' | 'admin' | 'user' | 'unknown'
  >('unknown');

  const [email, setEmailState] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const subscription = formState$.subscribe((state) => {
      setEmailState(state.email);
      setUserType(state.userType);
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

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(password === e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setEmailState('');
      setPassword('');
      setConfirmPassword('');

      switch (userType) {
        case 'brand':
          router.push('/brand');
          break;
        case 'influencer':
          router.push('/influencer');
          break;
        case 'admin':
          router.push('/admin');
          break;
        case 'user':
          router.push('/dashboard');
          break;
        default:
          alert('Unknown user type');
      }
    } else {
      alert('Please enter both email and password');
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
      className={`min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 transition-colors duration-500 ${backgroundColor}`}
    >
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Log In
        </h2>
        <form onSubmit={handleSubmit}>
          <p className="text-xxl font-bold text-center text-yellow-400 mb-6">
            {userType === 'brand' ? (
              <div>
                <h2 className="text-center text-sm font-bold mb-4">
                  Welcome, Log in as Brand!
                </h2>
              </div>
            ) : userType === 'influencer' ? (
              <div>
                <h2 className="text-center text-sm font-bold mb-4">
                  Welcome, Log in as Influencer!
                </h2>
              </div>
            ) : userType === 'admin' ? (
              <div>
                <h2 className="text-center text-sm font-bold mb-4">
                  Admin Dashboard
                </h2>
              </div>
            ) : userType === 'user' ? (
              <div>
                <h2 className="text-center text-sm font-bold mb-4">
                  Welcome, Log in asUser!
                </h2>
              </div>
            ) : (
              <div>
                <h2 className="text-center text-sm font-bold mb-4">
                  &ldquo; &quot;
                </h2>
              </div>
            )}
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
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              placeholder="Enter your password"
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
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 ${
                passwordsMatch ? 'focus:ring-yellow-400' : 'focus:ring-red-400'
              } shadow-lg`}
              placeholder="Confirm your password"
            />
            {!passwordsMatch && (
              <p className="text-red-400 text-sm mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-400 to-red-600 text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
            disabled={!passwordsMatch}
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
    </div>
  );
};

export default LoginForm;
