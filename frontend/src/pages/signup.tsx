import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
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

  useEffect(() => {
    const subscription = formState$.subscribe((state) => {
      setFormState(state);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    setFormField(id as keyof typeof formState, value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(formState.password === e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordsMatch) {
      alert('Passwords do not match!');
      return;
    }

    await submitSignUpForm(() => {
      setFormState(initialState);
      setConfirmPassword('');
      router.push('/login');
    });
  };

  const { email, userType, username, password, category, bio, location } =
    formState;

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
              <option value="influencer">Influencer</option>
              <option value="brand">Brand</option>
            </select>
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
            {!passwordsMatch && (
              <p className="text-red-400 text-sm mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {userType === 'influencer' && (
            <>
              <div className="mb-4">
                <label
                  className="block text-white text-sm font-semibold mb-2"
                  htmlFor="category"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  placeholder="Enter your category"
                  value={category}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-white text-sm font-semibold mb-2"
                  htmlFor="bio"
                >
                  Bio
                </label>
                <input
                  type="text"
                  id="bio"
                  className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  placeholder="Enter your bio"
                  value={bio}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-white text-sm font-semibold mb-2"
                  htmlFor="location"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  placeholder="Enter your location"
                  value={location}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          {userType === 'brand' && (
            <>
              <div className="mb-4">
                <label
                  className="block text-white text-sm font-semibold mb-2"
                  htmlFor="description"
                >
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  placeholder="Enter your company description"
                  value={formState.description || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-white text-sm font-semibold mb-2"
                  htmlFor="website"
                >
                  Website
                </label>
                <input
                  type="text"
                  id="website"
                  className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  placeholder="Enter your website URL"
                  value={formState.website || ''}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

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
    </div>
  );
};

export default SignUpForm;
