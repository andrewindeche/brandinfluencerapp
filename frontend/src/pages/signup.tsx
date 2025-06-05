import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { authState$, authStore, initialAuthState } from '../rxjs/authStore';
import Toast from '../app/components/Toast';
import { useToast } from '../hooks/useToast';
import { useFormValidation } from '../hooks/useFormValidation';

const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [formState, setFormState] = useState(initialAuthState);
  const { toast, showToast, closeToast } = useToast();
  const { validate } = useFormValidation();

  useEffect(() => {
    let handled = false;
    let timeoutId: string | number | NodeJS.Timeout | undefined;
    const subscription = authState$.subscribe((state) => {
      setFormState(state);
      if (!handled && state.success) {
        handled = true;
        showToast(state.serverMessage || 'Registration successful', 'success');
        authStore.reset();
        timeoutId = setTimeout(
          () => router.push('/login?signup=success'),
          1000,
        );
      } else if (state.serverMessage && !state.success) {
        showToast(state.serverMessage, 'error');
      }
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, showToast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    authStore.setField(id as keyof typeof formState, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, username, password, confirmPassword, role } = formState;

    const { isValid, errors } = validate({
      fields: ['email', 'username', 'password', 'confirmPassword', 'role'],
      values: { email, username, password, confirmPassword, role },
      labels: {
        email: 'Email',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        role: 'User Type',
      },
    });

    authStore.setField('errors', errors);

    if (!isValid) {
      setTimeout(() => {
        authStore.setField('errors', {});
      }, 5000);
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    await authStore.register();
  };

  const {
    email,
    role,
    username,
    password,
    confirmPassword,
    errors,
    submitting,
  } = formState;

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
              value={email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg text-black bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your email"
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
              value={role}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg text-black bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
              value={username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg text-black bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your username"
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
              value={password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg text-black bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your password"
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
              value={confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg text-black bg-white shadow-lg focus:outline-none focus:ring-2 ${
                password === confirmPassword
                  ? 'focus:ring-yellow-400'
                  : 'focus:ring-red-400'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
          >
            {submitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-white text-center mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>

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

export default SignUpForm;
