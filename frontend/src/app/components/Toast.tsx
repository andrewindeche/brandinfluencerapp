import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === 'error'
      ? 'bg-red-500'
      : type === 'success'
        ? 'bg-green-500'
        : 'bg-gray-500';

  return (
    <div
      className={`fixed top-4 right-4 z-50 text-white px-4 py-3 rounded shadow-lg ${bgColor}`}
    >
      {message}
    </div>
  );
};

export default Toast;
