import React from 'react';

const PageSpinner: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-700 to-purple-700">
    <svg
      className="animate-spin h-12 w-12 text-white"
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
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 01-8 8z"
      />
    </svg>
  </div>
);

export default PageSpinner;
