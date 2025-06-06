import React from 'react';

export function InactivityModal({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm text-center">
        <h2 className="text-xl font-semibold mb-2">Are you still there?</h2>
        <p className="text-gray-600 mb-4">
          You&apos;ll be logged out in 1 minute due to inactivity.
        </p>
        <p className="text-sm text-gray-400">
          Move your mouse or press a key to stay logged in.
        </p>
      </div>
    </div>
  );
}
