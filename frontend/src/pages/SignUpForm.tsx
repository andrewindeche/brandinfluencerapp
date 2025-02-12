import React from 'react';

const SignUpForm: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200 w-96">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Sign Up
        </h2>
        <form>
          <div className="mb-4">
            <label
              className="block text-white text-sm font-semibold mb-2"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              placeholder="Enter your full name"
            />
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-white text-sm font-semibold mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
              placeholder="Confirm your password"
            />
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
          <a href="/login" className="text-yellow-400 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;
