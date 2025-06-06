import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { authState$, authStore } from '../rxjs/authStore';
import Toast from '../app/components/Toast';
import { useToast } from '../hooks/useToast';
import { useFormValidation } from '@/hooks/useFormValidation';

const Loader: React.FC = () => (
  <div className="flex items-center justify-center space-x-2 h-6 animate-fade-in">
    <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce [animation-delay:0ms]" />
    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:100ms]" />
    <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce [animation-delay:200ms]" />
  </div>
);

function isValidRole(role: unknown): role is 'brand' | 'influencer' | 'admin' {
  return (
    typeof role === 'string' && ['brand', 'influencer', 'admin'].includes(role)
  );
}

const LoginForm: React.FC = () => {
  const [userType, setUserType] = useState<
    'brand' | 'influencer' | 'admin' | 'unknown'
  >('unknown');
  const [email, setEmailState] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setLocalErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const { setErrors } = useFormValidation();
  const router = useRouter();
  const { query, pathname, replace } = router;

  useEffect(() => {
    const subscription = authState$.subscribe((state) => {
      setEmailState(state.email);
      setUserType(state.role || 'unknown');
      setLocalErrors(state.errors);
    });

    if (query.signup === 'success') {
      setShowSuccessDialog(true);

      delete query.signup;
      replace({ pathname, query }, undefined, { shallow: true });
    }

    return () => subscription.unsubscribe();
  }, [query, pathname, replace]);

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setEmailState('');
      setPassword('');
    };

    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () =>
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
  }, [router]);

  useEffect(() => {
    setSubmitting(false);
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmailState(newEmail);
    authStore.setField('email', newEmail);
    if (newEmail.trim() === '') {
      authStore.setField('role', 'unknown');
      setUserType('unknown');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = setErrors(
      ['email', 'password'],
      { email, password },
      { email: 'Email', password: 'Password' },
    );

    if (Object.keys(validationErrors).length > 0) {
      setLocalErrors(validationErrors);
      authStore.setErrors(validationErrors);
      showToast('Please fix the errors in the form.', 'error');

      setTimeout(() => {
        setLocalErrors({});
        authStore.setErrors({});
      }, 4000);

      return;
    }

    setLocalErrors({});
    authStore.setErrors({});
    setSubmitting(true);

    const result = await authStore.login(email.trim(), password.trim());

    if (!result.success) {
      const message =
        ('message' in result ? result.message : undefined) ?? 'Login failed';
      const throttle = 'throttle' in result ? result.throttle : false;
      showToast(message, throttle ? 'warning' : 'error');
      setSubmitting(false);
      return;
    }

    const { role } = result;

    if (isValidRole(role)) {
      setEmailState('');
      setPassword('');

      sessionStorage.setItem('toastMessage', 'Login successful!');
      router.push(`/${role}`);
    } else {
      showToast('Login failed: invalid role.', 'error');
      setSubmitting(false);
    }
  };

  const closeDialog = () => setShowSuccessDialog(false);

  const backgroundColor =
    userType === 'brand'
      ? 'bg-purple-500'
      : userType === 'influencer'
        ? 'bg-gradient-to-r from-pink-600 to-blue-500'
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
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
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
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              userType === 'unknown' || !authStore.getCurrentUser().roleDetected
            }
            className={`w-full text-white py-2 rounded-lg transition-transform transform ${
              submitting ? 'animate-pulse' : 'hover:shadow-lg hover:scale-105'
            }`}
          >
            {submitting ? <Loader /> : 'Log In'}
          </button>

          {errors.server && (
            <p className="text-red-400 text-sm mt-2 text-center">
              {errors.server}
            </p>
          )}
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
        <Toast
          message={toast.message}
          type={toast.type ?? undefined}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default LoginForm;
